# Rules Engine - Materi Presentasi dan Script Lengkap

## 🎯 AGENDA (2 menit)

**Script:**
"Hari ini kita akan membahas Rules Engine. Kita akan cover 7 poin utama: definisi Rules Engine, mengapa kita butuh ini, kapan sebaiknya digunakan, implementasi praktis di NestJS, platform ready-to-use yang bisa langsung dipakai, best practices yang harus diikuti, dan diakhiri dengan demo singkat."

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
"Ada 4 alasan utama kenapa kita butuh Rules Engine:

Pertama, Separation of Concerns. Bayangkan kode kita penuh dengan if-else kompleks untuk business logic. Setiap ada perubahan aturan bisnis, kita harus buka kode, edit, test, deploy. Dengan Rules Engine, aturan dipisah dari kode aplikasi.

Kedua, Non-technical users bisa manage rules. Business analyst bisa langsung ubah aturan promo tanpa tunggu developer. Time-to-market jadi lebih cepat.

Ketiga, Consistency dan Auditability. Semua aturan terpusat, ada history perubahan, dan mudah untuk audit compliance.

Keempat, A/B Testing dan Experimentation jadi mudah karena rules bisa di-toggle on/off."

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

### 4. A/B Testing & Experimentation

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
"Sekarang kita lihat implementasi praktis. Saya akan tunjukkan step-by-step dari setup sampai penggunaan nyata. Yang menarik, saya akan tunjukkan perbandingan langsung antara implementasi dengan Rules Engine vs tanpa Rules Engine, supaya kalian bisa lihat perbedaannya secara nyata."

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

#### **✅ Dengan Rules Engine (Clean & Maintainable):**

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

#### **❌ Tanpa Rules Engine (Hard-coded & Maintenance Nightmare):**

```typescript
// order-without-rules.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderWithoutRulesService {
  async calculateOrderDiscount(user: any, order: any): Promise<any> {
    const discounts: any[] = [];

    // Rule 1: Premium user + large order
    if (user.type === 'premium' && order.amount >= 100000) {
      discounts.push({
        percentage: 20,
        priority: 10,
        reason: 'Premium member large order',
        amount: (order.amount * 20) / 100,
      });
    }

    // Rule 2: Senior + healthcare
    if (user.age >= 60 && order.category === 'healthcare') {
      discounts.push({
        percentage: 15,
        priority: 8,
        reason: 'Senior healthcare discount',
        amount: (order.amount * 15) / 100,
      });
    }

    // Rule 3: First time buyer
    if (user.isFirstTimeBuyer) {
      discounts.push({
        percentage: 10,
        priority: 5,
        reason: 'Welcome discount',
        amount: (order.amount * 10) / 100,
      });
    }

    // Rule 4: VIP member + electronics
    if (user.type === 'vip' && order.category === 'electronics') {
      discounts.push({
        percentage: 25,
        priority: 12,
        reason: 'VIP electronics discount',
        amount: (order.amount * 25) / 100,
      });
    }

    // Rule 5: Bulk order discount
    if (order.amount >= 500000) {
      discounts.push({
        percentage: 12,
        priority: 6,
        reason: 'Bulk order discount',
        amount: (order.amount * 12) / 100,
      });
    }

    // Rule 6: Seasonal promotion (hard-coded date!)
    const currentDate = new Date();
    const isBlackFriday =
      currentDate.getMonth() === 10 && currentDate.getDate() === 24;
    if (isBlackFriday && order.amount >= 50000) {
      discounts.push({
        percentage: 30,
        priority: 15,
        reason: 'Black Friday special',
        amount: (order.amount * 30) / 100,
      });
    }

    // Rule 7: Weekend special
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    if (isWeekend && order.category === 'clothing') {
      discounts.push({
        percentage: 8,
        priority: 3,
        reason: 'Weekend clothing special',
        amount: (order.amount * 8) / 100,
      });
    }

    // Rule 8: Country-specific discount
    if (user.country === 'ID' && order.amount >= 200000) {
      discounts.push({
        percentage: 5,
        priority: 2,
        reason: 'Indonesia special discount',
        amount: (order.amount * 5) / 100,
      });
    }

    // Rule 9: Category-specific discounts
    if (order.category === 'books' && order.amount >= 100000) {
      discounts.push({
        percentage: 15,
        priority: 7,
        reason: 'Books category discount',
        amount: (order.amount * 15) / 100,
      });
    }

    // Rule 10: Time-based discount (hard-coded time!)
    const currentHour = currentDate.getHours();
    if (currentHour >= 22 || currentHour <= 6) {
      discounts.push({
        percentage: 5,
        priority: 1,
        reason: 'Night owl discount',
        amount: (order.amount * 5) / 100,
      });
    }

    // Conflict resolution: pilih discount tertinggi
    let bestDiscount = this.selectBestDiscount(discounts, order.amount);

    return {
      originalAmount: order.amount,
      discountAmount: bestDiscount.amount,
      discountPercentage: bestDiscount.percentage,
      finalAmount: order.amount - bestDiscount.amount,
      appliedRule: bestDiscount.reason,
      availableDiscounts: discounts.length,
    };
  }

  private selectBestDiscount(discounts: any[], orderAmount: number) {
    if (discounts.length === 0) {
      return { amount: 0, percentage: 0, reason: 'No discount applied' };
    }

    // Sort by priority first, then by discount amount
    const sortedDiscounts = discounts.sort(
      (a, b) => b.priority - a.priority || b.amount - a.amount,
    );

    return sortedDiscounts[0];
  }
}
```

