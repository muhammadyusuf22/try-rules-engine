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
  {
    conditions: {
      all: [
        { fact: 'order-category', operator: 'equal', value: 'electronics' },
        {
          fact: 'order-amount',
          operator: 'greaterThanInclusive',
          value: 500000,
        },
      ],
    },
    event: {
      type: 'electronics-discount',
      params: {
        percentage: 12,
        priority: 7,
        reason: 'Electronics bulk purchase discount',
      },
    },
  },
  {
    conditions: {
      all: [
        { fact: 'user-type', operator: 'equal', value: 'vip' },
        {
          fact: 'order-amount',
          operator: 'greaterThanInclusive',
          value: 200000,
        },
      ],
    },
    event: {
      type: 'vip-discount',
      params: {
        percentage: 25,
        priority: 15,
        reason: 'VIP member special discount',
      },
    },
  },
];
