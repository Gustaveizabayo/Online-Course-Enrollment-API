import bcrypt from 'bcrypt';

export class OtpGenerator {
  static generate(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static hashOtp(code: string): string {
    return bcrypt.hashSync(code, 10);
  }

  static verifyOtp(code: string, hashedCode: string): boolean {
    return bcrypt.compareSync(code, hashedCode);
  }

  static generateExpiry(minutes: number): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + minutes);
    return expiry;
  }

  static isExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }
}
