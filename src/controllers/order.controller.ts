import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { RulesAnalyticsService } from '../services/rules-analytics.service';
import {
  CalculateDiscountDto,
  UserDto,
  OrderDto,
} from '../dto/calculate-discount.dto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly analyticsService: RulesAnalyticsService,
  ) {}

  @Post('calculate-discount')
  async calculateDiscount(@Body() calculateDiscountDto: CalculateDiscountDto) {
    const { user, order } = calculateDiscountDto;

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

    const result = await this.orderService.calculateOrderDiscount(
      userInterface,
      orderInterface,
    );

    // Track analytics
    await this.analyticsService.trackRuleExecution(
      'discount-calculator',
      {
        'user-type': user.type,
        'user-age': user.age,
        'order-amount': order.amount,
        'order-category': order.category,
        'is-first-time-buyer': user.isFirstTimeBuyer,
      },
      result.allMatchingRules,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('available-discounts')
  async getAvailableDiscounts(
    @Query('userType') userType: string,
    @Query('userAge') userAge: number,
    @Query('orderAmount') orderAmount: number,
    @Query('orderCategory') orderCategory: string,
    @Query('isFirstTimeBuyer') isFirstTimeBuyer: boolean = false,
  ) {
    const userInterface = {
      id: 'demo-user',
      type: userType as any,
      age: userAge,
      isFirstTimeBuyer,
      country: 'ID',
      verificationLevel: 3,
      isActive: true,
    };

    const orderInterface = {
      id: 'demo-order',
      amount: orderAmount,
      category: orderCategory as any,
      items: [],
      createdAt: new Date(),
    };

    const discounts = await this.orderService.getAvailableDiscounts(
      userInterface,
      orderInterface,
    );

    return {
      success: true,
      data: {
        user: userInterface,
        order: orderInterface,
        availableDiscounts: discounts,
      },
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
            name: 'Premium User Large Order',
            description: 'Premium user with order > 100k',
            user: { type: 'premium', age: 30, isFirstTimeBuyer: false },
            order: { amount: 150000, category: 'electronics' },
            expectedDiscount: '20%',
          },
          {
            name: 'Senior Healthcare Purchase',
            description: 'Senior citizen buying healthcare items',
            user: { type: 'regular', age: 65, isFirstTimeBuyer: false },
            order: { amount: 80000, category: 'healthcare' },
            expectedDiscount: '15%',
          },
          {
            name: 'First Time Buyer',
            description: 'New customer making first purchase',
            user: { type: 'regular', age: 25, isFirstTimeBuyer: true },
            order: { amount: 50000, category: 'clothing' },
            expectedDiscount: '10%',
          },
          {
            name: 'VIP Member Electronics',
            description: 'VIP member buying expensive electronics',
            user: { type: 'vip', age: 40, isFirstTimeBuyer: false },
            order: { amount: 300000, category: 'electronics' },
            expectedDiscount: '25%',
          },
          {
            name: 'No Discount Scenario',
            description: 'Regular user with small order',
            user: { type: 'regular', age: 30, isFirstTimeBuyer: false },
            order: { amount: 50000, category: 'books' },
            expectedDiscount: '0%',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };
  }
}
