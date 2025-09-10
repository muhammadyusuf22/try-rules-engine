# Rules Engine vs Hardcoded If-Else Comparison

Dokumen ini menunjukkan perbandingan mendalam antara implementasi **Rules Engine** vs **Hardcoded If-Else** untuk business logic yang kompleks.

## 🎯 Overview

| Aspect                     | Rules Engine    | Hardcoded If-Else |
| -------------------------- | --------------- | ----------------- |
| **Code Complexity**        | Low             | High              |
| **Maintainability**        | High            | Low               |
| **Flexibility**            | High            | Low               |
| **Testing**                | Easy            | Difficult         |
| **Performance**            | Slightly slower | Faster            |
| **Business User Friendly** | Yes             | No                |
| **Audit Trail**            | Yes             | No                |
| **Dynamic Updates**        | Yes             | No                |

## 📊 API Endpoints untuk Perbandingan

### 1. Discount Calculation Comparison

```http
POST /comparison/discount-calculation
Content-Type: application/json

{
  "user": {
    "type": "premium",
    "age": 30,
    "isFirstTimeBuyer": false,
    "country": "ID",
    "verificationLevel": 3
  },
  "order": {
    "amount": 150000,
    "category": "electronics"
  }
}
```

### 2. Fraud Detection Comparison

```http
POST /comparison/fraud-detection
Content-Type: application/json

{
  "user": {
    "type": "regular",
    "age": 30,
    "isFirstTimeBuyer": false,
    "country": "ID",
    "verificationLevel": 2
  },
  "transaction": {
    "amount": 15000000,
    "country": "ID",
    "deviceId": "device1",
    "isNewDevice": false
  }
}
```

### 3. Performance Analysis

```http
POST /comparison/performance-analysis
Content-Type: application/json

{
  "user": { ... },
  "order": { ... },
  "transaction": { ... }
}
```

### 4. Code Complexity Analysis

```http
GET /comparison/code-complexity
```

### 5. Demo Scenarios

```http
GET /comparison/demo-scenarios
```

## 🔍 Detailed Comparison

### 1. Code Structure

#### ✅ Rules Engine Approach

```typescript
// Clean separation of concerns
// rules/discount.rules.ts
export const discountRules = [
  {
    conditions: {
      all: [
        { fact: 'user-type', operator: 'equal', value: 'premium' },
        { fact: 'order-amount', operator: 'greaterThanInclusive', value: 100000 }
      ]
    },
    event: {
      type: 'premium-discount',
      params: { percentage: 20, priority: 10, reason: 'Premium member large order' }
    }
  }
];

// services/order.service.ts
async calculateOrderDiscount(user: User, order: Order): Promise<any> {
  const facts = {
    'user-type': user.type,
    'order-amount': order.amount,
    // ...
  };

  const events = await this.rulesEngine.executeRules('discount-calculator', facts);
  return this.selectBestDiscount(events, order.amount);
}
```

#### ❌ Hardcoded If-Else Approach

```typescript
// services/order-without-rules.service.ts
async calculateOrderDiscount(user: any, order: any): Promise<any> {
  let discountPercentage = 0;
  let appliedRule = 'No discount applied';
  let priority = 0;

  // Rule 1: Premium user dengan order besar
  if (user.type === 'premium' && order.amount >= 100000) {
    if (20 > priority) {
      discountPercentage = 20;
      appliedRule = 'Premium member large order';
      priority = 10;
    }
  }

  // Rule 2: Senior citizen dengan healthcare
  if (user.age >= 60 && order.category === 'healthcare') {
    if (15 > priority) {
      discountPercentage = 15;
      appliedRule = 'Senior healthcare discount';
      priority = 8;
    }
  }

  // Rule 3: First time buyer
  if (user.isFirstTimeBuyer) {
    if (10 > priority) {
      discountPercentage = 10;
      appliedRule = 'Welcome discount';
      priority = 5;
    }
  }

  // ... 10+ more rules dengan nested if-else
  // Kode menjadi sangat panjang dan sulit dibaca
}
```

### 2. Adding New Rules

#### ✅ Rules Engine - Easy

```typescript
// 1. Tambahkan rule baru di file rules
{
  conditions: {
    all: [
      { fact: 'user-type', operator: 'equal', value: 'vip' },
      { fact: 'order-amount', operator: 'greaterThanInclusive', value: 500000 }
    ]
  },
  event: {
    type: 'vip-mega-discount',
    params: { percentage: 35, priority: 20, reason: 'VIP mega discount' }
  }
}

// 2. Reload ruleset (hot reload)
await rulesManagementService.reloadRuleset('discount-calculator');

// 3. Rule langsung aktif tanpa deployment!
```

