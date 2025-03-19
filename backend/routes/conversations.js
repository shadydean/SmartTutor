const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for current user
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name role profileImage')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread messages count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.user.id,
      read: false
    });
    res.json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is part of the conversation
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        recipient: req.user.id,
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new conversation
router.post('/', protect, async (req, res) => {
  try {
    const { tutorId } = req.body;
    
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: {
        $all: [req.user.id, tutorId]
      }
    });
    
    if (existingConversation) {
      return res.json(existingConversation);
    }
    
    // Create new conversation
    const conversation = new Conversation({
      participants: [req.user.id, tutorId]
    });
    
    await conversation.save();
    
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name role profileImage');
    
    res.status(201).json(populatedConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message in a conversation
router.post('/:conversationId/messages', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this conversation' });
    }

    const recipient = conversation.participants.find(
      p => p.toString() !== req.user.id.toString()
    );

    const message = new Message({
      conversation: conversation._id,
      sender: req.user.id,
      recipient: recipient,
      content: content
    });

    await message.save();
    
    // Update conversation timestamp
    conversation.updatedAt = Date.now();
    await conversation.save();

    // Populate sender info before sending response
    await message.populate('sender', 'name');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
