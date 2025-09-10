# Demo Scripts untuk Rules Engine

## 🚀 Quick Start

```bash
# Start aplikasi
npm run start:dev

# Aplikasi akan berjalan di http://localhost:3000
```

## 📋 Demo Scenarios

### 1. Discount Calculation Demo

#### Premium User Large Order

```bash
curl -X POST http://localhost:3000/orders/calculate-discount \
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

**Expected Result**: 20% discount (30,000 IDR)

#### Senior Healthcare Purchase

```bash
curl -X POST http://localhost:3000/orders/calculate-discount \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "type": "regular",
      "age": 65,
      "isFirstTimeBuyer": false,
      "country": "ID",
      "verificationLevel": 3
    },
    "order": {
      "amount": 80000,
      "category": "healthcare"
    }
  }'
```

**Expected Result**: 15% discount (12,000 IDR)

#### First Time Buyer

```bash
curl -X POST http://localhost:3000/orders/calculate-discount \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "type": "regular",
      "age": 25,
      "isFirstTimeBuyer": true,
      "country": "ID",
      "verificationLevel": 3
    },
    "order": {
      "amount": 50000,
      "category": "clothing"
    }
  }'
```

**Expected Result**: 10% discount (5,000 IDR)

#### VIP Member Electronics

```bash
curl -X POST http://localhost:3000/orders/calculate-discount \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "type": "vip",
      "age": 40,
      "isFirstTimeBuyer": false,
      "country": "ID",
      "verificationLevel": 4
    },
    "order": {
      "amount": 300000,
      "category": "electronics"
    }
  }'
```

**Expected Result**: 25% discount (75,000 IDR)

### 2. Fraud Detection Demo

#### High Risk Transaction

```bash
curl -X POST http://localhost:3000/fraud-detection/check-transaction \
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

**Expected Result**: Block transaction (risk score: 90)

#### Cross Border Transaction

```bash
curl -X POST http://localhost:3000/fraud-detection/check-transaction \
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
      "amount": 5000000,
      "country": "US",
      "deviceId": "device1",
      "isNewDevice": false
    }
  }'
```

**Expected Result**: Block transaction (different country + low verification)

#### New Device Transaction

```bash
curl -X POST http://localhost:3000/fraud-detection/check-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "type": "premium",
      "age": 35,
      "isFirstTimeBuyer": false,
      "country": "ID",
      "verificationLevel": 4
    },
    "transaction": {
      "amount": 2000000,
      "country": "ID",
      "deviceId": "new-device",
      "isNewDevice": true
    }
  }'
```

**Expected Result**: Verify transaction (new device)

#### Normal Transaction

```bash
curl -X POST http://localhost:3000/fraud-detection/check-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "type": "premium",
      "age": 35,
      "isFirstTimeBuyer": false,
      "country": "ID",
      "verificationLevel": 4
    },
    "transaction": {
      "amount": 500000,
      "country": "ID",
      "deviceId": "device1",
      "isNewDevice": false
    }
  }'
```

**Expected Result**: Approve transaction

### 3. Rules Management Demo

#### Get All Engines

```bash
curl -X GET http://localhost:3000/rules/engines
```

#### Get Rulesets

```bash
curl -X GET http://localhost:3000/rules/rulesets
```

#### Get Specific Ruleset

```bash
curl -X GET http://localhost:3000/rules/rulesets/discount-calculator
```

#### Reload Ruleset

```bash
curl -X POST http://localhost:3000/rules/rulesets/discount-calculator/reload
```

#### Add New Rule

```bash
curl -X POST http://localhost:3000/rules/rulesets/discount-calculator/rules \
  -H "Content-Type: application/json" \
  -d '{
    "conditions": {
      "all": [
        { "fact": "user-type", "operator": "equal", "value": "vip" },
        { "fact": "order-amount", "operator": "greaterThanInclusive", "value": 500000 }
      ]
    },
    "event": {
      "type": "vip-mega-discount",
      "params": { "percentage": 35, "priority": 20, "reason": "VIP mega discount for large orders" }
    }
  }'
```

### 4. Analytics Demo

#### Get Dashboard

```bash
curl -X GET http://localhost:3000/analytics/dashboard
```

#### Get Top Rules

```bash
curl -X GET http://localhost:3000/analytics/top-rules?limit=5
```

#### Get Engine Stats

