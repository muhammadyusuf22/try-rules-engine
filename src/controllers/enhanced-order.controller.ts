import { Controller, Post, Body, Get } from '@nestjs/common';
import { EnhancedOrderService } from '../services/enhanced-order.service';
import { RulesAnalyticsService } from '../services/rules-analytics.service';

@Controller('enhanced-orders')
export class EnhancedOrderController {
  constructor(
    private readonly enhancedOrderService: EnhancedOrderService,
    private readonly analyticsService: RulesAnalyticsService,
  ) {}

  @Post('process-with-actions')
  async processOrderWithActions(@Body() orderData: any) {
    const { user, order } = orderData;

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

    const orderInterface = {
      id: 'demo-order',
      amount: order.amount,
      category: order.category as any,
      items: order.items || [],
      createdAt: new Date(),
    };

    const result = await this.enhancedOrderService.processOrderWithActions(
      userInterface,
      orderInterface,
    );

    // Track analytics
    await this.analyticsService.trackRuleExecution(
      'action-based-discount',
      {
        'user-type': user.type,
        'user-age': user.age,
        'order-amount': order.amount,
        'order-category': order.category,
        'is-first-time-buyer': user.isFirstTimeBuyer,
      },
      result.actionsExecuted,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('process-transaction-with-actions')
  async processTransactionWithActions(@Body() transactionData: any) {
    const { user, transaction } = transactionData;

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

    const result =
      await this.enhancedOrderService.processTransactionWithActions(
        userInterface,
        transactionInterface,
      );

    // Track analytics
    await this.analyticsService.trackRuleExecution(
      'action-based-discount',
      {
        'transaction-amount': transaction.amount,
        'is-different-country': transaction.country !== user.country,
        'is-new-device': transaction.isNewDevice,
        'user-verification-level': user.verificationLevel,
      },
      result.actionsExecuted,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('available-actions')
  async getAvailableActions(@Body() orderData: any) {
    const { user, order } = orderData;

    const userInterface = {
      id: user.id || 'demo-user',
      type: user.type as any,
      age: user.age,
      isFirstTimeBuyer: user.isFirstTimeBuyer,
      country: user.country || 'ID',
      verificationLevel: user.verificationLevel || 3,
      isActive: user.isActive !== undefined ? user.isActive : true,
    };

    const orderInterface = {
      id: 'demo-order',
      amount: order.amount,
      category: order.category as any,
      items: order.items || [],
      createdAt: new Date(),
    };

    const actions = await this.enhancedOrderService.getAvailableActions(
      userInterface,
      orderInterface,
    );

    return {
      success: true,
      data: {
        user: userInterface,
        order: orderInterface,
        availableActions: actions,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('demo-scenarios')
  getDemoScenarios() {
    return {
      success: true,
      data: {
        orderScenarios: [
          {
            name: 'Premium User Large Order with Actions',
            description:
              'Premium user with order > 100k - triggers multiple actions',
            user: {
              type: 'premium',
              age: 30,
              isFirstTimeBuyer: false,
              country: 'ID',
              verificationLevel: 3,
            },
            order: { amount: 150000, category: 'electronics' },
            expectedActions: [
              'applyDiscount',
              'sendNotification',
              'updateLoyaltyPoints',
            ],
            expectedDiscount: '20%',
          },
          {
            name: 'Senior Healthcare Purchase with Actions',
            description:
              'Senior citizen buying healthcare - triggers special actions',
            user: {
              type: 'regular',
              age: 65,
              isFirstTimeBuyer: false,
              country: 'ID',
              verificationLevel: 3,
            },
            order: { amount: 80000, category: 'healthcare' },
            expectedActions: [
              'applyDiscount',
              'sendNotification',
              'updateLoyaltyPoints',
              'addToWishlist',
            ],
            expectedDiscount: '15%',
          },
          {
            name: 'First Time Buyer with Actions',
            description: 'New customer - triggers welcome actions',
            user: {
              type: 'regular',
              age: 25,
              isFirstTimeBuyer: true,
              country: 'ID',
              verificationLevel: 3,
            },
            order: { amount: 50000, category: 'clothing' },
            expectedActions: [
              'applyDiscount',
              'sendWelcomeEmail',
              'createUserProfile',
              'addToNewsletter',
              'sendSMS',
            ],
            expectedDiscount: '10%',
          },
          {
            name: 'VIP Mega Purchase with Actions',
            description:
              'VIP member with large purchase - triggers VIP actions',
            user: {
              type: 'vip',
              age: 40,
              isFirstTimeBuyer: false,
              country: 'ID',
              verificationLevel: 4,
            },
            order: { amount: 600000, category: 'electronics' },
            expectedActions: [
              'applyDiscount',
              'sendNotification',
              'updateLoyaltyPoints',
              'assignPersonalManager',
              'createVIPReport',
              'scheduleFollowUp',
              'addToPriorityQueue',
            ],
            expectedDiscount: '25%',
          },
        ],
        transactionScenarios: [
          {
            name: 'High Risk Transaction with Actions',
            description: 'Very large transaction - triggers blocking actions',
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
            expectedActions: [
              'blockTransaction',
              'notifyCompliance',
              'createAuditLog',
              'sendAlertToManager',
            ],
            expectedResult: 'Blocked',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };
  }
}