#### **🔍 Perbandingan Kedua Pendekatan:**

| Aspek               | Dengan Rules Engine          | Tanpa Rules Engine          |
| ------------------- | ---------------------------- | --------------------------- |
| **Maintainability** | ✅ Mudah diubah tanpa deploy | ❌ Harus edit kode & deploy |
| **Business User**   | ✅ Bisa manage rules sendiri | ❌ Harus tunggu developer   |
| **Testing**         | ✅ Test rules terpisah       | ❌ Test seluruh service     |
| **Audit Trail**     | ✅ History perubahan rules   | ❌ Hanya git history        |
| **A/B Testing**     | ✅ Toggle rules on/off       | ❌ Harus deploy code baru   |
| **Performance**     | ⚠️ 2-5x lebih lambat         | ✅ Lebih cepat              |
| **Complexity**      | ✅ Rules terorganisir        | ❌ Logic tercampur          |
| **Scalability**     | ✅ Mudah tambah rules        | ❌ Kode jadi panjang        |

#### **⚠️ Masalah dengan Hard-coded Approach:**

1. **Maintenance Nightmare**: Setiap perubahan aturan bisnis memerlukan:
   - Developer edit kode
   - Code review
   - Testing
   - Deployment
   - **Time-to-market: 1-2 minggu**

2. **Business Logic Tercampur**:
   - Aturan bisnis bercampur dengan logic aplikasi
   - Sulit untuk business analyst memahami
   - Risk tinggi untuk bug saat refactoring

3. **Hard-coded Values**:

   ```typescript
   // ❌ Masalah: Hard-coded date untuk Black Friday
   const isBlackFriday = currentDate.getMonth() === 10 && currentDate.getDate() === 24;

   // ❌ Masalah: Hard-coded time untuk night discount
   if (currentHour >= 22 || currentHour <= 6) {
   ```

4. **Testing Complexity**:
   - Harus test seluruh service untuk 1 rule baru
   - Risk regression di rules lain
   - Mock data jadi kompleks

5. **Scalability Issues**:
   - Kode jadi panjang (100+ lines untuk 10 rules)
   - Sulit untuk developer baru memahami
   - Performance degradation seiring bertambah rules

