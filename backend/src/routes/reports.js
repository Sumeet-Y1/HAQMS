const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/doctor-stats
// FIX: Replaced nested sequential loop with parallel Promise.all per doctor
// and used groupBy aggregation where possible
router.get('/doctor-stats', authenticate, async (req, res) => {
  try {
    const start = Date.now();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // FIX: Fetch all doctors + all appointment counts + queue counts in parallel
    const [doctors, appointmentStats, queueStats] = await Promise.all([
      prisma.doctor.findMany(),
      prisma.appointment.groupBy({
        by: ['doctorId', 'status'],
        _count: { id: true },
      }),
      prisma.queueToken.groupBy({
        by: ['doctorId'],
        where: { createdAt: { gte: today } },
        _count: { id: true },
      }),
    ]);

    // Build lookup maps for O(1) access
    const appointmentMap = {};
    for (const stat of appointmentStats) {
      if (!appointmentMap[stat.doctorId]) {
        appointmentMap[stat.doctorId] = { total: 0, COMPLETED: 0, CANCELLED: 0 };
      }
      appointmentMap[stat.doctorId].total += stat._count.id;
      if (stat.status === 'COMPLETED') appointmentMap[stat.doctorId].COMPLETED = stat._count.id;
      if (stat.status === 'CANCELLED') appointmentMap[stat.doctorId].CANCELLED = stat._count.id;
    }

    const queueMap = {};
    for (const q of queueStats) {
      queueMap[q.doctorId] = q._count.id;
    }

    // Build report data from in-memory maps — no more DB calls in loop
    const reportData = doctors.map((doc) => {
      const stats = appointmentMap[doc.id] || { total: 0, COMPLETED: 0, CANCELLED: 0 };
      const revenue = stats.COMPLETED * doc.consultationFee;
      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        department: doc.department,
        totalAppointments: stats.total,
        completedAppointments: stats.COMPLETED,
        cancelledAppointments: stats.CANCELLED,
        todayQueueSize: queueMap[doc.id] || 0,
        revenue,
      };
    });

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      timeTakenMs: durationMs,
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;