```bash
curl -X GET http://localhost:3000/analytics/engine-stats
```

#### Get Execution Trend

```bash
curl -X GET http://localhost:3000/analytics/execution-trend
```

#### Get Recent Executions

```bash
curl -X GET http://localhost:3000/analytics/recent-executions?limit=10
```

## 🔄 COMPARISON DEMO - Rules Engine vs Hardcoded If-Else

### Compare Discount Calculation

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

### Compare Fraud Detection

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

### Code Complexity Analysis

```bash
curl -X GET http://localhost:3000/comparison/code-complexity
```

### Demo Scenarios

```bash
curl -X GET http://localhost:3000/comparison/demo-scenarios
```

## 🎯 Demo Flow untuk Presentasi

### 1. Introduction (2 menit)

- Show project structure
- Explain Rules Engine concept
- Show API documentation

### 2. Discount Calculation Demo (5 menit)

- Run premium user scenario
- Show rule matching process
- Demonstrate conflict resolution
- Show available discounts

### 3. Fraud Detection Demo (5 menit)

- Run high-risk transaction
- Show risk assessment
- Demonstrate different risk levels
- Show recommended actions

### 4. Dynamic Rules Management (5 menit)

- Show current rules
- Add new rule via API
- Reload ruleset
- Test new rule

### 5. Analytics & Monitoring (3 menit)

- Show dashboard metrics
- Demonstrate rule tracking
- Show performance monitoring

### 6. Q&A (5 menit)

- Answer questions
- Show code structure
- Explain best practices

## 🔧 Testing Commands

### Run All Tests

```bash
npm run test
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Run Specific Test

```bash
npm run test -- --testNamePattern="OrderService"
```

### Run E2E Tests

```bash
npm run test:e2e
```

## 📊 Performance Testing

### Load Test dengan Artillery

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### Load Test Configuration (load-test.yml)

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Discount Calculation'
    weight: 50
    flow:
      - post:
          url: '/orders/calculate-discount'
          json:
            user:
              type: 'premium'
              age: 30
              isFirstTimeBuyer: false
              country: 'ID'
              verificationLevel: 3
            order:
              amount: 150000
              category: 'electronics'
  - name: 'Fraud Detection'
    weight: 50
    flow:
      - post:
          url: '/fraud-detection/check-transaction'
          json:
            user:
              type: 'regular'
              age: 30
              isFirstTimeBuyer: false
              country: 'ID'
              verificationLevel: 3
            transaction:
              amount: 5000000
              country: 'US'
              deviceId: 'device1'
              isNewDevice: false
```

## 🎪 Interactive Demo

### Browser-based Demo

Buka browser dan akses:

- `http://localhost:3000/orders/demo-scenarios` - Lihat semua demo scenarios
- `http://localhost:3000/fraud-detection/demo-scenarios` - Lihat fraud detection scenarios
- `http://localhost:3000/rules/demo-rules` - Lihat contoh rules

### Postman Collection

Import collection berikut ke Postman untuk testing yang lebih mudah:

```json
{
  "info": {
    "name": "Rules Engine API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Calculate Discount",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"user\": {\n    \"type\": \"premium\",\n    \"age\": 30,\n    \"isFirstTimeBuyer\": false,\n    \"country\": \"ID\",\n    \"verificationLevel\": 3\n  },\n  \"order\": {\n    \"amount\": 150000,\n    \"category\": \"electronics\"\n  }\n}"
        },
        "url": {
          "raw": "http://localhost:3000/orders/calculate-discount",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["orders", "calculate-discount"]
        }
      }
    }
  ]
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Module not found**

   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Test failures**

   ```bash
   # Clear test cache
   npm run test -- --clearCache
   ```

4. **Rules not loading**
   ```bash
   # Check if rules are registered
   curl -X GET http://localhost:3000/rules/engines
   ```

## 📝 Notes untuk Presentasi

1. **Prepare data** - Siapkan beberapa test cases sebelumnya
2. **Show code** - Tampilkan struktur kode dan rules configuration
3. **Explain concepts** - Jelaskan separation of concerns dan benefits
4. **Demo live** - Jalankan API calls secara real-time
5. **Show monitoring** - Tampilkan analytics dan performance metrics
6. **Q&A ready** - Siapkan jawaban untuk pertanyaan umum

---

**Happy Demo! 🎉**
