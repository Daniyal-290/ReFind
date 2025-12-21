import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 5,
    message: { success: false, message: 'Too many attempts, try again in 15 seconds' },
    validate: false
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, slow down' },
    validate: false
});

export const claimLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 10,
    message: { success: false, message: 'Too many claims, try again later' },
    validate: false
});