#### ❌ Hardcoded If-Else - Difficult

```typescript
// 1. Buka kode service
// 2. Tambahkan if-else baru di tengah function
if (user.type === 'vip' && order.amount >= 500000) {
  if (35 > priority) {
    discountPercentage = 35;
    appliedRule = 'VIP mega discount';
    priority = 20;
  }
}

// 3. Test seluruh function
// 4. Deploy ulang aplikasi
// 5. Risk breaking existing logic
```

### 3. Business User Management

#### ✅ Rules Engine - Business User Friendly

```bash
# Business analyst bisa mengubah rules via API
curl -X POST http://localhost:3000/rules/rulesets/discount-calculator/rules \
  -H "Content-Type: application/json" \
  -d '{
    "conditions": {
      "all": [
        { "fact": "user-type", "operator": "equal", "value": "premium" },
        { "fact": "order-amount", "operator": "greaterThanInclusive", "value": 100000 }
      ]
    },
    "event": {
      "type": "premium-discount",
      "params": { "percentage": 25, "priority": 10, "reason": "Updated premium discount" }
    }
  }'
```

#### ❌ Hardcoded If-Else - Developer Only

```typescript
// Hanya developer yang bisa mengubah rules
// Business analyst harus:
// 1. Request ke developer
// 2. Tunggu development cycle
// 3. Tunggu testing
// 4. Tunggu deployment
// 5. Bisa memakan waktu berhari-hari atau berminggu-minggu
```

### 4. Testing

#### ✅ Rules Engine - Easy Testing

```typescript
describe('Discount Rules', () => {
  it('should apply premium discount', async () => {
    const facts = {
      'user-type': 'premium',
      'order-amount': 150000,
    };

    const events = await rulesEngine.executeRules('discount-calculator', facts);
    expect(events[0].params.percentage).toBe(20);
  });

  it('should test individual rule', async () => {
    // Bisa test rule individual dengan mudah
  });
});
```

#### ❌ Hardcoded If-Else - Difficult Testing

```typescript
describe('Order Service', () => {
  it('should calculate discount', async () => {
    // Harus test seluruh function
    // Harus mock semua kondisi
    // Sulit untuk test edge cases
    const result = await service.calculateOrderDiscount(user, order);
    expect(result.discountPercentage).toBe(20);
  });

  // Tidak bisa test individual rules dengan mudah
});
```

### 5. Performance Comparison

#### Rules Engine

- **Pros**: Clean code, easy maintenance, flexible
- **Cons**: Slight overhead due to rule parsing
- **Execution Time**: ~2-5ms per execution

#### Hardcoded If-Else

- **Pros**: Faster execution (no parsing overhead)
- **Cons**: Complex code, difficult maintenance, inflexible
- **Execution Time**: ~1-2ms per execution

**Note**: Perbedaan performance minimal (1-3ms), tetapi benefits Rules Engine jauh lebih besar.

## 📈 Real-World Scenarios

### Scenario 1: E-commerce Discount System

**Requirement**: "Berikan diskon 30% untuk user yang membeli di hari ulang tahun mereka"

#### Rules Engine Solution

```typescript
// 1. Tambahkan rule baru
{
  conditions: {
    all: [
      { fact: 'is-birthday', operator: 'equal', value: true },
      { fact: 'order-amount', operator: 'greaterThanInclusive', value: 50000 }
    ]
  },
  event: {
    type: 'birthday-discount',
    params: { percentage: 30, priority: 25, reason: 'Birthday special discount' }
  }
}

// 2. Update facts calculation
const facts = {
  'user-type': user.type,
  'order-amount': order.amount,
  'is-birthday': this.isUserBirthday(user.birthday)
};

// 3. Reload ruleset
await rulesManagementService.reloadRuleset('discount-calculator');
// Rule langsung aktif!
```

#### Hardcoded If-Else Solution

```typescript
// 1. Buka kode service
// 2. Tambahkan logic di tengah function
const today = new Date();
const userBirthday = new Date(user.birthday);
const isBirthday =
  today.getMonth() === userBirthday.getMonth() &&
  today.getDate() === userBirthday.getDate();

if (isBirthday && order.amount >= 50000) {
  if (30 > priority) {
    discountPercentage = 30;
    appliedRule = 'Birthday special discount';
    priority = 25;
  }
}

// 3. Test seluruh function
// 4. Deploy ulang aplikasi
// 5. Risk breaking existing logic
```

