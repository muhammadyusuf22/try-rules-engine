import { Controller, Get, Post, Query } from '@nestjs/common';
import { RulesAnalyticsService } from '../services/rules-analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: RulesAnalyticsService) {}

  @Get('dashboard')
  async getDashboard() {
    const metrics = await this.analyticsService.getDashboardMetrics();

    return {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('top-rules')
  async getTopRules(@Query('limit') limit: number = 10) {
    const topRules = await this.analyticsService.getTopExecutedRules(limit);

    return {
      success: true,
      data: {
        topRules,
        limit,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('engine-stats')
  async getEngineStats() {
    const engineStats = await this.analyticsService.getEngineStats();

    return {
      success: true,
      data: {
        engineStats,
        totalEngines: engineStats.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('execution-trend')
  async getExecutionTrend() {
    const weeklyTrend = await this.analyticsService.getWeeklyTrend();
    const dailyStats = await this.analyticsService.getDailyExecutionStats();

    return {
      success: true,
      data: {
        weeklyTrend,
        dailyStats,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('recent-executions')
  async getRecentExecutions(@Query('limit') limit: number = 10) {
    const recentExecutions = this.analyticsService.getRecentExecutions(limit);

    return {
      success: true,
      data: {
        recentExecutions,
        limit,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('export')
  async exportAnalytics() {
    const exportedData = await this.analyticsService.exportAnalytics();

    return {
      success: true,
      data: {
        exportedData,
        exportedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('clear')
  async clearAnalytics() {
    this.analyticsService.clearMetrics();

    return {
      success: true,
      message: 'Analytics data cleared successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  async getHealth() {
    const metrics = await this.analyticsService.getDashboardMetrics();

    return {
      success: true,
      data: {
        status: 'healthy',
        totalExecutions: metrics.dailyExecution.reduce(
          (sum, day) => sum + day.count,
          0,
        ),
        avgExecutionTime: metrics.avgExecutionTime,
        errorRate: metrics.errorRate,
        engines: metrics.engineStats.length,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
