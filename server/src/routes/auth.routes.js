const express = require('express');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/prisma');
const env = require('../config/env');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { sendResponse, normalizePhone, AppError } = require('../utils/helpers');

const router = express.Router();

const loginSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    phone: z.string().min(8, 'Nomor HP tidak valid'),
  }),
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { name, phone } = req.validated.body;
    const cleanPhone = normalizePhone(phone);

    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      // User baru selalu WARGA (server-assigned role)
      user = await prisma.user.create({
        data: {
          name,
          phone: cleanPhone,
          role: 'WARGA',
        },
      });
    } else {
      if (!user.isActive) {
        throw new AppError('Akun Anda dinonaktifkan oleh Admin', 403);
      }
      // Update nama jika ada perubahan profil saat login
      if (user.name !== name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name },
        });
      }
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return sendResponse(res, 200, 'Login berhasil', {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res) => {
  return sendResponse(res, 200, 'Data profil pengguna', {
    user: {
      id: req.user.id,
      name: req.user.name,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
});

const fcmSchema = z.object({
  body: z.object({
    fcmToken: z.string().min(1, 'Token FCM diperlukan'),
  }),
});

router.post('/fcm-token', authenticate, validate(fcmSchema), async (req, res, next) => {
  try {
    const { fcmToken } = req.validated.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken },
    });
    return sendResponse(res, 200, 'FCM token berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
