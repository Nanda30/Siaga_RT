const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { sendResponse, AppError } = require('../utils/helpers');

const router = express.Router();

const createAlertSchema = z.object({
  body: z.object({
    type: z.enum(['EMERGENCY', 'CAUTION']),
    message: z.string().optional().nullable(),
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional().nullable(),
    clientId: z.string().optional().nullable(), // Idempotensi offline queue
  }),
});

// POST /api/alerts - Buat laporan darurat / siaga
router.post('/', authenticate, validate(createAlertSchema), async (req, res, next) => {
  try {
    const { type, message, latitude, longitude, address, clientId } = req.validated.body;

    // Cek idempotensi jika clientId dikirim
    if (clientId) {
      const existing = await prisma.alert.findUnique({
        where: { clientId },
        include: { user: { select: { id: true, name: true, phone: true } } },
      });
      if (existing) {
        return sendResponse(res, 200, 'Laporan sudah terdaftar sebelumnya (idempotent)', existing);
      }
    }

    const alert = await prisma.alert.create({
      data: {
        userId: req.user.id,
        type,
        message,
        latitude,
        longitude,
        address,
        clientId,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    // Catat log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_ALERT',
        description: `Laporan ${type} dibuat oleh ${req.user.name}`,
      },
    });

    // Buat notifikasi untuk admin & satpam
    const staff = await prisma.user.findMany({
      where: { role: { in: ['SATPAM', 'ADMIN'] }, isActive: true },
      select: { id: true },
    });

    if (staff.length > 0) {
      await prisma.notification.createMany({
        data: staff.map((s) => ({
          userId: s.id,
          title: type === 'EMERGENCY' ? '🚨 DARURAT WARGA!' : '⚠️ SIAGA / WASPADA',
          body: `${req.user.name}: ${message || 'Membutuhkan bantuan segera!'}`,
        })),
      });
    }

    return sendResponse(res, 201, 'Laporan berhasil dikirim', alert);
  } catch (error) {
    next(error);
  }
});

// GET /api/alerts - Daftar laporan
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    // Jika WARGA, hanya boleh lihat laporannya sendiri
    if (req.user.role === 'WARGA') {
      where.userId = req.user.id;
    }

    if (status) where.status = status;
    if (type) where.type = type;

    const [total, alerts] = await Promise.all([
      prisma.alert.count({ where }),
      prisma.alert.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          handledBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    return sendResponse(res, 200, 'Daftar alert', {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      alerts,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/alerts/:id - Detail laporan
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        handledBy: { select: { id: true, name: true } },
      },
    });

    if (!alert) {
      throw new AppError('Laporan tidak ditemukan', 404);
    }

    if (req.user.role === 'WARGA' && alert.userId !== req.user.id) {
      throw new AppError('Anda tidak memiliki akses ke laporan ini', 403);
    }

    return sendResponse(res, 200, 'Detail alert', alert);
  } catch (error) {
    next(error);
  }
});

// PUT /api/alerts/:id/status - Update status oleh SATPAM atau ADMIN
const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'RESPONDING', 'COMPLETED']),
  }),
});

router.put(
  '/:id/status',
  authenticate,
  authorize('SATPAM', 'ADMIN'),
  validate(updateStatusSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.validated.body;

      const alert = await prisma.alert.update({
        where: { id },
        data: {
          status,
          handledById: req.user.id,
        },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          handledBy: { select: { id: true, name: true } },
        },
      });

      // Notifikasi ke warga pembuat laporan
      await prisma.notification.create({
        data: {
          userId: alert.userId,
          title: `Update Status Laporan: ${status}`,
          body: `Laporan Anda sedang ditangani oleh ${req.user.name}`,
        },
      });

      return sendResponse(res, 200, 'Status laporan diperbarui', alert);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
