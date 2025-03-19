const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

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
    console.log('Fetching bookings for user:', req.user._id);
    
    const query = {
      $or: [
        { student: req.user._id },
        { tutor: req.user._id }
      ]
    };
    
    console.log('Query:', JSON.stringify(query));
    
    // Make sure we're not filtering by status, so we get all bookings including 'upcoming' ones
    const bookings = await Booking.find(query)
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('service', 'title price')
      .sort('-date');
    
    console.log('Found bookings:', bookings.length);
    console.log('Booking statuses:', bookings.map(b => b.status));
    
    // Log each booking to help diagnose the issue
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`, {
        id: booking._id,
        student: booking.student?._id,
        tutor: booking.tutor?._id,
        service: booking.service?.title,
        date: booking.date,
        status: booking.status
      });
    });
    
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create booking
router.post('/', protect, async (req, res) => {
  try {
    console.log('Received booking request:', {
      body: req.body,
      user: req.user._id
    });

    const service = await Service.findById(req.body.service);
    console.log('Found service:', service);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if tutor exists
    const tutor = await User.findById(req.body.tutor);
    console.log('Found tutor:', tutor);
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Calculate end time (add duration from service)
    const startTime = req.body.startTime;
    const [hours, minutes] = startTime.split(':');
    const endTimeDate = new Date();
    endTimeDate.setHours(parseInt(hours), parseInt(minutes) + service.duration);
    const endTime = `${endTimeDate.getHours().toString().padStart(2, '0')}:${endTimeDate.getMinutes().toString().padStart(2, '0')}`;

    console.log('Calculated times:', {
      startTime,
      endTime,
      duration: service.duration
    });

    // Check if slot is available
    const existingBooking = await Booking.findOne({
      tutor: req.body.tutor,
      date: req.body.date,
      startTime: startTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    const bookingData = {
      service: req.body.service,
      student: req.user._id,
      tutor: req.body.tutor,
      date: req.body.date,
      startTime: startTime,
      endTime: endTime,
      status: req.body.status || 'upcoming', // Use provided status or default to 'upcoming'
      paymentStatus: 'pending',
      amount: service.price,
      notes: req.body.notes || ''
    };

    console.log('Creating booking with data:', bookingData);

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate the response with related data
    const populatedBooking = await Booking.findById(booking._id)
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('service', 'title price');

    console.log('Created booking:', populatedBooking);

    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error('Booking creation error:', {
      error: err,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message
    });
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
