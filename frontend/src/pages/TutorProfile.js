import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Chip,
  Tab,
  Tabs,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  WorkHistory as WorkIcon,
  Book as BookIcon,
  Star as StarIcon,
  History as HistoryIcon,
  AttachMoney as MoneyIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tutor-profile-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function TutorProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [tabValue, setTabValue] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    education: '',
    experience: '',
    subjects: [],
    hourlyRate: '',
  });
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [earnings, setEarnings] = useState({
    total: 0,
    monthly: [],
  });

  // All useEffect hooks grouped together at the top
  useEffect(() => {
    // Check user role and redirect if needed
    if (user && user.role !== 'tutor') {
      setShouldRedirect(true);
    }

    // Update profile data when user data is available
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        education: user.education || '',
        experience: user.experience || '',
        subjects: user.subjects || [],
        hourlyRate: user.hourlyRate || '',
      });
    }
  }, [user]);

  // Add new useEffect to fetch tutor data
  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/tutors/${user?._id}`);
        if (response.data) {
          const tutorData = response.data;
          setProfileData({
            name: tutorData.name || '',
            bio: tutorData.bio || '',
            education: tutorData.education || '',
            experience: tutorData.experience || '',
            subjects: tutorData.subjects || [],
            hourlyRate: tutorData.hourlyRate || '',
          });
          // Update the user state with the tutor's data
          setUser(prevUser => ({
            ...prevUser,
            ...tutorData,
            profileImage: tutorData.profileImage ? `http://localhost:9000${tutorData.profileImage}` : null
          }));
        }
      } catch (error) {
        console.error('Error fetching tutor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchTutorData();
    }
  }, [user?._id]);

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/bookings/my-bookings');
        if (response.data && Array.isArray(response.data)) {
          setBookingHistory(response.data);
        }
      } catch (error) {
        console.error('Error fetching booking history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchEarnings = async () => {
      try {
        const response = await api.get('/tutors/earnings');
        if (response.data) {
          setEarnings(response.data);
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      }
    };

    // Only fetch data if user is a tutor
    if (user?.role === 'tutor') {
      fetchBookingHistory();
      fetchEarnings();
    }
  }, [user]);

  // Early return for redirect
  if (shouldRedirect) {
    return <Navigate to="/profile" />;
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        await api.put('/tutors/profile', profileData);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectAdd = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      const newSubject = event.target.value.trim();
      if (!profileData.subjects.includes(newSubject)) {
        setProfileData(prev => ({
          ...prev,
          subjects: [...prev.subjects, newSubject]
        }));
      }
      event.target.value = '';
    }
  };

  const handleSubjectDelete = (subjectToDelete) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject !== subjectToDelete)
    }));
  };

  const handleMessageTutor = async () => {
    try {
      const response = await api.post('/conversations', {
        tutorId: user._id
      });
      
      // Navigate to messages page with the new conversation
      navigate('/messages', { state: { conversationId: response.data._id } });
    } catch (error) {
      console.error('Error starting conversation:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar 
              src={user?.profileImage ? `http://localhost:9000${user.profileImage}` : undefined}
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  variant="standard"
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h4" gutterBottom>
                  {profileData.name}
                </Typography>
              )}
              
              <Typography variant="subtitle1" color="text.secondary">
                Tutor
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Rating value={4.5} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  (4.5/5 from 24 reviews)
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {user?.role === 'student' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<MessageIcon />}
                  onClick={handleMessageTutor}
                >
                  Message Tutor
                </Button>
              )}
              <Button
                variant={isEditing ? "contained" : "outlined"}
                startIcon={<EditIcon />}
                onClick={handleEditToggle}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Profile Content */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Profile" value={1} />
              <Tab label="Education" value={2} />
              <Tab label="Experience" value={3} />
              <Tab label="Subjects" value={4} />
              <Tab label="Reviews" value={5} />
              <Tab label="Earnings" value={6} />
            </Tabs>

            {/* About Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>Bio</Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <Typography variant="body1" paragraph>
                  {profileData.bio || 'No bio added yet.'}
                </Typography>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Education</Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="education"
                  value={profileData.education}
                  onChange={handleInputChange}
                  placeholder="Your educational background..."
                />
              ) : (
                <Typography variant="body1">
                  {profileData.education || 'No education details added yet.'}
                </Typography>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Hourly Rate</Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="hourlyRate"
                  type="number"
                  value={profileData.hourlyRate}
                  onChange={handleInputChange}
                  placeholder="Your hourly rate..."
                  InputProps={{
                    startAdornment: <Typography>$</Typography>
                  }}
                />
              ) : (
                <Typography variant="body1">
                  ${profileData.hourlyRate || '0'}/hour
                </Typography>
              )}
            </TabPanel>

            {/* Experience Tab */}
            <TabPanel value={tabValue} index={2}>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="experience"
                  value={profileData.experience}
                  onChange={handleInputChange}
                  placeholder="Share your teaching experience..."
                />
              ) : (
                <Typography variant="body1">
                  {profileData.experience || 'No experience details added yet.'}
                </Typography>
              )}
            </TabPanel>

            {/* Subjects Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ mb: 2 }}>
                {isEditing && (
                  <TextField
                    fullWidth
                    placeholder="Add subjects (Press Enter)"
                    onKeyPress={handleSubjectAdd}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.subjects.map((subject, index) => (
                  <Chip
                    key={index}
                    label={subject}
                    onDelete={isEditing ? () => handleSubjectDelete(subject) : undefined}
                  />
                ))}
              </Box>
            </TabPanel>

            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={4}>
              <List>
                {[1, 2, 3].map((review, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>S</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography component="span" variant="subtitle1">
                              Student Name
                            </Typography>
                            <Rating value={5} size="small" readOnly />
                          </Box>
                        }
                        secondary={
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Great tutor! Very patient and knowledgeable.
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < 2 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </TabPanel>

            {/* Bookings Tab */}
            <TabPanel value={tabValue} index={5}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mr: 2 }}>
                    Loading bookings...
                  </Typography>
                </Box>
              ) : bookingHistory.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No bookings found.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Student</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Earnings</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookingHistory.map((booking, index) => (
                        <TableRow key={booking._id || index}>
                          <TableCell>
                            {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {booking.student?.name || 'Unknown Student'}
                          </TableCell>
                          <TableCell>
                            {booking.service?.title || (booking.service && typeof booking.service === 'string' ? booking.service : 'N/A')}
                          </TableCell>
                          <TableCell>
                            {booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={booking.status || 'unknown'}
                              color={
                                booking.status === 'completed'
                                  ? 'success'
                                  : booking.status === 'upcoming'
                                  ? 'primary'
                                  : booking.status === 'cancelled'
                                  ? 'error'
                                  : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            ${booking.amount ? booking.amount.toFixed(2) : '0.00'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Earnings Tab */}
            <TabPanel value={tabValue} index={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Total Earnings
                </Typography>
                <Typography variant="h3" color="primary">
                  ${earnings.total}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Monthly Earnings
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell>Sessions</TableCell>
                      <TableCell>Hours</TableCell>
                      <TableCell>Earnings</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {earnings.monthly.map((month, index) => (
                      <TableRow key={index}>
                        <TableCell>{month.month}</TableCell>
                        <TableCell>{month.sessions}</TableCell>
                        <TableCell>{month.hours}</TableCell>
                        <TableCell>${month.earnings}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TutorProfile;
