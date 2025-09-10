import { Controller, Post, Body, Get } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { OrderWithoutRulesService } from '../services/order-without-rules.service';
import { FraudDetectionService } from '../services/fraud-detection.service';
import { FraudDetectionWithoutRulesService } from '../services/fraud-detection-without-rules.service';
import {
  CalculateDiscountDto,
  FraudCheckDto,
} from '../dto/calculate-discount.dto';

@Controller('comparison')
export class ComparisonController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderWithoutRulesService: OrderWithoutRulesService,
    private readonly fraudDetectionService: FraudDetectionService,
    private readonly fraudDetectionWithoutRulesService: FraudDetectionWithoutRulesService,
  ) {}

  /**
   * 🔄 COMPARISON: Discount Calculation
   * Menunjukkan perbedaan antara Rules Engine vs Hardcoded If-Else
   */
  @Post('discount-calculation')
  async compareDiscountCalculation(
    @Body() calculateDiscountDto: CalculateDiscountDto,
  ) {
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

    // Execute both approaches
    const [withRulesEngine, withoutRulesEngine] = await Promise.all([
      this.orderService.calculateOrderDiscount(userInterface, orderInterface),
      this.orderWithoutRulesService.calculateOrderDiscount(
        userInterface,
        orderInterface,
      ),
    ]);

    return {
      success: true,
      data: {
        comparison: {
          withRulesEngine: {
            ...withRulesEngine,
            approach: 'Rules Engine',
            benefits: [
              'Business logic separated from code',
              'Easy to modify without deployment',
              'Non-technical users can manage rules',
              'Comprehensive testing possible',
              'Audit trail available',
              'Dynamic rule management',
            ],
          },
          withoutRulesEngine: {
            ...withoutRulesEngine,
            approach: 'Hardcoded If-Else',
            problems: [
              'Business logic mixed with application code',
              'Requires deployment for changes',
              'Only developers can modify rules',
              'Difficult to test individual rules',
              'No audit trail',
              'Code becomes complex and unmaintainable',
            ],
          },
        },
        analysis: {
          sameResult:
            withRulesEngine.discountPercentage ===
            withoutRulesEngine.discountPercentage,
          codeComplexity: {
            withRulesEngine: 'Low - Clean separation of concerns',
            withoutRulesEngine: 'High - Complex nested if-else statements',
          },
          maintainability: {
            withRulesEngine: 'High - Easy to add/modify rules',
            withoutRulesEngine: 'Low - Requires code changes and deployment',
          },
          flexibility: {
            withRulesEngine: 'High - Dynamic rule management',
            withoutRulesEngine: 'Low - Hardcoded logic',
          },
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🔄 COMPARISON: Fraud Detection
   * Menunjukkan perbedaan antara Rules Engine vs Hardcoded If-Else
   */
  @Post('fraud-detection')
  async compareFraudDetection(@Body() fraudCheckDto: FraudCheckDto) {
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

    // Execute both approaches
    const [withRulesEngine, withoutRulesEngine] = await Promise.all([
      this.fraudDetectionService.checkTransaction(
        userInterface,
        transactionInterface,
      ),
      this.fraudDetectionWithoutRulesService.checkTransaction(
        userInterface,
        transactionInterface,
      ),
    ]);

    return {
      success: true,
      data: {
        comparison: {
          withRulesEngine: {
            ...withRulesEngine,
            approach: 'Rules Engine',
            benefits: [
              'Centralized fraud rule management',
              'Easy to add new fraud patterns',
              'A/B testing capabilities',
              'Dynamic threshold adjustment',
              'Comprehensive audit trail',
              'Non-technical fraud analyst can manage rules',
            ],
          },
          withoutRulesEngine: {
            ...withoutRulesEngine,
            approach: 'Hardcoded If-Else',
            problems: [
              'Complex nested if-else statements',
              'Difficult to add new fraud patterns',
              'No A/B testing capabilities',
              'Hardcoded thresholds',
              'No audit trail',
              'Only developers can modify fraud logic',
            ],
          },
        },
        analysis: {
          sameResult:
            withRulesEngine.isBlocked === withoutRulesEngine.isBlocked,
          riskScoreDifference: Math.abs(
            withRulesEngine.riskScore - withoutRulesEngine.riskScore,
          ),
          codeMaintainability: {
            withRulesEngine: 'High - Clean rule definitions',
            withoutRulesEngine: 'Low - Complex nested logic',
          },
          ruleManagement: {
            withRulesEngine: 'Easy - Centralized management',
            withoutRulesEngine: 'Difficult - Scattered in code',
          },
          testing: {
            withRulesEngine: 'Easy - Individual rule testing',
            withoutRulesEngine: 'Difficult - Full function testing required',
          },
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 📊 COMPARISON: Performance Analysis
   * Membandingkan performance antara kedua pendekatan
   */
  @Post('performance-analysis')
  async comparePerformance(@Body() testData: any) {
    const { user, order, transaction } = testData;

    // Performance test untuk discount calculation
    const discountStart = Date.now();
    const discountWithRules = await this.orderService.calculateOrderDiscount(
      user,
      order,
    );
    const discountWithRulesTime = Date.now() - discountStart;

    const discountWithoutStart = Date.now();
    const discountWithoutRules =
      await this.orderWithoutRulesService.calculateOrderDiscount(user, order);
    const discountWithoutRulesTime = Date.now() - discountWithoutStart;

    // Performance test untuk fraud detection
    const fraudStart = Date.now();
    const fraudWithRules = await this.fraudDetectionService.checkTransaction(
      user,
      transaction,
    );
    const fraudWithRulesTime = Date.now() - fraudStart;

    const fraudWithoutStart = Date.now();
    const fraudWithoutRules =
      await this.fraudDetectionWithoutRulesService.checkTransaction(
        user,
        transaction,
      );
    const fraudWithoutRulesTime = Date.now() - fraudWithoutStart;

    return {
      success: true,
      data: {
        performance: {
          discountCalculation: {
            withRulesEngine: {
              executionTime: discountWithRulesTime,
              result: discountWithRules.discountPercentage,
              approach: 'Rules Engine',
            },
            withoutRulesEngine: {
              executionTime: discountWithoutRulesTime,
              result: discountWithoutRules.discountPercentage,
              approach: 'Hardcoded If-Else',
            },
          },
          fraudDetection: {
            withRulesEngine: {
              executionTime: fraudWithRulesTime,
              result: fraudWithRules.riskScore,
              approach: 'Rules Engine',
            },
            withoutRulesEngine: {
              executionTime: fraudWithoutRulesTime,
              result: fraudWithoutRules.riskScore,
              approach: 'Hardcoded If-Else',
            },
          },
        },
        analysis: {
          discountPerformance:
            discountWithRulesTime < discountWithoutRulesTime
              ? 'Rules Engine faster'
              : 'Hardcoded faster',
          fraudPerformance:
            fraudWithRulesTime < fraudWithoutRulesTime
              ? 'Rules Engine faster'
              : 'Hardcoded faster',
          note: 'Rules Engine may be slightly slower due to parsing overhead, but provides much better maintainability and flexibility',
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 📋 COMPARISON: Code Complexity Analysis
   * Menunjukkan perbedaan kompleksitas kode
   */
  @Get('code-complexity')
  async getCodeComplexityAnalysis() {
    return {
      success: true,
      data: {
        analysis: {
          withRulesEngine: {
            approach: 'Rules Engine',
            codeStructure: {
              services: [
                'RulesEngineService - Core engine logic',
                'OrderService - Business logic only',
                'FraudDetectionService - Business logic only',
              ],
              rules: [
                'discount.rules.ts - Clean rule definitions',
                'fraud-detection.rules.ts - Clean rule definitions',
              ],
              controllers: [
                'OrderController - API endpoints',
                'FraudDetectionController - API endpoints',
                'RulesManagementController - Rule management',
              ],
            },
            benefits: [
              'Separation of concerns',
              'Clean, readable code',
              'Easy to test',
              'Easy to maintain',
              'Dynamic rule management',
              'Non-technical user friendly',
            ],
            metrics: {
              linesOfCode: '~200 lines for core logic',
              cyclomaticComplexity: 'Low',
              maintainabilityIndex: 'High',
            },
          },
          withoutRulesEngine: {
            approach: 'Hardcoded If-Else',
            codeStructure: {
              services: [
                'OrderWithoutRulesService - Mixed business logic and application code',
                'FraudDetectionWithoutRulesService - Mixed business logic and application code',
              ],
              problems: [
                'Business logic scattered in if-else statements',
                'No separation of concerns',
                'Difficult to test individual rules',
                'Hard to maintain and extend',
              ],
            },
            problems: [
              'Mixed concerns',
              'Complex nested logic',
              'Difficult to test',
              'Hard to maintain',
              'No dynamic management',
              'Developer dependent',
            ],
            metrics: {
              linesOfCode: '~500+ lines for same functionality',
              cyclomaticComplexity: 'High',
              maintainabilityIndex: 'Low',
            },
          },
        },
        recommendation: {
          useRulesEngine: [
            'Complex business logic (5+ conditions)',
            'Frequently changing rules',
            'Non-technical user management needed',
            'Compliance requirements',
            'A/B testing scenarios',
            'Multi-tenant applications',
          ],
          useHardcoded: [
            'Simple logic (1-2 conditions)',
            'Stable rules that rarely change',
            'Performance-critical paths',
            'Simple validation logic',
          ],
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🎯 COMPARISON: Demo Scenarios
   * Menyediakan demo scenarios untuk perbandingan
   */
  @Get('demo-scenarios')
  async getDemoScenarios() {
    return {
      success: true,
      data: {
        discountScenarios: [
          {
            name: 'Premium User Large Order',
            description: 'Compare Rules Engine vs Hardcoded for premium user',
            user: { type: 'premium', age: 30, isFirstTimeBuyer: false },
            order: { amount: 150000, category: 'electronics' },
            expectedResult: '20% discount',
          },
          {
            name: 'Senior Healthcare Purchase',
            description:
              'Compare both approaches for senior healthcare discount',
            user: { type: 'regular', age: 65, isFirstTimeBuyer: false },
            order: { amount: 80000, category: 'healthcare' },
            expectedResult: '15% discount',
          },
          {
            name: 'Multiple Rules Match',
            description: 'Test conflict resolution in both approaches',
            user: { type: 'premium', age: 65, isFirstTimeBuyer: false },
            order: { amount: 150000, category: 'healthcare' },
            expectedResult: 'Highest priority rule wins',
          },
        ],
        fraudScenarios: [
          {
            name: 'High Risk Transaction',
            description: 'Compare fraud detection for high-risk transaction',
            user: { type: 'regular', age: 30, verificationLevel: 2 },
            transaction: {
              amount: 15000000,
              country: 'ID',
              deviceId: 'device1',
              isNewDevice: false,
            },
            expectedResult: 'Block transaction',
          },
          {
            name: 'Cross Border Transaction',
            description: 'Compare cross-border fraud detection',
            user: { type: 'regular', age: 30, verificationLevel: 2 },
            transaction: {
              amount: 5000000,
              country: 'US',
              deviceId: 'device1',
              isNewDevice: false,
            },
            expectedResult: 'Block transaction',
          },
          {
            name: 'Normal Transaction',
            description: 'Compare normal transaction processing',
            user: { type: 'premium', age: 35, verificationLevel: 4 },
            transaction: {
              amount: 500000,
              country: 'ID',
              deviceId: 'device1',
              isNewDevice: false,
            },
            expectedResult: 'Approve transaction',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };
  }
}
