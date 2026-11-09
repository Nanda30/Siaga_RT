const { AppError } = require('../utils/helpers');

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada server';

  // Prisma Error Handling
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Data sudah ada (duplikat).';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Data tidak ditemukan.';
  }

  if (statusCode === 500) {
    console.error('Server Internal Error:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    data: null,
    error: err.details || (process.env.NODE_ENV === 'development' ? err.stack : null),
  });
}

module.exports = errorHandler;
