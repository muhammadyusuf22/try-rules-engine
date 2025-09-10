# Rules Engine - Materi Presentasi dan Script

## 🎯 AGENDA (2 menit)

**Script:**
"Hari ini kita akan membahas Rules Engine dalam 25 menit. Kita akan cover 6 poin utama: definisi Rules Engine, mengapa kita butuh ini, kapan sebaiknya digunakan, implementasi praktis di NestJS, best practices yang harus diikuti, dan diakhiri dengan demo singkat."

---

## 🤔 APA ITU RULES ENGINE? (3 menit)

**Script:**
"Rules Engine adalah sistem yang mengotomatisasi pengambilan keputusan berdasarkan aturan bisnis. Konsepnya sederhana: IF condition THEN action.

Mari lihat contoh sederhana: IF user premium member THEN diskon 20%. Atau IF transaksi lebih dari 1 juta THEN perlu approval.

Bedanya dengan if-else biasa adalah Rules Engine memisahkan logic bisnis dari kode aplikasi, sehingga aturan bisa diubah tanpa deployment."

### Konsep Dasar

```
IF (condition) THEN (action)
```

### Contoh Nyata

- **E-commerce**: IF user premium + order > 100k THEN diskon 20%
- **Banking**: IF transaksi > 50 juta THEN butuh approval manager
- **Security**: IF login dari negara berbeda THEN kirim OTP
- **Insurance**: IF usia > 65 + penyakit tertentu THEN premi naik 15%

---

## 🚀 MENGAPA PERLU RULES ENGINE? (4 menit)

**Script:**
"Ada 3 alasan utama kenapa kita butuh Rules Engine:

Pertama, Separation of Concerns. Bayangkan kode kita penuh dengan if-else kompleks untuk business logic. Setiap ada perubahan aturan bisnis, kita harus buka kode, edit, test, deploy. Dengan Rules Engine, aturan dipisah dari kode aplikasi.

Kedua, Non-technical users bisa manage rules. Business analyst bisa langsung ubah aturan promo tanpa tunggu developer. Time-to-market jadi lebih cepat.

Ketiga, Consistency dan Auditability. Semua aturan terpusat, ada history perubahan, dan mudah untuk audit compliance."

### 1. Separation of Concerns

**❌ Tanpa Rules Engine:**

```javascript
function calculateDiscount(user, order) {
  if (user.type === 'premium' && order.amount > 100000) {
    return order.amount * 0.2;
  }
  if (user.age > 60 && order.category === 'healthcare') {
    return order.amount * 0.15;
  }
  // ... 50+ kondisi lainnya tercampur dalam kode
}
```

**✅ Dengan Rules Engine:**

```javascript
const discount = await rulesEngine.execute('discount-calculation', {
  user,
  order,
});
```

### 2. Non-Technical Users Can Manage Rules

- Business analyst bisa mengubah aturan tanpa developer
- Faster time-to-market untuk perubahan bisnis
- Mengurangi bottleneck development

### 3. Consistency & Auditability

- Aturan terpusat dan konsisten
- History perubahan aturan
- Compliance audit lebih mudah

### 4. **TAMBAHAN**: A/B Testing & Experimentation

- Rules bisa di-toggle on/off untuk testing
- Rollback mudah jika ada masalah
- Gradual rollout fitur baru

---

## 🎪 KAPAN MENGGUNAKAN RULES ENGINE? (3 menit)

**Script:**
"Rules Engine bukan silver bullet. Ada kondisi dimana cocok dan tidak cocok.

Cocok untuk: Complex business logic dengan banyak kondisi, aturan yang sering berubah seperti pricing atau promo, compliance requirements seperti KYC, aplikasi multi-tenant dengan aturan berbeda per client.

Tidak cocok untuk: Simple if-else 1-2 kondisi, performance-critical paths yang butuh response microsecond, atau aturan yang sudah stable dan jarang berubah."

### ✅ **Cocok untuk:**

- **Complex Business Logic** dengan 5+ kondisi
- **Frequently Changing Rules** (pricing, promotion, approval workflow)
- **Compliance Requirements** (KYC, AML, tax calculation)
- **Multi-tenant Applications** dengan rules berbeda per tenant
- **A/B Testing** scenarios
- **Dynamic Pricing** berdasarkan berbagai faktor

### ❌ **Tidak cocok untuk:**

- Simple if-else logic (1-2 kondisi)
- **Performance-critical paths** yang butuh response < 10ms
- Rules yang sudah stable dan jarang berubah
- **Simple validation** yang bisa handle dengan schema validation

