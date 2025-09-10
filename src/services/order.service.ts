import { Injectable } from '@nestjs/common';
import { RulesEngineService } from './rules-engine.service';
import { discountRules } from '../rules/discount.rules';
import { User, Order } from '../interfaces/user.interface';

@Injectable()
export class OrderService {
  constructor(private rulesEngine: RulesEngineService) {
    // Register rules engine saat service init
    this.rulesEngine.registerEngine('discount-calculator', discountRules);
  }

  async calculateOrderDiscount(user: User, order: Order): Promise<any> {
    const facts = {
      'user-type': user.type,
      'user-age': user.age,
      'order-amount': order.amount,
      'order-category': order.category,
      'is-first-time-buyer': user.isFirstTimeBuyer,
    };

    const events = await this.rulesEngine.executeRules(
      'discount-calculator',
      facts,
    );

    // Conflict resolution: pilih discount tertinggi
    let bestDiscount = this.selectBestDiscount(events, order.amount);

    return {
      originalAmount: order.amount,
      discountAmount: bestDiscount.amount,
      discountPercentage: bestDiscount.percentage,
      finalAmount: order.amount - bestDiscount.amount,
      appliedRule: bestDiscount.reason,
      availableDiscounts: events.length,
      allMatchingRules: events.map((event) => ({
        type: event.type,
        percentage: event.params.percentage,
        reason: event.params.reason,
        priority: event.params.priority,
      })),
    };
  }

  private selectBestDiscount(events: any[], orderAmount: number) {
    if (events.length === 0) {
      return { amount: 0, percentage: 0, reason: 'No discount applied' };
    }

    // Sort by priority first, then by discount amount
    const sortedEvents = events
      .map((event) => ({
        ...event.params,
        amount: (orderAmount * event.params.percentage) / 100,
      }))
      .sort((a, b) => b.priority - a.priority || b.amount - a.amount);

    return sortedEvents[0];
  }

  // Method untuk mendapatkan semua available discounts
  async getAvailableDiscounts(user: User, order: Order): Promise<any[]> {
    const facts = {
      'user-type': user.type,
      'user-age': user.age,
      'order-amount': order.amount,
      'order-category': order.category,
      'is-first-time-buyer': user.isFirstTimeBuyer,
    };

    const events = await this.rulesEngine.executeRules(
      'discount-calculator',
      facts,
    );

    return events.map((event) => ({
      type: event.type,
      percentage: event.params.percentage,
      reason: event.params.reason,
      priority: event.params.priority,
      discountAmount: (order.amount * event.params.percentage) / 100,
    }));
  }
}
