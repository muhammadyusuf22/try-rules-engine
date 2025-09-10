import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { RulesEngineService } from './rules-engine.service';
import { User, Order } from '../interfaces/user.interface';

describe('OrderService', () => {
  let service: OrderService;
  let rulesEngineService: RulesEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: RulesEngineService,
          useValue: {
            registerEngine: jest.fn(),
            executeRules: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    rulesEngineService = module.get<RulesEngineService>(RulesEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate discount for premium user with large order', async () => {
    const user: User = {
      id: '1',
      type: 'premium',
      age: 30,
      isFirstTimeBuyer: false,
      country: 'ID',
      verificationLevel: 3,
      isActive: true,
    };

    const order: Order = {
      id: '1',
      amount: 150000,
      category: 'electronics',
      items: [],
      createdAt: new Date(),
    };

    const mockEvents = [
      {
        type: 'premium-discount',
        params: {
          percentage: 20,
          priority: 10,
          reason: 'Premium member large order',
        },
      },
    ];

    jest
      .spyOn(rulesEngineService, 'executeRules')
      .mockResolvedValue(mockEvents);

    const result = await service.calculateOrderDiscount(user, order);

    expect(result.originalAmount).toBe(150000);
    expect(result.discountPercentage).toBe(20);
    expect(result.discountAmount).toBe(30000);
    expect(result.finalAmount).toBe(120000);
    expect(result.appliedRule).toBe('Premium member large order');
    expect(result.availableDiscounts).toBe(1);
  });

  it('should select best discount when multiple rules match', async () => {
    const user: User = {
      id: '1',
      type: 'premium',
      age: 65,
      isFirstTimeBuyer: false,
      country: 'ID',
      verificationLevel: 3,
      isActive: true,
    };

    const order: Order = {
      id: '1',
      amount: 150000,
      category: 'healthcare',
      items: [],
      createdAt: new Date(),
    };

    const mockEvents = [
      {
        type: 'premium-discount',
        params: {
          percentage: 20,
          priority: 10,
          reason: 'Premium member large order',
        },
      },
      {
        type: 'senior-healthcare-discount',
        params: {
          percentage: 15,
          priority: 8,
          reason: 'Senior healthcare discount',
        },
      },
    ];

    jest
      .spyOn(rulesEngineService, 'executeRules')
      .mockResolvedValue(mockEvents);

    const result = await service.calculateOrderDiscount(user, order);

    // Should select premium discount (higher priority)
    expect(result.discountPercentage).toBe(20);
    expect(result.appliedRule).toBe('Premium member large order');
  });

  it('should return no discount when no rules match', async () => {
    const user: User = {
      id: '1',
      type: 'regular',
      age: 30,
      isFirstTimeBuyer: false,
      country: 'ID',
      verificationLevel: 3,
      isActive: true,
    };

    const order: Order = {
      id: '1',
      amount: 50000,
      category: 'books',
      items: [],
      createdAt: new Date(),
    };

    jest.spyOn(rulesEngineService, 'executeRules').mockResolvedValue([]);

    const result = await service.calculateOrderDiscount(user, order);

    expect(result.discountPercentage).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.finalAmount).toBe(50000);
    expect(result.appliedRule).toBe('No discount applied');
  });

  it('should get available discounts', async () => {
    const user: User = {
      id: '1',
      type: 'premium',
      age: 30,
      isFirstTimeBuyer: false,
      country: 'ID',
      verificationLevel: 3,
      isActive: true,
    };

    const order: Order = {
      id: '1',
      amount: 150000,
      category: 'electronics',
      items: [],
      createdAt: new Date(),
    };

    const mockEvents = [
      {
        type: 'premium-discount',
        params: {
          percentage: 20,
          priority: 10,
          reason: 'Premium member large order',
        },
      },
      {
        type: 'electronics-discount',
        params: {
          percentage: 12,
          priority: 7,
          reason: 'Electronics bulk purchase discount',
        },
      },
    ];

    jest
      .spyOn(rulesEngineService, 'executeRules')
      .mockResolvedValue(mockEvents);

    const discounts = await service.getAvailableDiscounts(user, order);

    expect(discounts).toHaveLength(2);
    expect(discounts[0].type).toBe('premium-discount');
    expect(discounts[0].percentage).toBe(20);
    expect(discounts[1].type).toBe('electronics-discount');
    expect(discounts[1].percentage).toBe(12);
  });
});
