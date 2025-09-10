import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RulesAnalyticsService {
  private readonly logger = new Logger(RulesAnalyticsService.name);

  // Simulasi metrics storage
  private metrics: Map<string, any> = new Map();
  private executionHistory: any[] = [];

  async trackRuleExecution(
    engineName: string,
    facts: any,
    result: any[],
  ): Promise<void> {
    const executionRecord = {
      engineName,
      facts,
      result,
      timestamp: new Date(),
      rulesFired: result.length,
    };

    this.executionHistory.push(executionRecord);

    // Track metrics
    await this.incrementMetric('rules.executed.total', {
      engine: engineName,
      rules_fired: result.length,
    });

    // Track individual rule performance
    result.forEach((event) => {
      this.incrementMetric('rules.fired', {
        engine: engineName,
        rule_type: event.type,
      });
    });

    this.logger.debug(
      `Tracked execution for engine ${engineName} with ${result.length} rules fired`,
    );
  }

  async getDashboardMetrics(): Promise<any> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      topRules: await this.getTopExecutedRules(),
      avgExecutionTime: await this.getAverageExecutionTime(),
      errorRate: await this.getRuleErrorRate(),
      dailyExecution: await this.getDailyExecutionStats(),
      weeklyTrend: await this.getWeeklyTrend(),
      engineStats: await this.getEngineStats(),
      recentExecutions: this.getRecentExecutions(10),
    };
  }

  async getTopExecutedRules(limit: number = 10): Promise<any[]> {
    const ruleCounts = new Map<string, number>();

    this.executionHistory.forEach((record) => {
      record.result.forEach((event) => {
        const key = `${record.engineName}:${event.type}`;
        ruleCounts.set(key, (ruleCounts.get(key) || 0) + 1);
      });
    });

    return Array.from(ruleCounts.entries())
      .map(([rule, count]) => {
        const [engine, type] = rule.split(':');
        return { engine, type, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getAverageExecutionTime(): Promise<number> {
    // Simulasi average execution time
    // Dalam implementasi nyata, ini akan dihitung dari actual execution times
    return Math.random() * 100; // 0-100ms
  }

  async getRuleErrorRate(): Promise<number> {
    // Simulasi error rate
    // Dalam implementasi nyata, ini akan dihitung dari error logs
    return Math.random() * 0.05; // 0-5%
  }

  async getDailyExecutionStats(): Promise<any[]> {
    const dailyStats = new Map<string, number>();

    this.executionHistory.forEach((record) => {
      const date = record.timestamp.toISOString().split('T')[0];
      dailyStats.set(date, (dailyStats.get(date) || 0) + 1);
    });

    return Array.from(dailyStats.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 days
  }

  async getWeeklyTrend(): Promise<any> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeek = this.executionHistory.filter(
      (record) => record.timestamp >= oneWeekAgo,
    ).length;

    const lastWeek = this.executionHistory.filter((record) => {
      const recordDate = record.timestamp;
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return recordDate >= twoWeeksAgo && recordDate < oneWeekAgo;
    }).length;

    const trend = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

    return {
      thisWeek,
      lastWeek,
      trend: Math.round(trend * 100) / 100,
    };
  }

  async getEngineStats(): Promise<any[]> {
    const engineStats = new Map<string, any>();

    this.executionHistory.forEach((record) => {
      const engine = record.engineName;
      if (!engineStats.has(engine)) {
        engineStats.set(engine, {
          name: engine,
          totalExecutions: 0,
          totalRulesFired: 0,
          avgRulesPerExecution: 0,
        });
      }

      const stats = engineStats.get(engine);
      stats.totalExecutions++;
      stats.totalRulesFired += record.rulesFired;
      stats.avgRulesPerExecution =
        stats.totalRulesFired / stats.totalExecutions;
    });

    return Array.from(engineStats.values());
  }

  getRecentExecutions(limit: number = 10): any[] {
    return this.executionHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map((record) => ({
        engine: record.engineName,
        rulesFired: record.rulesFired,
        timestamp: record.timestamp,
        facts: this.sanitizeFacts(record.facts),
      }));
  }

  private async incrementMetric(metricName: string, tags: any): Promise<void> {
    const key = `${metricName}:${JSON.stringify(tags)}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
  }

  private sanitizeFacts(facts: any): any {
    // Remove sensitive information from facts for logging
    const sanitized = { ...facts };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    return sanitized;
  }

  // Method untuk clear metrics (untuk testing)
  clearMetrics(): void {
    this.metrics.clear();
    this.executionHistory = [];
    this.logger.log('Analytics metrics cleared');
  }

  // Method untuk export analytics data
  async exportAnalytics(): Promise<string> {
    const data = {
      metrics: Object.fromEntries(this.metrics),
      executionHistory: this.executionHistory,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }
}
