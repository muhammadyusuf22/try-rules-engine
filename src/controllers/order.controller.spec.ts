import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../services/order.service';
import { RulesAnalyticsService } from '../services/rules-analytics.service';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;
  let analyticsService: RulesAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            calculateOrderDiscount: jest.fn(),
            getAvailableDiscounts: jest.fn(),
          },
        },
        {
          provide: RulesAnalyticsService,
          useValue: {
            trackRuleExecution: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
    analyticsService = module.get<RulesAnalyticsService>(RulesAnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should calculate discount', async () => {
    const calculateDiscountDto = {
      user: {
        type: 'premium',
        age: 30,
        isFirstTimeBuyer: false,
        country: 'ID',
        verificationLevel: 3,
      },
      order: {
        amount: 150000,
        category: 'electronics',
      },
    };

    const mockResult = {
      originalAmount: 150000,
      discountAmount: 30000,
      discountPercentage: 20,
      finalAmount: 120000,
      appliedRule: 'Premium member large order',
      availableDiscounts: 1,
      allMatchingRules: [],
    };

    jest
      .spyOn(orderService, 'calculateOrderDiscount')
      .mockResolvedValue(mockResult);
    jest.spyOn(analyticsService, 'trackRuleExecution').mockResolvedValue();

    const result = await controller.calculateDiscount(calculateDiscountDto);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResult);
    expect(orderService.calculateOrderDiscount).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'demo-user',
        type: 'premium',
        age: 30,
        isFirstTimeBuyer: false,
        country: 'ID',
        verificationLevel: 3,
        isActive: true,
      }),
      expect.objectContaining({
        id: 'demo-order',
        amount: 150000,
        category: 'electronics',
        items: [],
        createdAt: expect.any(Date),
      }),
    );
    expect(analyticsService.trackRuleExecution).toHaveBeenCalled();
  });

  it('should get available discounts', async () => {
    const mockDiscounts = [
      {
        type: 'premium-discount',
        percentage: 20,
        reason: 'Premium member large order',
        priority: 10,
        discountAmount: 30000,
      },
    ];

    jest
      .spyOn(orderService, 'getAvailableDiscounts')
      .mockResolvedValue(mockDiscounts);

    const result = await controller.getAvailableDiscounts(
      'premium',
      30,
      150000,
      'electronics',
      false,
    );

    expect(result.success).toBe(true);
    expect(result.data.availableDiscounts).toEqual(mockDiscounts);
  });

  it('should get demo scenarios', async () => {
    const result = await controller.getDemoScenarios();

    expect(result.success).toBe(true);
    expect(result.data.scenarios).toBeDefined();
    expect(Array.isArray(result.data.scenarios)).toBe(true);
    expect(result.data.scenarios.length).toBeGreaterThan(0);
  });
});
