import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { RulesManagementService } from '../services/rules-management.service';
import { RulesEngineService } from '../services/rules-engine.service';

@Controller('rules')
export class RulesManagementController {
  constructor(
    private readonly rulesManagementService: RulesManagementService,
    private readonly rulesEngineService: RulesEngineService,
  ) {}

  @Get('engines')
  async getEngines() {
    const engines = this.rulesEngineService.getEngineNames();
    const enginesInfo = engines.map((name) =>
      this.rulesEngineService.getEngineInfo(name),
    );

    return {
      success: true,
      data: {
        engines: enginesInfo,
        totalEngines: engines.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('rulesets')
  async getAllRulesets() {
    const rulesets = await this.rulesManagementService.getAllRulesets();

    return {
      success: true,
      data: {
        rulesets,
        totalRulesets: rulesets.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('rulesets/:name')
  async getRuleset(@Param('name') name: string) {
    const ruleset = await this.rulesManagementService.getRulesetInfo(name);
    const rules = await this.rulesManagementService.getRules(name);

    return {
      success: true,
      data: {
        ruleset,
        rules,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('rulesets/:name/rules')
  async getRules(@Param('name') name: string) {
    const rules = await this.rulesManagementService.getRules(name);

    return {
      success: true,
      data: {
        rulesetName: name,
        rules,
        totalRules: rules.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('rulesets/:name/reload')
  async reloadRuleset(@Param('name') name: string) {
    await this.rulesManagementService.reloadRuleset(name);

    return {
      success: true,
      message: `Rules for ${name} reloaded successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('rulesets/:name/rules')
  async addRule(@Param('name') name: string, @Body() newRule: any) {
    await this.rulesManagementService.addRule(name, newRule);

    return {
      success: true,
      message: `Rule added successfully to ${name}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('rulesets/:name/rules/:ruleId')
  async updateRule(
    @Param('name') name: string,
    @Param('ruleId') ruleId: string,
    @Body() updatedRule: any,
  ) {
    await this.rulesManagementService.updateRule(name, ruleId, updatedRule);

    return {
      success: true,
      message: `Rule ${ruleId} updated successfully in ${name}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('rulesets/:name/rules/:ruleId')
  async removeRule(
    @Param('name') name: string,
    @Param('ruleId') ruleId: string,
  ) {
    await this.rulesManagementService.removeRule(name, ruleId);

    return {
      success: true,
      message: `Rule ${ruleId} removed successfully from ${name}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('rulesets/:name/export')
  async exportRules(@Param('name') name: string) {
    const exportedData = await this.rulesManagementService.exportRules(name);

    return {
      success: true,
      data: {
        rulesetName: name,
        exportedData,
        exportedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('rulesets/:name/import')
  async importRules(
    @Param('name') name: string,
    @Body() importData: { jsonData: string },
  ) {
    await this.rulesManagementService.importRules(importData.jsonData);

    return {
      success: true,
      message: `Rules imported successfully for ${name}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('load-from-database')
  async loadFromDatabase() {
    await this.rulesManagementService.loadRulesFromDatabase();

    return {
      success: true,
      message: 'Rules loaded from database successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('demo-rules')
  getDemoRules() {
    return {
      success: true,
      data: {
        discountRules: [
          {
            name: 'Premium User Discount',
            description: '20% discount for premium users with orders > 100k',
            conditions: 'user-type = premium AND order-amount >= 100000',
            action: 'Apply 20% discount',
          },
          {
            name: 'Senior Healthcare Discount',
            description: '15% discount for seniors buying healthcare items',
            conditions: 'user-age >= 60 AND order-category = healthcare',
            action: 'Apply 15% discount',
          },
        ],
        fraudRules: [
          {
            name: 'High Risk Transaction',
            description: 'Block transactions > 10M',
            conditions: 'transaction-amount > 10000000',
            action: 'Block transaction',
          },
          {
            name: 'Velocity Check',
            description: 'Monitor high frequency transactions',
            conditions: 'transaction-count-today > 5',
            action: 'Monitor transaction',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };
  }
}