### 🎯 **Sweet Spot:**

- 5-50 kondisi bisnis yang saling berkaitan
- Rules berubah 1-2x per bulan
- Butuh audit trail dan approval process

---

## 🔧 IMPLEMENTASI PRAKTIS DI NESTJS (8 menit)

**Script:**
"Sekarang kita lihat implementasi praktis. Saya akan tunjukkan step-by-step dari setup sampai penggunaan nyata."

### 1. Setup dan Installation

```bash
npm install json-rules-engine
npm install @nestjs/common @nestjs/core
```

### 2. Core Rules Engine Service

```typescript
// rules-engine.service.ts
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
}
```

### 3. Discount Rules Configuration

```typescript
// discount.rules.ts
export const discountRules = [
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
  {
    conditions: {
      all: [
        { fact: 'user-age', operator: 'greaterThanInclusive', value: 60 },
        { fact: 'order-category', operator: 'equal', value: 'healthcare' },
      ],
    },
    event: {
      type: 'senior-healthcare-discount',
      params: {
        percentage: 15,
        priority: 8,
        reason: 'Senior healthcare discount',
      },
    },
  },
  {
    conditions: {
      all: [{ fact: 'is-first-time-buyer', operator: 'equal', value: true }],
    },
    event: {
      type: 'first-time-discount',
      params: { percentage: 10, priority: 5, reason: 'Welcome discount' },
    },
  },
];
```

### 4. Order Service Implementation

```typescript
// order.service.ts
import { Injectable } from '@nestjs/common';
import { RulesEngineService } from './rules-engine.service';
import { discountRules } from './discount.rules';

@Injectable()
export class OrderService {
  constructor(private rulesEngine: RulesEngineService) {
    // Register rules engine saat service init
    this.rulesEngine.registerEngine('discount-calculator', discountRules);
  }

  async calculateOrderDiscount(user: any, order: any): Promise<any> {
    const facts = {
      'user-type': user.type,
      'user-age': user.age,
      'order-amount': order.amount,
      'order-category': order.category,
      'is-first-time-buyer': user.isFirstTimeBuyer,
    };

    const events = await this.rulesEngine.executeRules(
      'discount-calculator',
      facts,
    );

    // Conflict resolution: pilih discount tertinggi
    let bestDiscount = this.selectBestDiscount(events, order.amount);

    return {
      originalAmount: order.amount,
      discountAmount: bestDiscount.amount,
      discountPercentage: bestDiscount.percentage,
      finalAmount: order.amount - bestDiscount.amount,
      appliedRule: bestDiscount.reason,
      availableDiscounts: events.length,
    };
  }

  private selectBestDiscount(events: any[], orderAmount: number) {
    if (events.length === 0) {
      return { amount: 0, percentage: 0, reason: 'No discount applied' };
    }

    // Sort by priority first, then by discount amount
    const sortedEvents = events
      .map((event) => ({
        ...event.params,
        amount: (orderAmount * event.params.percentage) / 100,
      }))
      .sort((a, b) => b.priority - a.priority || b.amount - a.amount);

    return sortedEvents[0];
  }
}
```

### 5. Advanced Example: Fraud Detection

```typescript
// fraud-detection.rules.ts
export const fraudRules = [
  {
    conditions: {
      any: [
        {
          fact: 'transaction-amount',
          operator: 'greaterThan',
          value: 10000000,
        },
        {
          all: [
            {
              fact: 'transaction-count-today',
              operator: 'greaterThan',
              value: 10,
            },
            {
              fact: 'total-amount-today',
              operator: 'greaterThan',
              value: 5000000,
            },
          ],
        },
        {
          all: [
            { fact: 'is-different-country', operator: 'equal', value: true },
            { fact: 'user-verification-level', operator: 'lessThan', value: 3 },
          ],
        },
      ],
    },
    event: {
      type: 'high-risk-transaction',
      params: {
        action: 'block',
        reason: 'Suspicious transaction pattern',
        risk_score: 90,
        required_approvals: 2,
      },
    },
  },
];

// fraud-detection.service.ts
@Injectable()
export class FraudDetectionService {
  constructor(private rulesEngine: RulesEngineService) {
    this.rulesEngine.registerEngine('fraud-detection', fraudRules);
  }

  async checkTransaction(user: any, transaction: any): Promise<any> {
    const userStats = await this.getUserTransactionStats(user.id);

    const facts = {
      'transaction-amount': transaction.amount,
      'transaction-count-today': userStats.countToday,
      'total-amount-today': userStats.totalToday,
      'is-different-country': transaction.country !== user.country,
      'user-verification-level': user.verificationLevel,
    };

    const events = await this.rulesEngine.executeRules(
      'fraud-detection',
      facts,
    );

    return {
      isBlocked: events.some((e) => e.params.action === 'block'),
      requiresApproval: events.some((e) => e.params.required_approvals > 0),
      riskScore: Math.max(...events.map((e) => e.params.risk_score || 0)),
      reasons: events.map((e) => e.params.reason),
      recommendedAction: this.getRecommendedAction(events),
    };
  }
}
```

