const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  const {
    name,
    bio,
    education,
    experience,
    subjects,
  } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.education = education || user.education;
    user.experience = experience || user.experience;
    user.subjects = subjects || user.subjects;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all tutors
router.get('/tutors', async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('-password');
    res.json(tutors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get tutor earnings
router.get('/tutors/earnings', protect, async (req, res) => {
  try {
    // Ensure user is a tutor
    const user = await User.findById(req.user.id);
    if (user.role !== 'tutor') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Mock earnings data - replace with actual database query
    const earnings = {
      total: 2500,
      monthly: [
        {
          month: 'January 2025',
          sessions: 15,
          hours: 30,
          earnings: 750,
        },
        {
          month: 'February 2025',
          sessions: 20,
          hours: 40,
          earnings: 1000,
        },
        {
          month: 'March 2025',
          sessions: 15,
          hours: 30,
          earnings: 750,
        },
      ],
    };

    res.json(earnings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
