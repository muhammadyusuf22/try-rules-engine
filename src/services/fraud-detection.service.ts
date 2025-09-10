import { Injectable } from '@nestjs/common';
import { RulesEngineService } from './rules-engine.service';
import { fraudRules } from '../rules/fraud-detection.rules';
import {
  User,
  Transaction,
  UserTransactionStats,
} from '../interfaces/user.interface';

@Injectable()
export class FraudDetectionService {
  constructor(private rulesEngine: RulesEngineService) {
    this.rulesEngine.registerEngine('fraud-detection', fraudRules);
  }

  async checkTransaction(user: User, transaction: Transaction): Promise<any> {
    const userStats = await this.getUserTransactionStats(user.id);

    const facts = {
      'transaction-amount': transaction.amount,
      'transaction-count-today': userStats.countToday,
      'total-amount-today': userStats.totalToday,
      'is-different-country': transaction.country !== user.country,
      'user-verification-level': user.verificationLevel,
      'is-new-device': transaction.isNewDevice,
    };

    const events = await this.rulesEngine.executeRules(
      'fraud-detection',
      facts,
    );

    return {
      isBlocked: events.some((e) => e.params.action === 'block'),
      requiresApproval: events.some((e) => e.params.required_approvals > 0),
      riskScore: Math.max(...events.map((e) => e.params.risk_score || 0)),
      reasons: events.map((e) => e.params.reason),
      recommendedAction: this.getRecommendedAction(events),
      allTriggers: events.map((event) => ({
        type: event.type,
        action: event.params.action,
        reason: event.params.reason,
        riskScore: event.params.risk_score,
        requiredApprovals: event.params.required_approvals,
      })),
    };
  }

  private async getUserTransactionStats(
    userId: string,
  ): Promise<UserTransactionStats> {
    // Simulasi data dari database
    // Dalam implementasi nyata, ini akan query ke database
    return {
      countToday: Math.floor(Math.random() * 15), // 0-14 transactions
      totalToday: Math.floor(Math.random() * 10000000), // 0-10M
      lastTransactionDate: new Date(),
    };
  }

  private getRecommendedAction(events: any[]): string {
    if (events.length === 0) {
      return 'approve';
    }

    const blockedEvents = events.filter((e) => e.params.action === 'block');
    if (blockedEvents.length > 0) {
      return 'block';
    }

    const reviewEvents = events.filter((e) => e.params.action === 'review');
    if (reviewEvents.length > 0) {
      return 'review';
    }

    const verifyEvents = events.filter((e) => e.params.action === 'verify');
    if (verifyEvents.length > 0) {
      return 'verify';
    }

    const monitorEvents = events.filter((e) => e.params.action === 'monitor');
    if (monitorEvents.length > 0) {
      return 'monitor';
    }

    return 'approve';
  }

  // Method untuk mendapatkan risk assessment detail
  async getRiskAssessment(user: User, transaction: Transaction): Promise<any> {
    const userStats = await this.getUserTransactionStats(user.id);

    const facts = {
      'transaction-amount': transaction.amount,
      'transaction-count-today': userStats.countToday,
      'total-amount-today': userStats.totalToday,
      'is-different-country': transaction.country !== user.country,
      'user-verification-level': user.verificationLevel,
      'is-new-device': transaction.isNewDevice,
    };

    const events = await this.rulesEngine.executeRules(
      'fraud-detection',
      facts,
    );

    const riskFactors = events.map((event) => ({
      factor: event.type,
      description: event.params.reason,
      riskScore: event.params.risk_score,
      action: event.params.action,
    }));

    const overallRiskScore = Math.max(
      ...events.map((e) => e.params.risk_score || 0),
    );

    return {
      overallRiskScore,
      riskLevel: this.getRiskLevel(overallRiskScore),
      riskFactors,
      recommendedAction: this.getRecommendedAction(events),
      userStats,
      transactionDetails: {
        amount: transaction.amount,
        country: transaction.country,
        isNewDevice: transaction.isNewDevice,
        isDifferentCountry: transaction.country !== user.country,
      },
    };
  }

  private getRiskLevel(riskScore: number): string {
    if (riskScore >= 80) return 'HIGH';
    if (riskScore >= 50) return 'MEDIUM';
    if (riskScore >= 20) return 'LOW';
    return 'VERY_LOW';
  }
}
