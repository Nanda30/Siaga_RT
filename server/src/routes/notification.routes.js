const express = require('express');
const prisma = require('../config/prisma');
const { authenticate } = require('../middleware/auth');
const { sendResponse } = require('../utils/helpers');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return sendResponse(res, 200, 'Daftar notifikasi', notifications);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { isRead: true },
    });
    return sendResponse(res, 200, 'Notifikasi ditandai dibaca');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