### 5. Advanced Example: Fraud Detection

#### **✅ Dengan Rules Engine (Clean & Maintainable):**

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

#### **❌ Tanpa Rules Engine (Hard-coded & Maintenance Nightmare):**

```typescript
// fraud-detection-without-rules.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class FraudDetectionWithoutRulesService {
  async checkTransaction(user: any, transaction: any): Promise<any> {
    const userStats = await this.getUserTransactionStats(user.id);
    const triggers: any[] = [];
    let maxRiskScore = 0;
    let isBlocked = false;
    let requiresApproval = false;
    const reasons: string[] = [];

    // MIRRORING fraudRules: 1 rule dengan 3 kondisi OR
    // Rule 1: High amount transaction (SAMA dengan fraudRules)
    if (transaction.amount > 10000000) {
      triggers.push({
        type: 'high-amount',
        action: 'block',
        reason: 'Suspicious transaction pattern',
        risk_score: 90,
        required_approvals: 2,
      });
      isBlocked = true;
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 90);
      reasons.push('Suspicious transaction pattern');
    }

    // Rule 2: Velocity check (SAMA dengan fraudRules)
    if (userStats.countToday > 10 && userStats.totalToday > 5000000) {
      triggers.push({
        type: 'velocity-check',
        action: 'block',
        reason: 'Suspicious transaction pattern',
        risk_score: 90,
        required_approvals: 2,
      });
      isBlocked = true;
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 90);
      reasons.push('Suspicious transaction pattern');
    }

    // Rule 3: Different country + low verification (SAMA dengan fraudRules)
    if (transaction.country !== user.country && user.verificationLevel < 3) {
      triggers.push({
        type: 'different-country',
        action: 'block',
        reason: 'Suspicious transaction pattern',
        risk_score: 90,
        required_approvals: 2,
      });
      isBlocked = true;
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 90);
      reasons.push('Suspicious transaction pattern');
    }

    // TAMBAHAN RULES yang TIDAK ADA di fraudRules (menunjukkan kompleksitas)
    // Rule 4: New device detection (hard-coded logic!)
    if (transaction.isNewDevice && transaction.amount > 1000000) {
      triggers.push({
        type: 'new-device',
        action: 'require-approval',
        reason: 'High amount transaction from new device',
        risk_score: 70,
        required_approvals: 1,
      });
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 70);
      reasons.push('High amount transaction from new device');
    }

    // Rule 5: Unusual time transaction (hard-coded time!)
    const currentHour = new Date().getHours();
    if (
      (currentHour >= 23 || currentHour <= 5) &&
      transaction.amount > 500000
    ) {
      triggers.push({
        type: 'unusual-time',
        action: 'require-approval',
        reason: 'High amount transaction at unusual time',
        risk_score: 60,
        required_approvals: 1,
      });
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 60);
      reasons.push('High amount transaction at unusual time');
    }

    // Rule 6: Card testing pattern (hard-coded logic!)
    if (userStats.countToday > 5 && userStats.avgAmount < 10000) {
      triggers.push({
        type: 'card-testing',
        action: 'block',
        reason: 'Potential card testing pattern detected',
        risk_score: 75,
        required_approvals: 2,
      });
      isBlocked = true;
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 75);
      reasons.push('Potential card testing pattern detected');
    }

    // Rule 7: Geographic anomaly (hard-coded country list!)
    const highRiskCountries = ['XX', 'YY', 'ZZ']; // Hard-coded!
    if (
      highRiskCountries.includes(transaction.country) &&
      transaction.amount > 100000
    ) {
      triggers.push({
        type: 'high-risk-country',
        action: 'block',
        reason: 'Transaction from high-risk country',
        risk_score: 95,
        required_approvals: 3,
      });
      isBlocked = true;
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 95);
      reasons.push('Transaction from high-risk country');
    }

    // Rule 8: Weekend high amount (hard-coded day check!)
    const currentDay = new Date().getDay();
    const isWeekend = currentDay === 0 || currentDay === 6;
    if (isWeekend && transaction.amount > 2000000) {
      triggers.push({
        type: 'weekend-high-amount',
        action: 'require-approval',
        reason: 'High amount transaction on weekend',
        risk_score: 65,
        required_approvals: 1,
      });
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 65);
      reasons.push('High amount transaction on weekend');
    }

    // Rule 9: Rapid successive transactions (hard-coded time window!)
    const timeSinceLastTransaction = await this.getTimeSinceLastTransaction(
      user.id,
    );
    if (timeSinceLastTransaction < 300 && transaction.amount > 500000) {
      // 5 minutes
      triggers.push({
        type: 'rapid-transactions',
        action: 'require-approval',
        reason: 'Rapid successive high-amount transactions',
        risk_score: 70,
        required_approvals: 1,
      });
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 70);
      reasons.push('Rapid successive high-amount transactions');
    }

    // Rule 10: Merchant category risk (hard-coded category list!)
    const highRiskCategories = ['gambling', 'adult', 'crypto'];
    if (
      highRiskCategories.includes(transaction.merchantCategory) &&
      transaction.amount > 100000
    ) {
      triggers.push({
        type: 'high-risk-merchant',
        action: 'block',
        reason: 'Transaction with high-risk merchant category',
        risk_score: 85,
        required_approvals: 2,
      });
      isBlocked = true;
      requiresApproval = true;
      maxRiskScore = Math.max(maxRiskScore, 85);
      reasons.push('Transaction with high-risk merchant category');
    }

    return {
      isBlocked,
      requiresApproval,
      riskScore: maxRiskScore,
      reasons,
      recommendedAction: this.getRecommendedAction(triggers),
      allTriggers: triggers,
    };
  }

  private getRecommendedAction(triggers: any[]): string {
    if (triggers.some((t) => t.action === 'block')) {
      return 'BLOCK_TRANSACTION';
    }
    if (triggers.some((t) => t.action === 'require-approval')) {
      return 'REQUIRE_MANUAL_APPROVAL';
    }
    return 'ALLOW_TRANSACTION';
  }

  private async getUserTransactionStats(userId: string): Promise<any> {
    // Mock implementation - in real app, this would query database
    return {
      countToday: 3,
      totalToday: 1500000,
      avgAmount: 500000,
    };
  }

  private async getTimeSinceLastTransaction(userId: string): Promise<number> {
    // Mock implementation - in real app, this would query database
    return 600; // 10 minutes
  }
}
```

