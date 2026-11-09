const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/prisma');
const { AppError } = require('../utils/helpers');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token otentikasi tidak ditemukan', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user || !user.isActive) {
      throw new AppError('Akun tidak ditemukan atau telah dinonaktifkan', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Sesi telah berakhir atau token tidak valid', 401));
    }
    next(error);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Anda tidak memiliki akses untuk tindakan ini', 403));
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
