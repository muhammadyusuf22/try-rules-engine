/**
 * ACTION-BASED RULES
 * Rules yang tidak hanya return value, tapi juga execute function/action
 */

export const actionBasedRules = [
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
      type: 'premium-discount-action',
      params: {
        action: 'applyDiscount',
        percentage: 20,
        priority: 10,
        reason: 'Premium member large order',
        actionParams: {
          discountType: 'percentage',
          maxDiscountAmount: 50000,
          sendNotification: true,
          updateLoyaltyPoints: true,
          pointsMultiplier: 2,
        },
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
      type: 'senior-healthcare-action',
      params: {
        action: 'applyDiscount',
        percentage: 15,
        priority: 8,
        reason: 'Senior healthcare discount',
        actionParams: {
          discountType: 'percentage',
          sendNotification: true,
          updateLoyaltyPoints: true,
          pointsMultiplier: 1.5,
          addToWishlist: true,
          category: 'healthcare',
        },
      },
    },
  },
  {
    conditions: {
      all: [{ fact: 'is-first-time-buyer', operator: 'equal', value: true }],
    },
    event: {
      type: 'first-time-buyer-action',
      params: {
        action: 'applyDiscount',
        percentage: 10,
        priority: 5,
        reason: 'Welcome discount',
        actionParams: {
          discountType: 'percentage',
          sendWelcomeEmail: true,
          createUserProfile: true,
          addToNewsletter: true,
          sendSMS: true,
        },
      },
    },
  },
  {
    conditions: {
      all: [
        {
          fact: 'transaction-amount',
          operator: 'greaterThan',
          value: 10000000,
        },
      ],
    },
    event: {
      type: 'high-risk-transaction-action',
      params: {
        action: 'blockTransaction',
        reason: 'High risk transaction detected',
        priority: 100,
        actionParams: {
          blockReason: 'amount_exceeds_limit',
          notifyCompliance: true,
          createAuditLog: true,
          sendAlertToManager: true,
          requireManualReview: true,
          escalationLevel: 'high',
        },
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
          value: 500000,
        },
      ],
    },
    event: {
      type: 'vip-mega-purchase-action',
      params: {
        action: 'applyDiscount',
        percentage: 25,
        priority: 15,
        reason: 'VIP mega purchase discount',
        actionParams: {
          discountType: 'percentage',
          sendNotification: true,
          updateLoyaltyPoints: true,
          pointsMultiplier: 3,
          assignPersonalManager: true,
          createVIPReport: true,
          scheduleFollowUp: true,
          addToPriorityQueue: true,
        },
      },
    },
  },
];

/**
 * WORKFLOW RULES
 * Rules yang trigger workflow/process
 */
export const workflowRules = [
  {
    conditions: {
      all: [
        { fact: 'order-status', operator: 'equal', value: 'pending' },
        { fact: 'payment-method', operator: 'equal', value: 'credit_card' },
        { fact: 'order-amount', operator: 'greaterThan', value: 1000000 },
      ],
    },
    event: {
      type: 'credit-card-verification-workflow',
      params: {
        action: 'startWorkflow',
        workflowType: 'credit_card_verification',
        priority: 20,
        reason: 'High value credit card transaction',
        actionParams: {
          workflowSteps: [
            'verify_card_details',
            'check_fraud_score',
            'contact_bank',
            'manual_review',
            'send_otp',
            'approve_transaction',
          ],
          timeout: 300000, // 5 minutes
          retryAttempts: 3,
          notifyCustomer: true,
          createAuditTrail: true,
        },
      },
    },
  },
  {
    conditions: {
      all: [
        { fact: 'user-type', operator: 'equal', value: 'new' },
        { fact: 'order-amount', operator: 'greaterThan', value: 500000 },
      ],
    },
    event: {
      type: 'new-user-verification-workflow',
      params: {
        action: 'startWorkflow',
        workflowType: 'new_user_verification',
        priority: 15,
        reason: 'New user high value transaction',
        actionParams: {
          workflowSteps: [
            'verify_identity',
            'check_documents',
            'phone_verification',
            'email_verification',
            'address_verification',
            'approve_account',
          ],
          timeout: 600000, // 10 minutes
          retryAttempts: 2,
          notifyUser: true,
          sendInstructions: true,
        },
      },
    },
  },
];

/**
 * NOTIFICATION RULES
 * Rules yang trigger notifications
 */
export const notificationRules = [
  {
    conditions: {
      all: [{ fact: 'order-amount', operator: 'greaterThan', value: 10000000 }],
    },
    event: {
      type: 'high-value-order-notification',
      params: {
        action: 'sendNotification',
        notificationType: 'high_value_order',
        priority: 30,
        reason: 'High value order placed',
        actionParams: {
          channels: ['email', 'sms', 'push', 'slack'],
          recipients: ['manager', 'sales_team', 'ceo'],
          template: 'high_value_order_alert',
          data: {
            orderAmount: '{{order.amount}}',
            customerName: '{{user.name}}',
            timestamp: '{{timestamp}}',
          },
          urgency: 'high',
          requireAcknowledgment: true,
        },
      },
    },
  },
  {
    conditions: {
      all: [
        { fact: 'user-type', operator: 'equal', value: 'premium' },
        { fact: 'order-category', operator: 'equal', value: 'electronics' },
      ],
    },
    event: {
      type: 'premium-electronics-notification',
      params: {
        action: 'sendNotification',
        notificationType: 'premium_electronics',
        priority: 25,
        reason: 'Premium user electronics purchase',
        actionParams: {
          channels: ['email', 'push'],
          recipients: ['customer', 'sales_team'],
          template: 'premium_electronics_purchase',
          data: {
            productCategory: '{{order.category}}',
            discountApplied: '{{discount.percentage}}%',
            loyaltyPoints: '{{loyalty.points}}',
          },
          urgency: 'medium',
          scheduleFollowUp: true,
        },
      },
    },
  },
];