#### **🔍 Perbandingan Fraud Detection:**

| Aspek                 | Dengan Rules Engine             | Tanpa Rules Engine          |
| --------------------- | ------------------------------- | --------------------------- |
| **Rule Management**   | ✅ Rules terpisah, mudah diubah | ❌ Hard-coded dalam service |
| **Compliance**        | ✅ Audit trail lengkap          | ❌ Hanya git history        |
| **Testing**           | ✅ Test individual rules        | ❌ Test seluruh service     |
| **Performance**       | ⚠️ 2-5x overhead                | ✅ Lebih cepat              |
| **Maintainability**   | ✅ Business user bisa manage    | ❌ Harus tunggu developer   |
| **Scalability**       | ✅ Mudah tambah rules baru      | ❌ Kode jadi panjang        |
| **Hard-coded Values** | ✅ Semua configurable           | ❌ Banyak hard-coded values |

#### **⚠️ Perbedaan Kritis dalam Logic:**

**Dengan Rules Engine (fraudRules):**

```typescript
// 1 RULE dengan 3 kondisi OR
conditions: {
  any: [
    // ← LOGIC: ANY dari 3 kondisi
    { fact: 'transaction-amount', operator: 'greaterThan', value: 10000000 },
    {
      all: [
        // ← LOGIC: ALL dari 2 kondisi
        { fact: 'transaction-count-today', operator: 'greaterThan', value: 10 },
        { fact: 'total-amount-today', operator: 'greaterThan', value: 5000000 },
      ],
    },
    {
      all: [
        // ← LOGIC: ALL dari 2 kondisi
        { fact: 'is-different-country', operator: 'equal', value: true },
        { fact: 'user-verification-level', operator: 'lessThan', value: 3 },
      ],
    },
  ];
}
// Hasil: 1 event dengan risk_score: 90, action: 'block'
```

