class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function sendResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    status: statusCode >= 200 && statusCode < 300 ? 'success' : 'fail',
    message,
    data,
    error: null,
  });
}

function normalizePhone(input) {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (!digits.startsWith('62')) {
    digits = '62' + digits;
  }
  return digits;
}

module.exports = {
  AppError,
  sendResponse,
  normalizePhone,
};
