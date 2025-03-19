import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

function Assignments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [openNewAssignment, setOpenNewAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    bounty: '',
    dueDate: '',
    file: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/assignments');
      setAssignments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('bounty', newAssignment.bounty);
      formData.append('dueDate', newAssignment.dueDate);
      formData.append('file', newAssignment.file);

      const response = await api.post('/assignments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAssignments([response.data, ...assignments]);
      setOpenNewAssignment(false);
      setNewAssignment({
        title: '',
        description: '',
        bounty: '',
        dueDate: '',
        file: null
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleFileChange = (event) => {
    setNewAssignment({
      ...newAssignment,
      file: event.target.files[0]
    });
  };

  const handleClaimAssignment = async (assignmentId) => {
    try {
      const response = await api.post(`/assignments/${assignmentId}/claim`);
      setAssignments(assignments.map(assignment =>
        assignment._id === assignmentId ? response.data : assignment
      ));
    } catch (error) {
      console.error('Error claiming assignment:', error);
    }
  };

  const handleViewPDF = async (filePath) => {
    try {
      console.log('Original filePath:', filePath);
      
      // Extract just the filename from the path
      const filename = filePath.split('/').pop();
      console.log('Filename:', filename);
      
      // Make the request to the download endpoint
      const response = await api.get(`/assignments/download/${filename}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      console.log('Response status:', response.status);
      
      // Create blob and open PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error.response?.data || error.message);
      alert('Failed to load PDF. Please check the console for details.');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Assignments</Typography>
        {user?.role === 'student' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewAssignment(true)}
          >
            New Assignment
          </Button>
        )}
      </Box>

      {/* New Assignment Dialog */}
      <Dialog
        open={openNewAssignment}
        onClose={() => setOpenNewAssignment(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newAssignment.title}
            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newAssignment.description}
            onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Bounty"
            type="number"
            fullWidth
            value={newAssignment.bounty}
            onChange={(e) => setNewAssignment({ ...newAssignment, bounty: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="datetime-local"
            fullWidth
            value={newAssignment.dueDate}
            onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFileIcon />}
            sx={{ mb: 2 }}
          >
            Upload PDF
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </Button>
          {newAssignment.file && (
            <Typography variant="body2" color="textSecondary">
              Selected file: {newAssignment.file.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewAssignment(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAssignment}
            variant="contained"
            disabled={!newAssignment.title || !newAssignment.description || !newAssignment.bounty || !newAssignment.dueDate || !newAssignment.file}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignments List */}
      <Grid container spacing={3}>
        {assignments.map((assignment) => (
          <Grid item xs={12} key={assignment._id}>
            <Card>
              <CardHeader
                title={assignment.title}
                subheader={`Posted by ${assignment.student?.name} • ${formatDate(assignment.createdAt)}`}
                action={
                  <Chip
                    label={assignment.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(assignment.status)}
                  />
                }
              />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {assignment.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Bounty: ${assignment.bounty}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      Due: {formatDate(assignment.dueDate)}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      onClick={() => handleViewPDF(assignment.filePath)}
                      sx={{ mt: 1 }}
                    >
                      View Assignment PDF
                    </Button>
                  </Box>
                  {user?.role === 'tutor' && assignment.status === 'open' && (
                    <Button
                      variant="contained"
                      onClick={() => handleClaimAssignment(assignment._id)}
                    >
                      Claim Assignment
                    </Button>
                  )}
                  {assignment.status === 'in_progress' && assignment.tutor?._id === user?.id && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/assignments/${assignment._id}/solve`)}
                    >
                      Submit Solution
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Assignments; 