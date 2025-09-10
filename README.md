# Rules Engine - NestJS Implementation

Implementasi Rules Engine menggunakan NestJS berdasarkan materi presentasi. Project ini mendemonstrasikan cara mengimplementasikan Rules Engine untuk business logic yang kompleks dan sering berubah.

## 🚀 Features

- **Core Rules Engine Service** - Service utama untuk menjalankan rules
- **Discount Calculation** - Sistem perhitungan diskon dengan multiple rules
- **Fraud Detection** - Sistem deteksi fraud dengan risk assessment
- **Dynamic Rules Management** - Manajemen rules secara dinamis
- **Analytics & Monitoring** - Tracking dan monitoring performance rules
- **RESTful API** - API endpoints untuk testing dan management
- **Comprehensive Testing** - Unit tests untuk semua komponen

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd try-rules-engine

# Install dependencies
npm install

# Start development server
npm run start:dev
```

## 🏗️ Project Structure

```
src/
├── controllers/           # API Controllers
│   ├── order.controller.ts
│   ├── fraud-detection.controller.ts
│   ├── rules-management.controller.ts
│   └── analytics.controller.ts
├── services/             # Business Logic Services
│   ├── rules-engine.service.ts
│   ├── order.service.ts
│   ├── fraud-detection.service.ts
│   ├── rules-management.service.ts
│   └── rules-analytics.service.ts
├── rules/               # Rules Configuration
│   ├── discount.rules.ts
│   └── fraud-detection.rules.ts
├── dto/                 # Data Transfer Objects
│   └── calculate-discount.dto.ts
├── interfaces/          # TypeScript Interfaces
│   └── user.interface.ts
└── app.module.ts        # Main Module
```

## 🎯 API Endpoints

### Order Management

#### Calculate Discount

```http
POST /orders/calculate-discount
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

#### Get Available Discounts

```http
GET /orders/available-discounts?userType=premium&userAge=30&orderAmount=150000&orderCategory=electronics&isFirstTimeBuyer=false
```

#### Get Demo Scenarios

```http
GET /orders/demo-scenarios
```

### Fraud Detection

#### Check Transaction

```http
POST /fraud-detection/check-transaction
Content-Type: application/json

{
  "user": {
    "type": "regular",
    "age": 30,
    "isFirstTimeBuyer": false,
    "country": "ID",
    "verificationLevel": 3
  },
  "transaction": {
    "amount": 5000000,
    "country": "US",
    "deviceId": "device123",
    "isNewDevice": false
  }
}
```

#### Risk Assessment

```http
POST /fraud-detection/risk-assessment
Content-Type: application/json

{
  "user": { ... },
  "transaction": { ... }
}
```

### Rules Management

#### Get All Engines

```http
GET /rules/engines
```

#### Get Rulesets

```http
GET /rules/rulesets
```

#### Reload Ruleset

```http
POST /rules/rulesets/discount-calculator/reload
```

#### Add Rule

```http
POST /rules/rulesets/discount-calculator/rules
Content-Type: application/json

{
  "conditions": {
    "all": [
      { "fact": "user-type", "operator": "equal", "value": "vip" }
    ]
  },
  "event": {
    "type": "vip-special-discount",
    "params": { "percentage": 30, "priority": 15, "reason": "VIP special discount" }
  }
}
```

### Analytics

#### Dashboard

```http
GET /analytics/dashboard
```

#### Top Rules

```http
GET /analytics/top-rules?limit=10
```

#### Engine Stats

```http
GET /analytics/engine-stats
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📊 Demo Scenarios

### Discount Calculation Examples

1. **Premium User Large Order**
   - User: Premium, Age: 30, Order: 150k Electronics
   - Expected: 20% discount

2. **Senior Healthcare Purchase**
   - User: Regular, Age: 65, Order: 80k Healthcare
   - Expected: 15% discount

3. **First Time Buyer**
   - User: Regular, Age: 25, First Time: true, Order: 50k Clothing
   - Expected: 10% discount

4. **VIP Member Electronics**
   - User: VIP, Age: 40, Order: 300k Electronics
   - Expected: 25% discount

### Fraud Detection Examples

1. **High Risk Transaction**
   - Amount: 15M, Same Country
   - Expected: Block

2. **Cross Border Transaction**
   - Amount: 5M, Different Country, Low Verification
   - Expected: Block

3. **New Device Transaction**
   - Amount: 2M, New Device
   - Expected: Verify

4. **Normal Transaction**
   - Amount: 500k, Same Country, Known Device
   - Expected: Approve

## 🔧 Configuration

### Rules Configuration

Rules didefinisikan dalam format JSON menggunakan `json-rules-engine`:

```typescript
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
```

### Supported Operators

- `equal`
- `notEqual`
- `lessThan`
- `lessThanInclusive`
- `greaterThan`
- `greaterThanInclusive`
- `in`
- `notIn`
- `contains`
- `doesNotContain`

## 📈 Monitoring & Analytics

### Metrics Tracked

- Rule execution count
- Rule execution time
- Rules fired per execution
- Error rates
- Engine performance
- Daily/weekly trends

### Dashboard Features

- Top executed rules
- Average execution time
- Error rate monitoring
- Engine statistics
- Recent executions
- Weekly trends

## 🚀 Best Practices

### 1. Rule Organization

- Pisahkan rules berdasarkan domain (discount, fraud, etc.)
- Gunakan naming convention yang konsisten
- Dokumentasi setiap rule dengan jelas

### 2. Performance

- Monitor execution time
- Gunakan caching untuk rules yang jarang berubah
- Async processing untuk heavy rules

### 3. Testing

- Test setiap rule secara individual
- Test conflict resolution
- Test edge cases

### 4. Monitoring

- Track rule usage
- Monitor performance metrics
- Alert pada error rate tinggi

## 🔄 Dynamic Rules Management

### Hot Reload

Rules dapat di-reload tanpa restart aplikasi:

```typescript
// Update rule
await rulesManagementService.updateRule(
  'discount-calculator',
  'rule-id',
  newRule,
);

// Reload ruleset
await rulesManagementService.reloadRuleset('discount-calculator');
```

### Import/Export

Rules dapat di-export dan di-import:

```typescript
// Export rules
const exportedData = await rulesManagementService.exportRules(
  'discount-calculator',
);

// Import rules
await rulesManagementService.importRules(jsonData);
```

## 🎯 Use Cases

### E-commerce

- Dynamic pricing
- Promotional discounts
- Customer segmentation
- Inventory management

### Banking

- Fraud detection
- Risk assessment
- Compliance checking
- Loan approval

### Insurance

- Premium calculation
- Claim processing
- Risk evaluation
- Policy validation

## 📚 Learning Resources

- [JSON Rules Engine Documentation](https://github.com/CacheControl/json-rules-engine)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Rules Engine Patterns](https://martinfowler.com/articles/rulesEngine.html)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: Project ini dibuat untuk demonstrasi Rules Engine dalam presentasi. Untuk production use, pertimbangkan untuk menambahkan:

- Database persistence untuk rules
- Authentication & authorization
- Rate limiting
- Comprehensive error handling
- Production monitoring
