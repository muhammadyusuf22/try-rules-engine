import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { FraudDetectionService } from '../services/fraud-detection.service';
import { RulesAnalyticsService } from '../services/rules-analytics.service';
import {
  FraudCheckDto,
  UserDto,
  TransactionDto,
} from '../dto/calculate-discount.dto';

@Controller('fraud-detection')
export class FraudDetectionController {
  constructor(
    private readonly fraudDetectionService: FraudDetectionService,
    private readonly analyticsService: RulesAnalyticsService,
  ) {}

  @Post('check-transaction')
  async checkTransaction(@Body() fraudCheckDto: FraudCheckDto) {
    const { user, transaction } = fraudCheckDto;

    // Convert DTO to interface
    const userInterface = {
      id: user.id || 'demo-user',
      type: user.type as any,
      age: user.age,
      isFirstTimeBuyer: user.isFirstTimeBuyer,
      country: user.country || 'ID',
      verificationLevel: user.verificationLevel || 3,
      isActive: user.isActive !== undefined ? user.isActive : true,
    };

    const transactionInterface = {
      id: 'demo-transaction',
      amount: transaction.amount,
      country: transaction.country,
      deviceId: transaction.deviceId,
      isNewDevice: transaction.isNewDevice,
      createdAt: new Date(),
    };

    const result = await this.fraudDetectionService.checkTransaction(
      userInterface,
      transactionInterface,
    );

    // Track analytics
    await this.analyticsService.trackRuleExecution(
      'fraud-detection',
      {
        'transaction-amount': transaction.amount,
        'is-different-country': transaction.country !== user.country,
        'is-new-device': transaction.isNewDevice,
        'user-verification-level': user.verificationLevel,
      },
      result.allTriggers,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('risk-assessment')
  async getRiskAssessment(@Body() fraudCheckDto: FraudCheckDto) {
    const { user, transaction } = fraudCheckDto;

    // Convert DTO to interface
    const userInterface = {
      id: user.id || 'demo-user',
      type: user.type as any,
      age: user.age,
      isFirstTimeBuyer: user.isFirstTimeBuyer,
      country: user.country || 'ID',
      verificationLevel: user.verificationLevel || 3,
      isActive: user.isActive !== undefined ? user.isActive : true,
    };

    const transactionInterface = {
      id: 'demo-transaction',
      amount: transaction.amount,
      country: transaction.country,
      deviceId: transaction.deviceId,
      isNewDevice: transaction.isNewDevice,
      createdAt: new Date(),
    };

    const result = await this.fraudDetectionService.getRiskAssessment(
      userInterface,
      transactionInterface,
    );

    // Track analytics
    await this.analyticsService.trackRuleExecution(
      'fraud-detection',
      {
        'transaction-amount': transaction.amount,
        'is-different-country': transaction.country !== user.country,
        'is-new-device': transaction.isNewDevice,
        'user-verification-level': user.verificationLevel,
      },
      result.riskFactors,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('demo-scenarios')
  getDemoScenarios() {
    return {
      success: true,
      data: {
        scenarios: [
          {
            name: 'High Risk Transaction',
            description: 'Very large amount transaction',
            user: {
              type: 'regular',
              age: 30,
              isFirstTimeBuyer: false,
              country: 'ID',
              verificationLevel: 2,
            },
            transaction: {
              amount: 15000000,
              country: 'ID',
              deviceId: 'device1',
              isNewDevice: false,
            },
            expectedAction: 'block',
          },
          {
            name: 'Suspicious Pattern',
            description: 'High frequency transactions',
            user: {
              type: 'regular',
              age: 30,
              isFirstTimeBuyer: false,
              country: 'ID',
              verificationLevel: 3,
            },
            transaction: {
              amount: 2000000,
              country: 'ID',
              deviceId: 'device1',
              isNewDevice: false,
            },
            expectedAction: 'review',
          },
          {
            name: 'Cross Border Transaction',
            description:
              'Transaction from different country with low verification',
            user: {
              type: 'regular',
              age: 30,
              isFirstTimeBuyer: false,
              country: 'ID',
              verificationLevel: 2,
            },
            transaction: {
              amount: 5000000,
              country: 'US',
              deviceId: 'device1',
              isNewDevice: false,
            },
            expectedAction: 'block',
          },
          {
            name: 'New Device Transaction',
            description: 'Large transaction from new device',
            user: {
              type: 'premium',
              age: 35,
              isFirstTimeBuyer: false,
              country: 'ID',
              verificationLevel: 4,
            },
            transaction: {
              amount: 2000000,
              country: 'ID',
              deviceId: 'new-device',
              isNewDevice: true,
            },
            expectedAction: 'verify',
          },
          {
            name: 'Normal Transaction',
            description: 'Regular transaction with no risk factors',
            user: {
              type: 'premium',
              age: 35,
              isFirstTimeBuyer: false,
              country: 'ID',
              verificationLevel: 4,
            },
            transaction: {
              amount: 500000,
              country: 'ID',
              deviceId: 'device1',
              isNewDevice: false,
            },
            expectedAction: 'approve',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };
  }
}
