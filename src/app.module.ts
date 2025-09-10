import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Services
import { RulesEngineService } from './services/rules-engine.service';
import { OrderService } from './services/order.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { RulesManagementService } from './services/rules-management.service';
import { RulesAnalyticsService } from './services/rules-analytics.service';

// Controllers
import { OrderController } from './controllers/order.controller';
import { FraudDetectionController } from './controllers/fraud-detection.controller';
import { RulesManagementController } from './controllers/rules-management.controller';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    OrderController,
    FraudDetectionController,
    RulesManagementController,
    AnalyticsController,
  ],
  providers: [
    AppService,
    RulesEngineService,
    OrderService,
    FraudDetectionService,
    RulesManagementService,
    RulesAnalyticsService,
  ],
})
export class AppModule {}
