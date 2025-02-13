const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// Get all bookings (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('service', 'title price');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { student: req.user._id },
        { tutor: req.user._id }
      ]
    })
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('service', 'title price')
      .sort('-date');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create booking
router.post('/', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.body.service);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if slot is available
    const existingBooking = await Booking.findOne({
      service: req.body.service,
      tutor: req.body.tutor,
      date: req.body.date,
      startTime: req.body.startTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    const booking = new Booking({
      ...req.body,
      student: req.user._id,
      amount: service.price
    });

    await booking.save();

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to update
    if (
      booking.tutor.toString() !== req.user._id.toString() &&
      booking.student.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = req.body.status;
    if (req.body.status === 'completed') {
      booking.paymentStatus = 'completed';
    }

    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add feedback to booking
router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only students can provide feedback' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only provide feedback for completed sessions' });
    }

    booking.feedback = {
      rating: req.body.rating,
      review: req.body.review,
      createdAt: Date.now()
    };

    await booking.save();

    // Update tutor's average rating
    const tutorBookings = await Booking.find({
      tutor: booking.tutor,
      'feedback.rating': { $exists: true }
    });

    const totalRating = tutorBookings.reduce((sum, b) => sum + b.feedback.rating, 0);
    const averageRating = totalRating / tutorBookings.length;

    await User.findByIdAndUpdate(booking.tutor, {
      averageRating: Math.round(averageRating * 10) / 10
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