---

## 📊 DYNAMIC RULES MANAGEMENT (3 menit)

**Script:**
"Fitur powerful dari Rules Engine adalah kemampuan mengubah rules secara dinamis. Rules bisa disimpan di database dan di-reload tanpa restart aplikasi."

```typescript
// rules-management.service.ts
@Injectable()
export class RulesManagementService {
  constructor(
    private rulesEngine: RulesEngineService,
    private prisma: PrismaService,
  ) {}

  async loadRulesFromDatabase(): Promise<void> {
    const rulesets = await this.prisma.ruleset.findMany({
      where: { isActive: true },
      include: { rules: true },
    });

    rulesets.forEach((ruleset) => {
      this.rulesEngine.registerEngine(ruleset.name, ruleset.rules);
    });
  }

  async updateRule(
    rulesetName: string,
    ruleId: string,
    newRule: any,
  ): Promise<void> {
    // Update in database
    await this.prisma.rule.update({
      where: { id: ruleId },
      data: { ...newRule, updatedAt: new Date() },
    });

    // Hot reload the entire ruleset
    await this.reloadRuleset(rulesetName);

    // Log the change for audit
    await this.logRuleChange(rulesetName, ruleId, newRule);
  }

  // API endpoint untuk business user
  @Post('rules/:ruleset/reload')
  async reloadRulesEndpoint(@Param('ruleset') rulesetName: string) {
    await this.reloadRuleset(rulesetName);
    return { message: `Rules for ${rulesetName} reloaded successfully` };
  }
}
```

---

## 🎯 BEST PRACTICES & PITFALLS (2 menit)

**Script:**
"Sekarang tips penting untuk implementasi yang sukses dan menghindari kesalahan umum."

### ✅ **Best Practices:**

1. **Rule Organization**

```
/src/rules/
  /discount/
    - premium-user.rules.ts
    - seasonal-promotion.rules.ts
  /fraud-detection/
    - high-risk.rules.ts
    - velocity-check.rules.ts
```

2. **Comprehensive Testing**

```typescript
describe('Discount Rules', () => {
  let rulesEngine: RulesEngineService;

  beforeEach(() => {
    rulesEngine = new RulesEngineService();
    rulesEngine.registerEngine('discount', discountRules);
  });

  it('should apply highest priority discount', async () => {
    const facts = {
      'user-type': 'premium',
      'user-age': 65,
      'order-amount': 150000,
      'order-category': 'healthcare',
    };

    const events = await rulesEngine.executeRules('discount', facts);
    expect(events).toHaveLength(2); // Both rules match
    expect(events[0].params.percentage).toBe(20); // Premium has higher priority
  });
});
```

3. **Performance Monitoring**

```typescript
// Tambahkan metrics
async executeWithMetrics(engineName: string, facts: any) {
  const startTime = Date.now();
  const result = await this.rulesEngine.executeRules(engineName, facts);
  const executionTime = Date.now() - startTime;

  await this.metricsService.record('rules_execution_time', executionTime, {
    engine: engineName,
    rules_fired: result.length
  });

  return result;
}
```

### ⚠️ **Common Pitfalls:**

1. **Over-Engineering Simple Logic**

```typescript
// ❌ Overkill for simple logic
const simpleRule = {
  conditions: { fact: 'user-active', operator: 'equal', value: true },
  event: { type: 'allow-access' },
};

// ✅ Better as simple condition
if (user.isActive) allowAccess();
```

2. **Ignoring Rule Conflicts**

```typescript
// ✅ Always handle multiple matching rules
async executeWithConflictResolution(engineName: string, facts: any) {
  const events = await this.rulesEngine.executeRules(engineName, facts);

  // Apply priority-based resolution
  return events.sort((a, b) => (b.params.priority || 0) - (a.params.priority || 0));
}
```

3. **No Performance Consideration**

```typescript
// ❌ Heavy rules on critical path
app.post('/api/checkout', async (req, res) => {
  await heavyFraudDetectionRules.execute(facts); // Blocks checkout
});

// ✅ Async processing for heavy rules
app.post('/api/checkout', async (req, res) => {
  await queue.add('fraud-check', facts); // Non-blocking
  res.json({ status: 'processing' });
});
```

