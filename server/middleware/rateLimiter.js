import rateLimit from 'express-rate-limit';

// Rate limiter for authentication routes (login, signup)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter for claim actions
export const claimLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 claim requests per window
    message: {
        success: false,
        message: 'Too many claim requests. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
