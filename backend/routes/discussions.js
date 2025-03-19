const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const { protect } = require('../middleware/auth');

// Get all discussions
router.get('/', protect, async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate('author', 'name role profileImage')
      .populate('replies.author', 'name role profileImage')
      .sort({ updatedAt: -1 });
    res.json(discussions);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single discussion
router.get('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name role profileImage')
      .populate('replies.author', 'name role profileImage');
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new discussion
router.post('/', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const discussion = new Discussion({
      title,
      content,
      author: req.user.id
    });
    
    await discussion.save();
    
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name role profileImage');
    
    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a reply to a discussion
router.post('/:id/replies', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    discussion.replies.push({
      content,
      author: req.user.id
    });
    
    await discussion.save();
    
    const updatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name role profileImage')
      .populate('replies.author', 'name role profileImage');
    
    res.json(updatedDiscussion);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 