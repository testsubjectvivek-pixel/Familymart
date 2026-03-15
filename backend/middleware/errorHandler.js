const errorHandler = (err, req, res, next) => {
  // Determine status code - use err.status if set, otherwise default to 500
  const statusCode = err.status || err.statusCode || res.statusCode || 500;
  
  // Ensure status code is a valid HTTP status (4xx or 5xx)
  const finalStatusCode = (statusCode >= 400 && statusCode < 600) ? statusCode : 500;

  // Log error in development for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${finalStatusCode}`);
    console.error(err.stack || err);
  } else {
    // In production, log to file or monitoring service (to be implemented)
    console.error(`Error: ${err.message}`);
  }

  res.status(finalStatusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;
