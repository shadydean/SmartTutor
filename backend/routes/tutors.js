const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Get all tutors with search and filter
router.get('/', protect, async (req, res) => {
  try {
    const { search, subject } = req.query;
    
    // Build query
    const query = { role: 'tutor' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { subjects: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (subject) {
      query.subjects = { $regex: subject, $options: 'i' };
    }

    const tutors = await User.find(query)
      .select('_id name bio subjects hourlyRate rating reviewCount')
      .sort({ rating: -1 });

    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tutor's earnings
router.get('/earnings', protect, authorize('tutor'), async (req, res) => {
  try {
    // Get all completed bookings for the tutor
    const bookings = await Booking.find({
      tutor: req.user._id,
      status: 'completed',
      paymentStatus: 'completed'
    });

    // Calculate total earnings
    const total = bookings.reduce((sum, booking) => sum + booking.amount, 0);

    // Calculate monthly earnings
    const monthly = bookings.reduce((acc, booking) => {
      const date = new Date(booking.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += booking.amount;
      return acc;
    }, {});

    // Convert monthly earnings to array format
    const monthlyEarnings = Object.entries(monthly).map(([month, amount]) => ({
      month,
      amount
    })).sort((a, b) => b.month.localeCompare(a.month));

    res.json({
      total,
      monthly: monthlyEarnings
    });
  } catch (err) {
    console.error('Error fetching earnings:', err);
    res.status(500).json({ message: 'Error fetching earnings' });
  }
});

module.exports = router;