---

## 📈 MONITORING & OBSERVABILITY (1 menit)

**Script:**
"Monitoring sangat penting untuk Rules Engine production. Kita perlu track performance, rule usage, dan error rate."

```typescript
// rules-analytics.service.ts
@Injectable()
export class RulesAnalyticsService {
  async trackRuleExecution(
    engineName: string,
    facts: any,
    result: any[],
  ): Promise<void> {
    await this.metricsService.increment('rules.executed.total', {
      engine: engineName,
      rules_fired: result.length,
    });

    // Track individual rule performance
    result.forEach((event) => {
      this.metricsService.increment('rules.fired', {
        engine: engineName,
        rule_type: event.type,
      });
    });
  }

  async getDashboardMetrics(): Promise<any> {
    return {
      topRules: await this.getTopExecutedRules(),
      avgExecutionTime: await this.getAverageExecutionTime(),
      errorRate: await this.getRuleErrorRate(),
      dailyExecution: await this.getDailyExecutionStats(),
    };
  }
}
```

---

## 🎯 KEY TAKEAWAYS & NEXT STEPS (1 menit)

**Script:**
"Untuk menutup, ini key takeaways yang perlu diingat: Rules Engine cocok untuk complex dan frequently changing business logic. Pisahkan business logic dari application code. Empowers business team untuk manage rules sendiri. Testing sama pentingnya dengan testing kode biasa. Always monitor performance dan rule usage. Dan yang terakhir, jangan over-engineer simple logic.

Next steps untuk kalian: Identify use cases di project yang cocok untuk rules engine, start small dengan satu feature dulu, build monitoring dari awal, train business team, dan scale gradually."

### **Key Takeaways:**

1. ✅ Rules Engine untuk complex, frequently changing business logic
2. 🔄 Separasi business logic dari application code
3. 👥 Empowers non-technical users untuk manage rules
4. 🧪 Testing rules sama pentingnya dengan testing code
5. 📊 Monitor performance dan rule usage
6. ⚖️ Jangan over-engineer simple logic

### **Next Steps:**

1. 🔍 **Identify use cases** dalam project yang cocok untuk rules engine
2. 🚀 **Start small** - implement untuk satu feature dulu
3. 📈 **Build monitoring** dari awal
4. 👩‍💼 **Train business team** untuk manage rules
5. 📊 **Scale gradually** ke use cases lainnya

### **Tools & Resources:**

- **Libraries**: json-rules-engine, nools, node-rules
- **GUI Builders**: react-querybuilder, custom admin panel
- **Monitoring**: Prometheus + Grafana, custom analytics dashboard

---

## 🚀 DEMO OUTLINE (jika waktu tersisa)

**Script untuk Demo:**
"Mari saya tunjukkan demo singkat bagaimana Rules Engine bekerja dalam aplikasi nyata."

### Demo Scenario: E-commerce Discount System

1. **Setup**: Show rules configuration
2. **Execution**: Test different user scenarios
3. **Dynamic Update**: Change rule via API
4. **Monitoring**: Show execution metrics

```bash
# Demo commands
curl -X POST http://localhost:3000/orders/calculate-discount \
  -H "Content-Type: application/json" \
  -d '{"user":{"type":"premium","age":65},"order":{"amount":150000,"category":"healthcare"}}'

# Update rule dynamically
curl -X POST http://localhost:3000/rules/discount/reload
```

---

## ❓ PREPARATION FOR Q&A

**Kemungkinan Pertanyaan:**

**Q: "Bagaimana performance Rules Engine vs hard-coded if-else?"**
A: "Rules Engine ada overhead parsing, biasanya 2-5x lebih lambat dari hard-coded. Tapi untuk complex logic, maintainability-nya jauh lebih baik. Untuk performance-critical path, gunakan caching atau async processing."

**Q: "Bagaimana handle rule conflicts?"**
A: "Ada beberapa strategi: priority-based, first-match, atau custom conflict resolution. Yang penting consistent dan predictable."

**Q: "Apakah bisa integrable dengan existing codebase?"**
A: "Ya, Rules Engine bisa diintegrate secara incremental. Mulai dengan satu feature, pindahkan logic ke rules engine satu per satu."

**Q: "Bagaimana security aspect?"**  
A: "Rules harus di-validate sebelum execute, implement proper authorization untuk rule management, dan audit trail untuk semua perubahan rules."
