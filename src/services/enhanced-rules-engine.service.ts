import { Injectable, Logger } from '@nestjs/common';
import { Engine } from 'json-rules-engine';
import { ActionExecutorService } from './action-executor.service';

@Injectable()
export class EnhancedRulesEngineService {
  private readonly logger = new Logger(EnhancedRulesEngineService.name);
  private engines: Map<string, Engine> = new Map();

  constructor(private actionExecutor: ActionExecutorService) {}

  async executeRulesWithActions(
    engineName: string,
    facts: any,
    context: any,
  ): Promise<any> {
    const engine = this.engines.get(engineName);
    if (!engine) {
      throw new Error(`Engine ${engineName} not found`);
    }

    const startTime = Date.now();
    const { events } = await engine.run(facts);
    const executionTime = Date.now() - startTime;

    this.logger.log(`Engine ${engineName} executed in ${executionTime}ms`);

    // Execute actions for each event
    const actionResults: any[] = [];
    for (const event of events) {
      if (event.params?.action) {
        const actionResult = await this.actionExecutor.executeAction(
          event.params.action,
          event.params.actionParams || {},
          context,
        );
        actionResults.push({
          event: event,
          actionResult: actionResult,
        });
      }
    }

    return {
      events,
      actionResults,
      executionTime,
      totalActions: actionResults.length,
      success: true,
    };
  }

  async executeRules(engineName: string, facts: any): Promise<any[]> {
    const engine = this.engines.get(engineName);
    if (!engine) {
      throw new Error(`Engine ${engineName} not found`);
    }

    const startTime = Date.now();
    const { events } = await engine.run(facts);
    const executionTime = Date.now() - startTime;

    this.logger.log(`Engine ${engineName} executed in ${executionTime}ms`);
    return events;
  }

  registerEngine(name: string, rules: any[]): void {
    const engine = new Engine();
    rules.forEach((rule) => {
      engine.addRule(rule);
    });
    this.engines.set(name, engine);
    this.logger.log(`Engine ${name} registered with ${rules.length} rules`);
  }

  updateEngine(name: string, rules: any[]): void {
    this.registerEngine(name, rules);
  }

  getEngineNames(): string[] {
    return Array.from(this.engines.keys());
  }

  getEngineInfo(name: string): any {
    const engine = this.engines.get(name);
    if (!engine) {
      return null;
    }

    return {
      name,
      rulesCount: (engine as any).rules?.length || 0,
      registeredAt: new Date().toISOString(),
    };
  }

  clearAllEngines(): void {
    this.engines.clear();
    this.logger.log('All engines cleared');
  }
}
