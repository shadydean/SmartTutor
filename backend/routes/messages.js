const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');

// Get all messages for a conversation
router.get('/conversation/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name role profileImage')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a new message
router.post('/', protect, async (req, res) => {
  try {
    const { content, conversationId } = req.body;
    
    // Verify the conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Create new message
    const message = new Message({
      content,
      conversation: conversationId,
      sender: req.user.id
    });
    
    await message.save();
    
    // Update the conversation's last message
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();
    
    // Populate sender information
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name role profileImage');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 