**Tanpa Rules Engine (Hard-coded):**

```typescript
// 3 RULES TERPISAH dengan LOGIC BERBEDA
if (transaction.amount > 10000000) {
  /* risk_score: 90 */
}
if (userStats.countToday > 10 && userStats.totalToday > 5000000) {
  /* risk_score: 90 */
}
if (transaction.country !== user.country && user.verificationLevel < 3) {
  /* risk_score: 90 */
}

// PLUS 7 RULES TAMBAHAN yang TIDAK ADA di fraudRules
// New device, unusual time, card testing, dll.
```

**Masalah:**

1. **Inconsistency**: Rules Engine punya 1 rule, hard-coded punya 10 rules
2. **Logic Berbeda**: Rules Engine pakai OR logic, hard-coded pakai separate if statements
3. **Maintenance**: Ubah 1 rule di Rules Engine vs ubah 10 rules di hard-coded

#### **⚠️ Masalah Khusus Fraud Detection tanpa Rules Engine:**

1. **Compliance Nightmare**:
   - Regulasi AML/KYC berubah setiap 6 bulan
   - Hard-coded rules sulit di-audit
   - Risk compliance violation tinggi

2. **Hard-coded Risk Values**:

   ```typescript
   // ❌ Masalah: Hard-coded country list
   const highRiskCountries = ['XX', 'YY', 'ZZ'];

   // ❌ Masalah: Hard-coded time window
   if (timeSinceLastTransaction < 300) { // 5 minutes

   // ❌ Masalah: Hard-coded merchant categories
   const highRiskCategories = ['gambling', 'adult', 'crypto'];
   ```

3. **Testing Complexity**:
   - Harus test 10+ rules sekaligus
   - Mock data jadi sangat kompleks
   - Risk false positive/negative tinggi

4. **Business Logic Tercampur**:
   - Fraud rules bercampur dengan business logic
   - Sulit untuk compliance officer memahami
   - Risk human error tinggi

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

## 🛠️ PLATFORM ALTERNATIF - READY-TO-USE SOLUTIONS (3 menit)

**Script:**
"Sebelum kita lanjut ke best practices, penting untuk tahu bahwa kalian nggak harus bikin Rules Engine dari scratch. Ada banyak platform yang sudah siap pakai dengan berbagai level kompleksitas dan pricing."

### **🚀 Cloud-Based Platforms (Recommended untuk Startup)**

#### **DecisionRules** ⭐️ _Paling User-Friendly_

- GUI visual editor yang sangat intuitif
- Setup hanya 15 menit, free trial tersedia
- Pricing: $29/bulan untuk production
- **Demo:** Bisa tunjukkan rule creation secara real-time

#### **Nected** 🎯 _Modern Low-Code_

- Visual workflow builder dengan drag-drop interface
- 100+ integrations ready-to-use
- Freemium model dengan custom enterprise pricing

#### **GoRules** 💎 _Open Source + Cloud_

- DMN standard compliant
- Self-hosted (gratis) atau managed cloud
- Docker deployment yang mudah

### **🏢 Enterprise Solutions**

- **IBM ODM**: Industry standard, $50K+/year
- **Camunda DMN**: Workflow + rules integration
- **InRule**: Business-user focused dengan Excel integration

### **⚡️ Quick Implementation Example**

