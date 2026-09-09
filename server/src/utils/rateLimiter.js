/**
 * High-Performance In-Memory Sliding Window Rate Limiter
 * Zero external dependencies, ultra-low latency.
 */
function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 10, message = 'Too many requests' } = {}) {
  const ipHits = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of ipHits.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        ipHits.delete(ip);
      } else {
        ipHits.set(ip, valid);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const existing = ipHits.get(clientIp) || [];
    const valid = existing.filter(t => now - t < windowMs);

    if (valid.length >= max) {
      return res.status(429).json({
        success: false,
        message: typeof message === 'string' ? message : 'Too many requests. Please try again later.'
      });
    }

    valid.push(now);
    ipHits.set(clientIp, valid);
    next();
  };
}

module.exports = {
  createRateLimiter
};
