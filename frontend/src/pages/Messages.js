import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Badge,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // If we have a conversation ID from navigation, select that conversation
    if (location.state?.conversationId) {
      console.log('Looking for conversation:', location.state.conversationId);
      const conversation = conversations.find(c => c._id === location.state.conversationId);
      console.log('Found conversation:', conversation);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversations, location.state]);

  useEffect(() => {
    if (selectedConversation) {
      console.log('Selected conversation changed:', selectedConversation);
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/conversations');
      console.log('Fetched conversations:', response.data);
      
      // Process conversations to get the other user
      const processedConversations = response.data.map(conv => {
        const otherUser = conv.participants.find(p => p._id !== user._id);
        console.log('Processing conversation:', {
          convId: conv._id,
          participants: conv.participants,
          currentUserId: user._id,
          otherUser
        });
        return {
          ...conv,
          id: conv._id,
          otherUser: otherUser || { name: 'Unknown User' }
        };
      });
      
      console.log('Processed conversations:', processedConversations);
      setConversations(processedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      console.log('Fetching messages for conversation:', conversationId);
      const response = await api.get('/conversations/' + conversationId + '/messages');
      console.log('Fetched messages:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      console.log('Sending message to conversation:', selectedConversation._id);
      const response = await api.post('/conversations/' + selectedConversation._id + '/messages', {
        content: newMessage,
      });
      console.log('Message sent:', response.data);
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ 
        display: 'flex', 
        height: 'calc(100vh - 140px)',
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        {/* Conversations List */}
        <Fade in timeout={800}>
          <Box sx={{ 
            width: 300, 
            borderRight: 1, 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              Conversations
            </Typography>
            <List sx={{ 
              overflow: 'auto',
              flexGrow: 1,
              '& .MuiListItem-root': {
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.04)',
                  transform: 'translateY(-2px)',
                },
              },
            }}>
              {loading && conversations.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                conversations.map((conversation) => (
                  <React.Fragment key={conversation._id}>
                    <ListItem 
                      button 
                      selected={selectedConversation?._id === conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <ListItemAvatar>
                        <Badge
                          color="primary"
                          variant="dot"
                          invisible={!conversation.unreadCount}
                        >
                          <Avatar
                            src={conversation.otherUser?.profileImage ? `http://localhost:9000${conversation.otherUser.profileImage}` : undefined}
                          >
                            {conversation.otherUser?.name?.charAt(0) || '?'}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={conversation.otherUser?.name || 'Unknown User'}
                        secondary={conversation.lastMessage?.content || 'No messages yet'}
                        secondaryTypographyProps={{
                          noWrap: true,
                          style: { maxWidth: '180px' }
                        }}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          </Box>
        </Fade>

        {/* Messages Area */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: 'grey.50',
        }}>
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <Box sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'white',
              }}>
                <Typography variant="h6">
                  {selectedConversation?.otherUser?.name || 'Unknown User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedConversation?.otherUser?.role === 'tutor' ? 'Tutor' : 'Student'}
                </Typography>
              </Box>

              {/* Messages List */}
              <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
              }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  messages.map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        alignSelf: message.sender?._id === user?._id ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        mb: 2,
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: message.sender?._id === user?._id ? 'primary.main' : 'white',
                          color: message.sender?._id === user?._id ? 'white' : 'text.primary',
                          borderRadius: 2,
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.8,
                          }}
                        >
                          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  bgcolor: 'white',
                  display: 'flex',
                  gap: 1,
                }}
              >
                <IconButton
                  size="large"
                  sx={{
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <AttachFileIcon />
                </IconButton>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                />
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!newMessage.trim()}
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                bgcolor: 'grey.50',
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a conversation to start messaging
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connect with your tutors and students
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Messages;
