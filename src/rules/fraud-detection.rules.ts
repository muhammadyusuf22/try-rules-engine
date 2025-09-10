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
  {
    conditions: {
      all: [
        { fact: 'transaction-amount', operator: 'greaterThan', value: 5000000 },
        {
          fact: 'transaction-amount',
          operator: 'lessThanInclusive',
          value: 10000000,
        },
        { fact: 'is-different-country', operator: 'equal', value: false },
      ],
    },
    event: {
      type: 'medium-risk-transaction',
      params: {
        action: 'review',
        reason: 'Large domestic transaction',
        risk_score: 60,
        required_approvals: 1,
      },
    },
  },
  {
    conditions: {
      all: [
        { fact: 'transaction-count-today', operator: 'greaterThan', value: 5 },
        {
          fact: 'transaction-count-today',
          operator: 'lessThanInclusive',
          value: 10,
        },
      ],
    },
    event: {
      type: 'velocity-check',
      params: {
        action: 'monitor',
        reason: 'High transaction frequency',
        risk_score: 40,
        required_approvals: 0,
      },
    },
  },
  {
    conditions: {
      all: [
        { fact: 'is-new-device', operator: 'equal', value: true },
        { fact: 'transaction-amount', operator: 'greaterThan', value: 1000000 },
      ],
    },
    event: {
      type: 'new-device-transaction',
      params: {
        action: 'verify',
        reason: 'Large transaction from new device',
        risk_score: 50,
        required_approvals: 0,
      },
    },
  },
];
