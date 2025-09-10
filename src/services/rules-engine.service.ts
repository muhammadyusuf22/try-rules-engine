import { Injectable, Logger } from '@nestjs/common';
import { Engine } from 'json-rules-engine';

@Injectable()
export class RulesEngineService {
  private readonly logger = new Logger(RulesEngineService.name);
  private engines: Map<string, Engine> = new Map();

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

  // Tambahan: Hot reload rules
  updateEngine(name: string, rules: any[]): void {
    this.registerEngine(name, rules);
  }

  getEngineNames(): string[] {
    return Array.from(this.engines.keys());
  }

  // Method untuk mendapatkan informasi engine
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

  // Method untuk clear semua engines
  clearAllEngines(): void {
    this.engines.clear();
    this.logger.log('All engines cleared');
  }
}
