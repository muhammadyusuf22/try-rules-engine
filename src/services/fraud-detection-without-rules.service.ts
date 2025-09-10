import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FraudDetectionWithoutRulesService {
  private readonly logger = new Logger(FraudDetectionWithoutRulesService.name);

  /**
   * ❌ IMPLEMENTASI FRAUD DETECTION TANPA RULES ENGINE
   *
   * Masalah dengan pendekatan ini:
   * 1. Complex nested if-else statements
   * 2. Sulit untuk menambah fraud patterns baru
   * 3. Business logic tercampur dengan application code
   * 4. Tidak bisa di-update tanpa deployment
   * 5. Sulit untuk A/B testing fraud rules
   * 6. Tidak ada centralized fraud rule management
   */
  async checkTransaction(user: any, transaction: any): Promise<any> {
    this.logger.log('Checking transaction without Rules Engine...');

    const userStats = await this.getUserTransactionStats(user.id);
    let riskScore = 0;
    let isBlocked = false;
    let requiresApproval = false;
    let reasons: string[] = [];
    let recommendedAction = 'approve';
    let requiredApprovals = 0;

    // Rule 1: Very high amount transaction
    if (transaction.amount > 10000000) {
      riskScore = Math.max(riskScore, 90);
      isBlocked = true;
      requiresApproval = true;
      requiredApprovals = 2;
      reasons.push('Very high amount transaction');
      recommendedAction = 'block';
    }

    // Rule 2: High frequency transactions
    if (userStats.countToday > 10 && userStats.totalToday > 5000000) {
      riskScore = Math.max(riskScore, 90);
      isBlocked = true;
      requiresApproval = true;
      requiredApprovals = 2;
      reasons.push('High transaction frequency');
      recommendedAction = 'block';
    }

    // Rule 3: Cross border with low verification
    if (transaction.country !== user.country && user.verificationLevel < 3) {
      riskScore = Math.max(riskScore, 90);
      isBlocked = true;
      requiresApproval = true;
      requiredApprovals = 2;
      reasons.push('Cross border transaction with low verification');
      recommendedAction = 'block';
    }

    // Rule 4: Large domestic transaction
    if (
      transaction.amount > 5000000 &&
      transaction.amount <= 10000000 &&
      transaction.country === user.country
    ) {
      riskScore = Math.max(riskScore, 60);
      requiresApproval = true;
      requiredApprovals = 1;
      reasons.push('Large domestic transaction');
      recommendedAction = 'review';
    }

    // Rule 5: High frequency but not extreme
    if (userStats.countToday > 5 && userStats.countToday <= 10) {
      riskScore = Math.max(riskScore, 40);
      reasons.push('High transaction frequency');
      recommendedAction = 'monitor';
    }

    // Rule 6: New device transaction
    if (transaction.isNewDevice && transaction.amount > 1000000) {
      riskScore = Math.max(riskScore, 50);
      reasons.push('Large transaction from new device');
      recommendedAction = 'verify';
    }

    // Rule 7: Unusual time transaction (2 AM - 6 AM)
    const transactionHour = new Date(transaction.createdAt).getHours();
    if (
      transactionHour >= 2 &&
      transactionHour <= 6 &&
      transaction.amount > 2000000
    ) {
      riskScore = Math.max(riskScore, 45);
      reasons.push('Unusual time transaction');
      recommendedAction = 'verify';
    }

    // Rule 8: Rapid successive transactions
    if (userStats.countToday > 3 && userStats.totalToday > 10000000) {
      riskScore = Math.max(riskScore, 70);
      requiresApproval = true;
      requiredApprovals = 1;
      reasons.push('Rapid successive high-value transactions');
      recommendedAction = 'review';
    }

    // Rule 9: Geographic anomaly
    if (this.isGeographicAnomaly(user, transaction)) {
      riskScore = Math.max(riskScore, 55);
      reasons.push('Geographic anomaly detected');
      recommendedAction = 'verify';
    }

    // Rule 10: Device fingerprint mismatch
    if (this.isDeviceFingerprintMismatch(user, transaction)) {
      riskScore = Math.max(riskScore, 60);
      reasons.push('Device fingerprint mismatch');
      recommendedAction = 'review';
    }

    // Rule 11: Velocity check - multiple small transactions
    if (userStats.countToday > 8 && userStats.totalToday < 2000000) {
      riskScore = Math.max(riskScore, 35);
      reasons.push('High frequency small transactions');
      recommendedAction = 'monitor';
    }

    // Rule 12: Weekend high-value transaction
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    if (isWeekend && transaction.amount > 5000000) {
      riskScore = Math.max(riskScore, 50);
      reasons.push('High-value weekend transaction');
      recommendedAction = 'verify';
    }

    // Rule 13: First transaction from new country
    if (this.isFirstTransactionFromCountry(user, transaction)) {
      riskScore = Math.max(riskScore, 40);
      reasons.push('First transaction from new country');
      recommendedAction = 'monitor';
    }

    // Rule 14: Amount just below reporting threshold
    if (transaction.amount >= 9900000 && transaction.amount < 10000000) {
      riskScore = Math.max(riskScore, 30);
      reasons.push('Amount just below reporting threshold');
      recommendedAction = 'monitor';
    }

    // Rule 15: Multiple failed attempts before success
    if (user.failedAttempts && user.failedAttempts > 3) {
      riskScore = Math.max(riskScore, 45);
      reasons.push('Multiple failed attempts before success');
      recommendedAction = 'verify';
    }

    this.logger.log(
      `Transaction risk assessment: ${riskScore} - ${recommendedAction}`,
    );

    return {
      isBlocked,
      requiresApproval,
      riskScore,
      reasons,
      recommendedAction,
      requiredApprovals,
      allTriggers: reasons.map((reason, index) => ({
        type: `rule-${index + 1}`,
        action: recommendedAction,
        reason,
        riskScore: riskScore,
        requiredApprovals: requiredApprovals,
      })),
      calculationMethod: 'hardcoded-if-else',
    };
  }

  /**
   * ❌ MASALAH: Helper methods tersebar dan sulit di-maintain
   */
  private async getUserTransactionStats(userId: string): Promise<any> {
    // Simulasi data dari database
    return {
      countToday: Math.floor(Math.random() * 15),
      totalToday: Math.floor(Math.random() * 10000000),
      lastTransactionDate: new Date(),
    };
  }

  private isGeographicAnomaly(user: any, transaction: any): boolean {
    // Complex logic untuk detect geographic anomaly
    // Sulit untuk di-test dan di-maintain
    const userCountry = user.country;
    const transactionCountry = transaction.country;

    // Hardcoded logic - sulit untuk diubah
    const suspiciousCountries = ['XX', 'YY', 'ZZ']; // Contoh
    return (
      suspiciousCountries.includes(transactionCountry) &&
      userCountry !== transactionCountry
    );
  }

  private isDeviceFingerprintMismatch(user: any, transaction: any): boolean {
    // Complex device fingerprinting logic
    // Sulit untuk di-test individual
    return transaction.deviceId !== user.lastKnownDeviceId;
  }

  private isFirstTransactionFromCountry(user: any, transaction: any): boolean {
    // Logic untuk check first transaction from country
    // Memerlukan database query yang complex
    return !user.previousCountries?.includes(transaction.country);
  }

  /**
   * ❌ MASALAH: Sulit untuk menambah fraud pattern baru
   * Setiap pattern baru memerlukan:
   * 1. Modifikasi kode
  2. Testing seluruh function
   * 3. Deployment
   * 4. Risk breaking existing logic
   */
  async addNewFraudPattern(user: any, transaction: any): Promise<any> {
    // Bayangkan ada requirement baru:
    // "Block transaction jika user melakukan 5+ transaksi dalam 1 jam"

    // Developer harus:
    // 1. Tambahkan logic untuk track transactions per hour
    // 2. Tambahkan if-else baru
    // 3. Handle conflict dengan existing rules
    // 4. Test seluruh function
    // 5. Deploy ulang

    // Dan ini harus diulang untuk setiap pattern baru!
    return this.checkTransaction(user, transaction);
  }

  /**
   * ❌ MASALAH: Tidak bisa di-manage oleh fraud analyst
   * Fraud analyst tidak bisa:
   * - Mengubah risk score
   * - Menambah/menghapus patterns
   * - Mengubah threshold values
   * - A/B testing rules
   *
   * Semua harus melalui developer!
   */
  async getFraudPatterns(): Promise<any[]> {
    // Sulit untuk return semua patterns karena tersebar di kode
    return [
      { name: 'High Amount', threshold: 10000000, action: 'block' },
      { name: 'High Frequency', threshold: 10, action: 'block' },
      // ... dan seterusnya
    ];
  }

  /**
   * ❌ MASALAH: Tidak ada centralized configuration
   * Threshold values hardcoded di kode
   * Sulit untuk diubah tanpa deployment
   */
  async updateFraudThresholds(): Promise<void> {
    // Tidak bisa update thresholds tanpa mengubah kode
    // Harus deploy ulang untuk setiap perubahan
    this.logger.warn(
      'Cannot update thresholds without code change and deployment',
    );
  }

  /**
   * ❌ MASALAH: Performance issues
   * Semua rules dieksekusi meskipun tidak perlu
   * Tidak ada early exit mechanism
   */
  async checkTransactionWithPerformanceIssues(
    user: any,
    transaction: any,
  ): Promise<any> {
    const startTime = Date.now();

    // Semua fraud checks dieksekusi
    let result = this.checkTransaction(user, transaction);

    const executionTime = Date.now() - startTime;
    this.logger.warn(
      `Fraud check took ${executionTime}ms - all rules executed`,
    );

    return {
      ...result,
      executionTime,
      performanceNote: 'All fraud rules executed regardless of necessity',
    };
  }

  /**
   * ❌ MASALAH: Sulit untuk testing
   * Tidak bisa test individual fraud patterns
   * Harus test seluruh function
   */
  async testSpecificFraudPattern(
    patternName: string,
    user: any,
    transaction: any,
  ): Promise<any> {
    // Tidak bisa test individual pattern
    // Harus test seluruh function
    return this.checkTransaction(user, transaction);
  }
}
