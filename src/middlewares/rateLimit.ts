import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../utils/ApiError';

const cooldowns = new Map<string, number>();

export const rateLimit = (cooldownSeconds: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const lastRequest = cooldowns.get(key);

    if (lastRequest && now - lastRequest < cooldownSeconds * 1000) {
      const remaining = Math.ceil((cooldownSeconds * 1000 - (now - lastRequest)) / 1000);
      throw new TooManyRequestsError(`Please wait ${remaining} seconds before requesting another OTP`);
    }

    cooldowns.set(key, now);
    
    if (cooldowns.size > 1000) {
      const cutoff = now - (cooldownSeconds * 1000 * 10);
      for (const [k, v] of cooldowns.entries()) {
        if (v < cutoff) {
          cooldowns.delete(k);
        }
      }
    }

    next();
  };
};