```javascript
// DecisionRules API integration (5 menit setup)
const response = await fetch(
  'https://api.decisionrules.io/rule/{ruleId}/solve',
  {
    method: 'POST',
    headers: { Authorization: 'Bearer your-api-key' },
    body: JSON.stringify({
      user_type: 'premium',
      order_amount: 150000,
    }),
  },
);

const discount = await response.json();
// Result: { discount_percentage: 20, reason: "Premium discount" }
```

### **🎯 Platform Selection Guide**

- **MVP/Prototype**: DecisionRules atau GoRules
- **Production Scale**: Nected atau Camunda DMN
- **Enterprise/Compliance**: IBM ODM atau InRule
- **Full Control**: Custom implementation dengan json-rules-engine

### **📊 Quick Comparison Matrix**

| Platform          | Setup Time | Learning Curve | GUI Quality | API Integration | Pricing  |
| ----------------- | ---------- | -------------- | ----------- | --------------- | -------- |
| DecisionRules     | 1 day      | Easy           | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐        | $$       |
| Nected            | 2 days     | Easy           | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐      | $$$      |
| GoRules           | 3 days     | Medium         | ⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐      | Free/$   |
| IBM ODM           | 2-4 weeks  | Hard           | ⭐⭐⭐      | ⭐⭐⭐⭐⭐      | $$$$$    |
| Camunda DMN       | 1 week     | Medium         | ⭐⭐⭐⭐    | ⭐⭐⭐⭐        | Free/$$$ |
| json-rules-engine | 1 day      | Easy           | ⭐          | ⭐⭐⭐⭐⭐      | Free     |

**Script lanjutan:**
"Jadi pilihan kalian ada 3: build from scratch untuk full control, pakai library seperti json-rules-engine untuk balance between control dan speed, atau langsung pakai platform seperti DecisionRules untuk fastest time-to-market."

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

Yang terpenting, kalian punya banyak pilihan implementasi - dari build sendiri sampai pakai platform ready-to-use. Pilih yang sesuai dengan timeline dan budget project.

Next steps untuk kalian: Identify use cases di project yang cocok untuk rules engine, start small dengan satu feature dulu, build monitoring dari awal, train business team, dan scale gradually."

### **Key Takeaways:**

1. ✅ Rules Engine untuk complex, frequently changing business logic
2. 🔄 Separasi business logic dari application code
3. 👥 Empowers non-technical users untuk manage rules
4. 🧪 Testing rules sama pentingnya dengan testing code
5. 📊 Monitor performance dan rule usage
6. ⚖️ Jangan over-engineer simple logic
7. 🛠️ Ada banyak platform ready-to-use, tidak harus bikin sendiri

### **Next Steps:**

1. 🔍 **Identify use cases** dalam project yang cocok untuk rules engine
2. 🚀 **Start small** - implement untuk satu feature dulu
3. 📈 **Build monitoring** dari awal
4. 👩‍💼 **Train business team** untuk manage rules
5. 📊 **Scale gradually** ke use cases lainnya

### **Tools & Resources:**

- **Self-Built**: json-rules-engine, nools, node-rules
- **Ready-to-Use Platforms**: DecisionRules, Nected, GoRules
- **Enterprise**: IBM ODM, Camunda DMN, InRule
- **Monitoring**: Prometheus + Grafana, platform-specific analytics

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

**Q: "Apakah harus bikin dari scratch atau ada yang siap pakai?"**
A: "Ada 3 pilihan: Build sendiri untuk full control, pakai library seperti json-rules-engine untuk balance, atau platform ready-to-use seperti DecisionRules untuk fastest time-to-market. DecisionRules bisa setup 15 menit dengan GUI visual."

**Q: "Mana yang lebih cost-effective untuk startup?"**
A: "Untuk startup, mulai dengan platform seperti DecisionRules ($29/bulan) atau GoRules (open source). ROI-nya lebih cepat karena development time lebih singkat dan business team bisa langsung manage rules."
