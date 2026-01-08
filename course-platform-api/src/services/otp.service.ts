import prisma from '../database/prisma';

export class OTPService {
    /**
     * Generate a 6-digit OTP code
     */
    static generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Store OTP for a user (5 minutes expiry)
     */
    static async storeOTP(userId: number, otp: string): Promise<void> {
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 5); // 5 minutes from now

        await prisma.user.update({
            where: { id: userId },
            data: {
                otp,
                otpExpiry: expiryTime,
            },
        });
    }

    /**
     * Verify OTP for a user
     */
    static async verifyOTP(userId: number, otp: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { otp: true, otpExpiry: true },
        });

        if (!user || !user.otp || !user.otpExpiry) {
            return false;
        }

        // Check if OTP has expired
        if (new Date() > user.otpExpiry) {
            // Clear expired OTP
            await this.clearOTP(userId);
            return false;
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            return false;
        }

        // OTP is valid, clear it
        await this.clearOTP(userId);
        return true;
    }

    /**
     * Clear OTP for a user
     */
    static async clearOTP(userId: number): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                otp: null,
                otpExpiry: null,
            },
        });
    }

    /**
     * Verify OTP by email
     */
    static async verifyOTPByEmail(email: string, otp: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, otp: true, otpExpiry: true },
        });

        if (!user) {
            return false;
        }

        return this.verifyOTP(user.id, otp);
    }
}
