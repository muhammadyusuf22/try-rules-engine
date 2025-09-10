import { Injectable, Logger } from '@nestjs/common';
import { RulesEngineService } from './rules-engine.service';

@Injectable()
export class RulesManagementService {
  private readonly logger = new Logger(RulesManagementService.name);

  constructor(private rulesEngine: RulesEngineService) {}

  // Simulasi database untuk menyimpan rules
  private rulesDatabase: Map<string, any[]> = new Map();

  async loadRulesFromDatabase(): Promise<void> {
    // Simulasi loading rules dari database
    // Dalam implementasi nyata, ini akan query ke database
    this.logger.log('Loading rules from database...');

    // Simulasi rules yang tersimpan di database
    const storedRules = {
      'discount-calculator': [
        {
          conditions: {
            all: [
              { fact: 'user-type', operator: 'equal', value: 'premium' },
              {
                fact: 'order-amount',
                operator: 'greaterThanInclusive',
                value: 100000,
              },
            ],
          },
          event: {
            type: 'premium-discount',
            params: {
              percentage: 20,
              priority: 10,
              reason: 'Premium member large order',
            },
          },
        },
      ],
      'fraud-detection': [
        {
          conditions: {
            any: [
              {
                fact: 'transaction-amount',
                operator: 'greaterThan',
                value: 10000000,
              },
            ],
          },
          event: {
            type: 'high-risk-transaction',
            params: {
              action: 'block',
              reason: 'Very high amount transaction',
              risk_score: 90,
              required_approvals: 2,
            },
          },
        },
      ],
    };

    // Register engines dengan rules dari database
    Object.entries(storedRules).forEach(([engineName, rules]) => {
      this.rulesEngine.registerEngine(engineName, rules);
      this.rulesDatabase.set(engineName, rules);
    });

    this.logger.log(
      `Loaded ${Object.keys(storedRules).length} rule engines from database`,
    );
  }

  async updateRule(
    rulesetName: string,
    ruleId: string,
    newRule: any,
  ): Promise<void> {
    this.logger.log(`Updating rule ${ruleId} in ruleset ${rulesetName}`);

    // Simulasi update di database
    const currentRules = this.rulesDatabase.get(rulesetName) || [];
    const ruleIndex = currentRules.findIndex((rule) => rule.id === ruleId);

    if (ruleIndex !== -1) {
      currentRules[ruleIndex] = {
        ...newRule,
        id: ruleId,
        updatedAt: new Date(),
      };
      this.rulesDatabase.set(rulesetName, currentRules);

      // Hot reload the entire ruleset
      await this.reloadRuleset(rulesetName);

      // Log the change for audit
      await this.logRuleChange(rulesetName, ruleId, newRule);
    } else {
      throw new Error(`Rule ${ruleId} not found in ruleset ${rulesetName}`);
    }
  }

  async addRule(rulesetName: string, newRule: any): Promise<void> {
    this.logger.log(`Adding new rule to ruleset ${rulesetName}`);

    const currentRules = this.rulesDatabase.get(rulesetName) || [];
    const ruleWithId = {
      ...newRule,
      id: this.generateRuleId(),
      createdAt: new Date(),
    };
    currentRules.push(ruleWithId);

    this.rulesDatabase.set(rulesetName, currentRules);

    // Hot reload the entire ruleset
    await this.reloadRuleset(rulesetName);

    this.logger.log(`Rule added successfully with ID: ${ruleWithId.id}`);
  }

  async removeRule(rulesetName: string, ruleId: string): Promise<void> {
    this.logger.log(`Removing rule ${ruleId} from ruleset ${rulesetName}`);

    const currentRules = this.rulesDatabase.get(rulesetName) || [];
    const filteredRules = currentRules.filter((rule) => rule.id !== ruleId);

    if (filteredRules.length === currentRules.length) {
      throw new Error(`Rule ${ruleId} not found in ruleset ${rulesetName}`);
    }

    this.rulesDatabase.set(rulesetName, filteredRules);

    // Hot reload the entire ruleset
    await this.reloadRuleset(rulesetName);

    this.logger.log(`Rule ${ruleId} removed successfully`);
  }

  async reloadRuleset(rulesetName: string): Promise<void> {
    this.logger.log(`Reloading ruleset: ${rulesetName}`);

    const rules = this.rulesDatabase.get(rulesetName);
    if (rules) {
      this.rulesEngine.updateEngine(rulesetName, rules);
      this.logger.log(`Ruleset ${rulesetName} reloaded successfully`);
    } else {
      throw new Error(`Ruleset ${rulesetName} not found`);
    }
  }

  async getRulesetInfo(rulesetName: string): Promise<any> {
    const rules = this.rulesDatabase.get(rulesetName);
    const engineInfo = this.rulesEngine.getEngineInfo(rulesetName);

    return {
      name: rulesetName,
      rulesCount: rules?.length || 0,
      engineInfo,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getAllRulesets(): Promise<any[]> {
    const rulesetNames = this.rulesEngine.getEngineNames();
    return Promise.all(rulesetNames.map((name) => this.getRulesetInfo(name)));
  }

  async getRules(rulesetName: string): Promise<any[]> {
    return this.rulesDatabase.get(rulesetName) || [];
  }

  private async logRuleChange(
    rulesetName: string,
    ruleId: string,
    newRule: any,
  ): Promise<void> {
    // Simulasi audit logging
    this.logger.log(
      `AUDIT: Rule ${ruleId} in ${rulesetName} updated at ${new Date().toISOString()}`,
    );
    // Dalam implementasi nyata, ini akan menyimpan ke audit log database
  }

  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method untuk export rules ke JSON
  async exportRules(rulesetName: string): Promise<string> {
    const rules = this.rulesDatabase.get(rulesetName);
    if (!rules) {
      throw new Error(`Ruleset ${rulesetName} not found`);
    }

    return JSON.stringify(
      {
        rulesetName,
        rules,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      },
      null,
      2,
    );
  }

  // Method untuk import rules dari JSON
  async importRules(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      const { rulesetName, rules } = data;

      if (!rulesetName || !rules || !Array.isArray(rules)) {
        throw new Error('Invalid rules format');
      }

      this.rulesDatabase.set(rulesetName, rules);
      await this.reloadRuleset(rulesetName);

      this.logger.log(
        `Rules imported successfully for ruleset: ${rulesetName}`,
      );
    } catch (error) {
      this.logger.error(`Failed to import rules: ${error.message}`);
      throw new Error(`Invalid rules format: ${error.message}`);
    }
  }
}
