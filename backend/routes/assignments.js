const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const { protect } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/assignments';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all assignments (with filters)
router.get('/', protect, async (req, res) => {
  try {
    const { status, role } = req.user;
    let query = {};
    
    // If student, show only their assignments
    if (role === 'student') {
      query.student = req.user.id;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const assignments = await Assignment.find(query)
      .populate('student', 'name')
      .populate('tutor', 'name')
      .sort({ createdAt: -1 });
    
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single assignment
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('student', 'name')
      .populate('tutor', 'name');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new assignment
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { title, description, bounty, dueDate } = req.body;
    
    const assignment = new Assignment({
      title,
      description,
      filePath: req.file.path.replace('uploads/', ''),
      bounty: parseFloat(bounty),
      student: req.user.id,
      dueDate: new Date(dueDate)
    });
    
    await assignment.save();
    
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('student', 'name');
    
    res.status(201).json(populatedAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Claim assignment (tutors only)
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    if (assignment.status !== 'open') {
      return res.status(400).json({ message: 'Assignment is not available for claiming' });
    }
    
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Only tutors can claim assignments' });
    }
    
    assignment.status = 'in_progress';
    assignment.tutor = req.user.id;
    await assignment.save();
    
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('student', 'name')
      .populate('tutor', 'name');
    
    res.json(populatedAssignment);
  } catch (error) {
    console.error('Error claiming assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit solution
router.post('/:id/solution', protect, upload.single('file'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    if (assignment.tutor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to submit solution' });
    }
    
    if (assignment.status !== 'in_progress') {
      return res.status(400).json({ message: 'Assignment is not in progress' });
    }
    
    assignment.solution = {
      content: req.body.content,
      filePath: req.file ? req.file.path : undefined,
      submittedAt: Date.now()
    };
    assignment.status = 'completed';
    await assignment.save();
    
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('student', 'name')
      .populate('tutor', 'name');
    
    res.json(populatedAssignment);
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download assignment file
router.get('/download/:filename', protect, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'assignments', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({ message: 'File not found' });
    }

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
});

module.exports = router; 