### Scenario 2: Fraud Detection System

**Requirement**: "Block transaction jika user melakukan 5+ transaksi dalam 1 jam"

#### Rules Engine Solution

```typescript
// 1. Tambahkan rule baru
{
  conditions: {
    all: [
      { fact: 'transaction-count-last-hour', operator: 'greaterThan', value: 5 }
    ]
  },
  event: {
    type: 'velocity-fraud-check',
    params: {
      action: 'block',
      reason: 'High velocity transaction pattern',
      risk_score: 85,
      required_approvals: 2
    }
  }
}

// 2. Update facts calculation
const facts = {
  'transaction-amount': transaction.amount,
  'transaction-count-last-hour': await this.getTransactionCountLastHour(user.id),
  // ...
};

// 3. Reload ruleset
await rulesManagementService.reloadRuleset('fraud-detection');
// Rule langsung aktif!
```

#### Hardcoded If-Else Solution

```typescript
// 1. Buka kode service
// 2. Tambahkan complex logic
const lastHour = new Date(Date.now() - 60 * 60 * 1000);
const transactionCountLastHour = await this.getTransactionCountSince(
  user.id,
  lastHour,
);

if (transactionCountLastHour > 5) {
  riskScore = Math.max(riskScore, 85);
  isBlocked = true;
  requiresApproval = true;
  requiredApprovals = 2;
  reasons.push('High velocity transaction pattern');
  recommendedAction = 'block';
}

// 3. Test seluruh function
// 4. Deploy ulang aplikasi
// 5. Risk breaking existing logic
```

## 🎯 When to Use Each Approach

### Use Rules Engine When:

- ✅ Complex business logic (5+ conditions)
- ✅ Frequently changing rules
- ✅ Non-technical users need to manage rules
- ✅ Compliance requirements
- ✅ A/B testing scenarios
- ✅ Multi-tenant applications
- ✅ Need audit trail
- ✅ Need dynamic rule management

### Use Hardcoded If-Else When:

- ✅ Simple logic (1-2 conditions)
- ✅ Stable rules that rarely change
- ✅ Performance-critical paths
- ✅ Simple validation logic
- ✅ One-time business logic

## 📊 Metrics Comparison

| Metric                       | Rules Engine         | Hardcoded If-Else         |
| ---------------------------- | -------------------- | ------------------------- |
| **Lines of Code**            | ~200 lines           | ~500+ lines               |
| **Cyclomatic Complexity**    | Low                  | High                      |
| **Maintainability Index**    | High                 | Low                       |
| **Test Coverage**            | Easy to achieve 100% | Difficult to achieve 100% |
| **Time to Add New Rule**     | Minutes              | Hours/Days                |
| **Business User Dependency** | Low                  | High                      |
| **Deployment Frequency**     | Low                  | High                      |
| **Bug Risk**                 | Low                  | High                      |

## 🚀 Demo Commands

### Test Discount Calculation Comparison

```bash
curl -X POST http://localhost:3000/comparison/discount-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "type": "premium",
      "age": 30,
      "isFirstTimeBuyer": false,
      "country": "ID",
      "verificationLevel": 3
    },
    "order": {
      "amount": 150000,
      "category": "electronics"
    }
  }'
```

### Test Fraud Detection Comparison

```bash
curl -X POST http://localhost:3000/comparison/fraud-detection \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "type": "regular",
      "age": 30,
      "isFirstTimeBuyer": false,
      "country": "ID",
      "verificationLevel": 2
    },
    "transaction": {
      "amount": 15000000,
      "country": "ID",
      "deviceId": "device1",
      "isNewDevice": false
    }
  }'
```

### Get Code Complexity Analysis

```bash
curl -X GET http://localhost:3000/comparison/code-complexity
```

## 🎉 Conclusion

**Rules Engine** memberikan benefits yang jauh lebih besar dibandingkan **Hardcoded If-Else** untuk business logic yang kompleks:

1. **Maintainability**: Kode lebih bersih dan mudah di-maintain
2. **Flexibility**: Mudah menambah/mengubah rules tanpa deployment
3. **Business User Friendly**: Non-technical users bisa manage rules
4. **Testing**: Mudah untuk test individual rules
5. **Audit Trail**: Track semua perubahan rules
6. **Scalability**: Mudah untuk scale ke use cases yang lebih kompleks

Meskipun ada slight performance overhead, benefits yang didapat jauh lebih besar dan sepadan dengan investasi yang diperlukan.

---

**Ready to see the difference?** Jalankan demo commands di atas untuk melihat perbandingan langsung! 🚀
