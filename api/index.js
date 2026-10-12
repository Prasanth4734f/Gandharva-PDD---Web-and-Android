// Vercel Serverless Function Handler
let app = null;
let initError = null;

try {
  app = require('../server/index');
} catch (err) {
  initError = {
    message: err.message,
    stack: err.stack,
    code: err.code
  };
  console.error('[Vercel Handler Init Error]', err);
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      success: false,
      error: `Serverless Function Boot Failure: ${initError.message}`,
      details: initError
    });
  }

  // Handle health check directly to ensure instant discovery
  const url = (req.url || '').split('?')[0];
  if (url === '/api/health' || url === '/health') {
    return res.status(200).json({
      status: 'online',
      service: 'Gandharva Music Retrieval Engine (Vercel Serverless)',
      timestamp: new Date().toISOString()
    });
  }

  return app(req, res);
};
