import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OrderWithoutRulesService {
  private readonly logger = new Logger(OrderWithoutRulesService.name);

  /**
   * ❌ IMPLEMENTASI TANPA RULES ENGINE
   *
   * Masalah dengan pendekatan ini:
   * 1. Business logic tercampur dengan application code
   * 2. Sulit untuk diubah tanpa deployment
   * 3. Tidak bisa di-manage oleh non-technical users
   * 4. Sulit untuk testing individual rules
   * 5. Tidak ada audit trail untuk perubahan rules
   * 6. Kode menjadi sangat panjang dan kompleks
   */
  async calculateOrderDiscount(user: any, order: any): Promise<any> {
    this.logger.log('Calculating discount without Rules Engine...');

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

    // Rule 4: Electronics bulk purchase
    if (order.category === 'electronics' && order.amount >= 500000) {
      if (12 > priority) {
        discountPercentage = 12;
        appliedRule = 'Electronics bulk purchase discount';
        priority = 7;
      }
    }

    // Rule 5: VIP member
    if (user.type === 'vip' && order.amount >= 200000) {
      if (25 > priority) {
        discountPercentage = 25;
        appliedRule = 'VIP member special discount';
        priority = 15;
      }
    }

    // Rule 6: Seasonal promotion (hardcoded)
    const currentMonth = new Date().getMonth();
    if (currentMonth === 11 && order.amount >= 75000) {
      // December
      if (8 > priority) {
        discountPercentage = 8;
        appliedRule = 'Holiday season discount';
        priority = 6;
      }
    }

    // Rule 7: Loyalty program
    if (
      user.loyaltyPoints &&
      user.loyaltyPoints >= 1000 &&
      order.amount >= 100000
    ) {
      if (18 > priority) {
        discountPercentage = 18;
        appliedRule = 'Loyalty program discount';
        priority = 9;
      }
    }

    // Rule 8: Category-specific discounts
    if (order.category === 'books' && order.amount >= 50000) {
      if (5 > priority) {
        discountPercentage = 5;
        appliedRule = 'Books category discount';
        priority = 3;
      }
    }

    // Rule 9: Time-based discount (weekend)
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    if (isWeekend && order.amount >= 100000) {
      if (7 > priority) {
        discountPercentage = 7;
        appliedRule = 'Weekend special discount';
        priority = 4;
      }
    }

    // Rule 10: Payment method discount
    if (order.paymentMethod === 'credit_card' && order.amount >= 200000) {
      if (6 > priority) {
        discountPercentage = 6;
        appliedRule = 'Credit card payment discount';
        priority = 2;
      }
    }

    const discountAmount = (order.amount * discountPercentage) / 100;
    const finalAmount = order.amount - discountAmount;

    this.logger.log(
      `Applied discount: ${discountPercentage}% - ${appliedRule}`,
    );

    return {
      originalAmount: order.amount,
      discountAmount,
      discountPercentage,
      finalAmount,
      appliedRule,
      availableDiscounts: 1, // Hanya bisa return 1 rule yang applied
      allMatchingRules: [
        {
          // Tidak bisa dengan mudah return semua matching rules
          type: appliedRule.toLowerCase().replace(/\s+/g, '-'),
          percentage: discountPercentage,
          reason: appliedRule,
          priority,
        },
      ],
      calculationMethod: 'hardcoded-if-else',
    };
  }

  /**
   * ❌ MASALAH: Sulit untuk menambahkan rule baru
   * Setiap kali ada requirement baru, developer harus:
   * 1. Buka kode
   * 2. Tambahkan if-else baru
  3. Test seluruh function
   * 4. Deploy ulang
   * 5. Risk breaking existing logic
   */
  async addNewDiscountRule(user: any, order: any): Promise<any> {
    // Bayangkan jika ada requirement baru:
    // "Berikan diskon 30% untuk user yang membeli di hari ulang tahun mereka"

    // Developer harus menambahkan kode ini di tengah-tengah function:
    const today = new Date();
    const userBirthday = new Date(user.birthday);
    const isBirthday =
      today.getMonth() === userBirthday.getMonth() &&
      today.getDate() === userBirthday.getDate();

    if (isBirthday && order.amount >= 50000) {
      // Tapi bagaimana dengan priority? Harus cek semua rule lain
      // Bagaimana dengan conflict resolution?
      // Bagaimana dengan testing?
    }

    // Dan ini harus diulang untuk setiap rule baru!
  }

  /**
   * ❌ MASALAH: Tidak bisa di-manage oleh business user
   * Business analyst tidak bisa mengubah:
   * - Persentase diskon
   * - Kondisi minimum order
   * - Priority rules
   * - Menambah/menghapus rules
   *
   * Semua harus melalui developer dan deployment!
   */
  async getAvailableDiscounts(user: any, order: any): Promise<any[]> {
    // Sulit untuk return semua possible discounts
    // karena logic tersebar di banyak if-else
    const possibleDiscounts: any[] = [];

    if (user.type === 'premium' && order.amount >= 100000) {
      possibleDiscounts.push({
        type: 'premium-discount',
        percentage: 20,
        reason: 'Premium member large order',
        priority: 10,
        discountAmount: (order.amount * 20) / 100,
      });
    }

    if (user.age >= 60 && order.category === 'healthcare') {
      possibleDiscounts.push({
        type: 'senior-healthcare-discount',
        percentage: 15,
        reason: 'Senior healthcare discount',
        priority: 8,
        discountAmount: (order.amount * 15) / 100,
      });
    }

    // ... dan seterusnya untuk setiap rule
    // Kode menjadi sangat repetitive dan error-prone

    return possibleDiscounts;
  }

  /**
   * ❌ MASALAH: Sulit untuk testing
   * Untuk test setiap rule, harus:
   * 1. Mock semua kondisi
   * 2. Test seluruh function
   * 3. Sulit untuk test edge cases
   * 4. Sulit untuk test rule interactions
   */
  async testSpecificRule(
    ruleName: string,
    user: any,
    order: any,
  ): Promise<any> {
    // Tidak bisa test individual rule dengan mudah
    // Harus test seluruh function dan mock semua kondisi
    return this.calculateOrderDiscount(user, order);
  }

  /**
   * ❌ MASALAH: Tidak ada audit trail
   * Tidak ada cara untuk track:
   * - Kapan rule diubah
   * - Siapa yang mengubah
   * - Apa yang diubah
   * - History perubahan
   */
  async getRuleHistory(): Promise<any[]> {
    // Tidak ada history tracking
    return [];
  }

  /**
   * ❌ MASALAH: Performance issues
   * Setiap kali calculate discount:
   * 1. Semua if-else dieksekusi
   * 2. Tidak ada early exit
   * 3. Sulit untuk optimize
   * 4. Tidak ada caching mechanism
   */
  async calculateWithPerformanceIssues(user: any, order: any): Promise<any> {
    const startTime = Date.now();

    // Semua rules dieksekusi meskipun tidak perlu
    let result = this.calculateOrderDiscount(user, order);

    const executionTime = Date.now() - startTime;
    this.logger.warn(
      `Calculation took ${executionTime}ms - no optimization possible`,
    );

    return {
      ...result,
      executionTime,
      performanceNote: 'All rules executed regardless of necessity',
    };
  }
}
