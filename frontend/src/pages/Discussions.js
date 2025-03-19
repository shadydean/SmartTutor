import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Reply as ReplyIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

function Discussions() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [openNewDiscussion, setOpenNewDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const response = await api.get('/discussions');
      setDiscussions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    try {
      const response = await api.post('/discussions', newDiscussion);
      setDiscussions([response.data, ...discussions]);
      setOpenNewDiscussion(false);
      setNewDiscussion({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const handleAddReply = async (discussionId) => {
    try {
      const response = await api.post(`/discussions/${discussionId}/replies`, {
        content: replyContent
      });
      
      setDiscussions(discussions.map(disc => 
        disc._id === discussionId ? response.data : disc
      ));
      
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Discussions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewDiscussion(true)}
        >
          New Discussion
        </Button>
      </Box>

      {/* New Discussion Dialog */}
      <Dialog
        open={openNewDiscussion}
        onClose={() => setOpenNewDiscussion(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Discussion</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={newDiscussion.content}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDiscussion(false)}>Cancel</Button>
          <Button onClick={handleCreateDiscussion} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Discussions List */}
      <Grid container spacing={3}>
        {discussions.map((discussion) => (
          <Grid item xs={12} key={discussion._id}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar
                    src={discussion.author?.profileImage ? `http://localhost:9000${discussion.author.profileImage}` : undefined}
                  >
                    {discussion.author?.name?.charAt(0)}
                  </Avatar>
                }
                title={discussion.title}
                subheader={`${discussion.author?.name} • ${formatDate(discussion.createdAt)}`}
              />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {discussion.content}
                </Typography>

                {/* Replies */}
                {discussion.replies.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Replies
                    </Typography>
                    {discussion.replies.map((reply, index) => (
                      <Box key={index} sx={{ ml: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar
                            src={reply.author?.profileImage ? `http://localhost:9000${reply.author.profileImage}` : undefined}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          >
                            {reply.author?.name?.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle2">
                            {reply.author?.name} • {formatDate(reply.createdAt)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ ml: 5 }}>
                          {reply.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Reply Form */}
                {replyingTo === discussion._id ? (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleAddReply(discussion._id)}
                        disabled={!replyContent.trim()}
                      >
                        Post Reply
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    startIcon={<ReplyIcon />}
                    onClick={() => setReplyingTo(discussion._id)}
                    sx={{ mt: 2 }}
                  >
                    Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Discussions; 