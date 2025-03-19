import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

function AssignmentSolution() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [solution, setSolution] = useState({
    content: '',
    file: null
  });

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const response = await api.get(`/assignments/${id}`);
      setAssignment(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      setError('Failed to load assignment details');
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setSolution({
      ...solution,
      file: event.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('content', solution.content);
      if (solution.file) {
        formData.append('file', solution.file);
      }

      await api.post(`/assignments/${id}/solution`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/assignments');
    } catch (error) {
      console.error('Error submitting solution:', error);
      setError('Failed to submit solution. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Assignment not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Submit Solution
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {assignment.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {assignment.description}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Bounty: ${assignment.bounty}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Solution Details"
            multiline
            rows={6}
            value={solution.content}
            onChange={(e) => setSolution({ ...solution, content: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFileIcon />}
            sx={{ mb: 3 }}
          >
            Upload Solution PDF
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </Button>

          {solution.file && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Selected file: {solution.file.name}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!solution.content}
            >
              Submit Solution
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/assignments')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default AssignmentSolution; 