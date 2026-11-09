const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { sendResponse } = require('../utils/helpers');

const router = express.Router();

router.get('/', authenticate, authorize('SATPAM', 'ADMIN'), async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      pendingCount,
      respondingCount,
      completedCount,
      totalCount,
      todayCount,
      weekCount,
      monthCount,
      recentAlerts,
    ] = await Promise.all([
      prisma.alert.count({ where: { status: 'PENDING' } }),
      prisma.alert.count({ where: { status: 'RESPONDING' } }),
      prisma.alert.count({ where: { status: 'COMPLETED' } }),
      prisma.alert.count(),
      prisma.alert.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.alert.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.alert.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.alert.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          handledBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    return sendResponse(res, 200, 'Data dashboard', {
      counts: {
        pending: pendingCount,
        responding: respondingCount,
        completed: completedCount,
        total: totalCount,
      },
      periods: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
      },
      recent: recentAlerts,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
