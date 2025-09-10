import { Injectable, Logger } from '@nestjs/common';
import { EnhancedRulesEngineService } from './enhanced-rules-engine.service';
import { actionBasedRules } from '../rules/action-based.rules';

@Injectable()
export class EnhancedOrderService {
  private readonly logger = new Logger(EnhancedOrderService.name);

  constructor(private enhancedRulesEngine: EnhancedRulesEngineService) {
    this.enhancedRulesEngine.registerEngine(
      'action-based-discount',
      actionBasedRules,
    );
  }

  async processOrderWithActions(user: any, order: any): Promise<any> {
    this.logger.log('Processing order with action-based rules...');

    const facts = {
      'user-type': user.type,
      'user-age': user.age,
      'order-amount': order.amount,
      'order-category': order.category,
      'is-first-time-buyer': user.isFirstTimeBuyer,
    };

    const context = {
      user,
      order,
      timestamp: new Date(),
    };

    const result = await this.enhancedRulesEngine.executeRulesWithActions(
      'action-based-discount',
      facts,
      context,
    );

    // Process results
    const discountEvents = result.events.filter(
      (e) => e.params.action === 'applyDiscount',
    );
    const bestDiscount = this.selectBestDiscount(discountEvents, order.amount);

    return {
      originalAmount: order.amount,
      discountAmount: bestDiscount.amount || 0,
      discountPercentage: bestDiscount.percentage || 0,
      finalAmount: order.amount - (bestDiscount.amount || 0),
      appliedRule: bestDiscount.reason || 'No discount applied',
      actionsExecuted: result.actionResults,
      totalActions: result.totalActions,
      executionTime: result.executionTime,
      allMatchingRules: result.events.map((event) => ({
        type: event.type,
        action: event.params.action,
        percentage: event.params.percentage || 0,
        reason: event.params.reason,
        priority: event.params.priority || 0,
      })),
      success: true,
    };
  }

  async processTransactionWithActions(
    user: any,
    transaction: any,
  ): Promise<any> {
    this.logger.log('Processing transaction with action-based rules...');

    const facts = {
      'user-type': user.type,
      'user-age': user.age,
      'transaction-amount': transaction.amount,
      'is-different-country': transaction.country !== user.country,
      'user-verification-level': user.verificationLevel,
      'is-new-device': transaction.isNewDevice,
    };

    const context = {
      user,
      transaction,
      timestamp: new Date(),
    };

    const result = await this.enhancedRulesEngine.executeRulesWithActions(
      'action-based-discount',
      facts,
      context,
    );

    // Process results
    const blockEvents = result.events.filter(
      (e) => e.params.action === 'blockTransaction',
    );
    const isBlocked = blockEvents.length > 0;
    const riskScore = Math.max(
      ...result.events.map((e) => e.params.priority || 0),
    );

    return {
      isBlocked,
      riskScore,
      actionsExecuted: result.actionResults,
      totalActions: result.totalActions,
      executionTime: result.executionTime,
      allTriggers: result.events.map((event) => ({
        type: event.type,
        action: event.params.action,
        reason: event.params.reason,
        riskScore: event.params.priority || 0,
      })),
      success: true,
    };
  }

  private selectBestDiscount(events: any[], orderAmount: number) {
    if (events.length === 0) {
      return { amount: 0, percentage: 0, reason: 'No discount applied' };
    }

    const sortedEvents = events
      .map((event) => ({
        ...event.params,
        amount: (orderAmount * event.params.percentage) / 100,
      }))
      .sort((a, b) => b.priority - a.priority || b.amount - a.amount);

    return sortedEvents[0];
  }

  async getAvailableActions(user: any, order: any): Promise<any[]> {
    const facts = {
      'user-type': user.type,
      'user-age': user.age,
      'order-amount': order.amount,
      'order-category': order.category,
      'is-first-time-buyer': user.isFirstTimeBuyer,
    };

    const events = await this.enhancedRulesEngine.executeRules(
      'action-based-discount',
      facts,
    );

    return events.map((event) => ({
      type: event.type,
      action: event.params.action,
      percentage: event.params.percentage || 0,
      reason: event.params.reason,
      priority: event.params.priority || 0,
      actionParams: event.params.actionParams || {},
    }));
  }
}
