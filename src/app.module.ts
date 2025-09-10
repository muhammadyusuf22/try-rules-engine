import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Services
import { RulesEngineService } from './services/rules-engine.service';
import { OrderService } from './services/order.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { RulesManagementService } from './services/rules-management.service';
import { RulesAnalyticsService } from './services/rules-analytics.service';
import { OrderWithoutRulesService } from './services/order-without-rules.service';
import { FraudDetectionWithoutRulesService } from './services/fraud-detection-without-rules.service';
import { ActionExecutorService } from './services/action-executor.service';
import { EnhancedRulesEngineService } from './services/enhanced-rules-engine.service';
import { EnhancedOrderService } from './services/enhanced-order.service';

// Controllers
import { OrderController } from './controllers/order.controller';
import { FraudDetectionController } from './controllers/fraud-detection.controller';
import { RulesManagementController } from './controllers/rules-management.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { ComparisonController } from './controllers/comparison.controller';
import { EnhancedOrderController } from './controllers/enhanced-order.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    OrderController,
    FraudDetectionController,
    RulesManagementController,
    AnalyticsController,
    ComparisonController,
    EnhancedOrderController,
  ],
  providers: [
    AppService,
    RulesEngineService,
    OrderService,
    FraudDetectionService,
    RulesManagementService,
    RulesAnalyticsService,
    OrderWithoutRulesService,
    FraudDetectionWithoutRulesService,
    ActionExecutorService,
    EnhancedRulesEngineService,
    EnhancedOrderService,
  ],
})
export class AppModule {}
