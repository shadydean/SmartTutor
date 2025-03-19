const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Get dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { student: req.user._id },
        { tutor: req.user._id }
      ]
    });

    const stats = {
      totalSessions: bookings.length,
      totalEarnings: req.user.role === 'tutor' 
        ? bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0)
        : 0,
      averageRating: 4.5, // TODO: Implement actual rating calculation
      completionRate: (bookings.filter(b => b.status === 'completed').length / bookings.length) * 100 || 0
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Get upcoming sessions
router.get('/upcoming-sessions', protect, async (req, res) => {
  try {
    // Create a date object for today with time set to 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Fetching upcoming sessions for user:', req.user._id);
    console.log('Current date used for filtering:', today);
    
    const upcomingSessions = await Booking.find({
      $and: [
        {
          $or: [
            { student: req.user._id },
            { tutor: req.user._id }
          ]
        },
        {
          $or: [
            { date: { $gt: today } },
            { 
              date: { $eq: today },
              startTime: { $gte: today.getHours() + ':' + today.getMinutes() }
            }
          ]
        },
        { status: { $nin: ['cancelled', 'completed'] } }
      ]
    })
    .sort({ date: 1, startTime: 1 })
    .populate('student', 'name email')
    .populate('tutor', 'name email')
    .populate('service', 'title')
    .limit(5);

    console.log('Found upcoming sessions:', upcomingSessions.length);
    res.json(upcomingSessions);
  } catch (err) {
    console.error('Error fetching upcoming sessions:', err);
    res.status(500).json({ message: 'Error fetching upcoming sessions' });
  }
});

// Get recent activity
router.get('/recent-activity', protect, async (req, res) => {
  try {
    const recentBookings = await Booking.find({
      $or: [
        { student: req.user._id },
        { tutor: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('student', 'name email')
    .populate('tutor', 'name email')
    .populate('service', 'title')
    .limit(10);

    const activity = recentBookings.map(booking => ({
      id: booking._id,
      type: 'booking',
      title: booking.service.title,
      description: `Session with ${req.user.role === 'tutor' ? booking.student.name : booking.tutor.name}`,
      status: booking.status,
      date: booking.date,
      time: booking.startTime
    }));

    res.json(activity);
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
});

// Get earnings data (for charts)
router.get('/earnings-data', protect, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.json({
        labels: [],
        data: []
      });
    }

    const bookings = await Booking.find({
      tutor: req.user._id,
      status: 'completed'
    }).sort({ date: 1 });

    const monthlyEarnings = bookings.reduce((acc, booking) => {
      const date = new Date(booking.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += booking.amount;
      return acc;
    }, {});

    const labels = Object.keys(monthlyEarnings);
    const data = Object.values(monthlyEarnings);

    res.json({
      labels,
      data
    });
  } catch (err) {
    console.error('Error fetching earnings data:', err);
    res.status(500).json({ message: 'Error fetching earnings data' });
  }
});

// Get sessions data (for charts)
router.get('/sessions-data', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { student: req.user._id },
        { tutor: req.user._id }
      ]
    }).sort({ date: 1 });

    const monthlySessions = bookings.reduce((acc, booking) => {
      const date = new Date(booking.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear]++;
      return acc;
    }, {});

    const labels = Object.keys(monthlySessions);
    const data = Object.values(monthlySessions);

    res.json({
      labels,
      data
    });
  } catch (err) {
    console.error('Error fetching sessions data:', err);
    res.status(500).json({ message: 'Error fetching sessions data' });
  }
});

module.exports = router;
