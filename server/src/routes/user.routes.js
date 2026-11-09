const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { sendResponse, normalizePhone, AppError } = require('../utils/helpers');

const router = express.Router();

// GET /api/users - Hanya Admin
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return sendResponse(res, 200, 'Daftar pengguna', users);
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Buat Satpam/Admin baru
const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    role: z.enum(['ADMIN', 'SATPAM', 'WARGA']),
  }),
});

router.post('/', authenticate, authorize('ADMIN'), validate(createUserSchema), async (req, res, next) => {
  try {
    const { name, phone, role } = req.validated.body;
    const cleanPhone = normalizePhone(phone);

    const existing = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      throw new AppError('Nomor HP sudah terdaftar', 409);
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone: cleanPhone,
        role,
      },
    });

    return sendResponse(res, 201, 'Petugas/Pengguna berhasil dibuat', user);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Soft delete
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return sendResponse(res, 200, 'Pengguna berhasil dinonaktifkan');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
