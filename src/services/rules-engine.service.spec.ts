import { Test, TestingModule } from '@nestjs/testing';
import { RulesEngineService } from './rules-engine.service';

describe('RulesEngineService', () => {
  let service: RulesEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RulesEngineService],
    }).compile();

    service = module.get<RulesEngineService>(RulesEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register engine with rules', () => {
    const rules = [
      {
        conditions: {
          all: [{ fact: 'user-type', operator: 'equal', value: 'premium' }],
        },
        event: {
          type: 'premium-discount',
          params: { percentage: 20 },
        },
      },
    ];

    service.registerEngine('test-engine', rules);

    const engineNames = service.getEngineNames();
    expect(engineNames).toContain('test-engine');

    const engineInfo = service.getEngineInfo('test-engine');
    expect(engineInfo).toBeDefined();
    expect(engineInfo.name).toBe('test-engine');
    expect(engineInfo.rulesCount).toBe(1);
  });

  it('should execute rules and return events', async () => {
    const rules = [
      {
        conditions: {
          all: [{ fact: 'user-type', operator: 'equal', value: 'premium' }],
        },
        event: {
          type: 'premium-discount',
          params: { percentage: 20 },
        },
      },
    ];

    service.registerEngine('test-engine', rules);

    const facts = { 'user-type': 'premium' };
    const events = await service.executeRules('test-engine', facts);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('premium-discount');
    expect(events[0].params.percentage).toBe(20);
  });

  it('should throw error for non-existent engine', async () => {
    const facts = { 'user-type': 'premium' };

    await expect(service.executeRules('non-existent', facts)).rejects.toThrow(
      'Engine non-existent not found',
    );
  });

  it('should update engine with new rules', () => {
    const initialRules = [
      {
        conditions: {
          all: [{ fact: 'user-type', operator: 'equal', value: 'premium' }],
        },
        event: {
          type: 'premium-discount',
          params: { percentage: 20 },
        },
      },
    ];

    service.registerEngine('test-engine', initialRules);

    const newRules = [
      ...initialRules,
      {
        conditions: {
          all: [{ fact: 'user-type', operator: 'equal', value: 'vip' }],
        },
        event: {
          type: 'vip-discount',
          params: { percentage: 30 },
        },
      },
    ];

    service.updateEngine('test-engine', newRules);

    const engineInfo = service.getEngineInfo('test-engine');
    expect(engineInfo.rulesCount).toBe(2);
  });

  it('should clear all engines', () => {
    service.registerEngine('engine1', []);
    service.registerEngine('engine2', []);

    expect(service.getEngineNames()).toHaveLength(2);

    service.clearAllEngines();

    expect(service.getEngineNames()).toHaveLength(0);
  });
});
