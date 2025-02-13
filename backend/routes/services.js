const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Service = require('../models/Service');

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find()
      .populate('tutors', 'name email profileImage averageRating')
      .sort('-createdAt');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('tutors', 'name email profileImage averageRating');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create service (Admin & Tutor only)
router.post('/', protect, authorize('admin', 'tutor'), async (req, res) => {
  try {
    const service = new Service({
      ...req.body,
      tutors: [req.user._id]
    });
    
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service
router.put('/:id', protect, authorize('admin', 'tutor'), async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Make sure user is service owner or admin
    if (service.tutors.includes(req.user._id) || req.user.role === 'admin') {
      service = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      return res.json(service);
    }
    
    res.status(401).json({ message: 'Not authorized to update this service' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service
router.delete('/:id', protect, authorize('admin', 'tutor'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Make sure user is service owner or admin
    if (service.tutors.includes(req.user._id) || req.user.role === 'admin') {
      await service.remove();
      return res.json({ message: 'Service removed' });
    }
    
    res.status(401).json({ message: 'Not authorized to delete this service' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add tutor to service
router.post('/:id/tutors', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const { tutorId } = req.body;
    
    if (service.tutors.includes(tutorId)) {
      return res.status(400).json({ message: 'Tutor already added to this service' });
    }
    
    service.tutors.push(tutorId);
    await service.save();
    
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
