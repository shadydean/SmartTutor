import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Profile() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    education: user?.education || '',
    experience: user?.experience || '',
    subjects: user?.subjects || [],
  });
  const [bookingHistory, setBookingHistory] = useState([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    monthly: [],
  });

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const response = await axios.get('/api/bookings/history');
        setBookingHistory(response.data);
      } catch (error) {
        console.error('Error fetching booking history:', error);
      }
    };

    const fetchEarnings = async () => {
      if (user?.role === 'tutor') {
        try {
          const response = await axios.get('/api/tutors/earnings');
          setEarnings(response.data);
        } catch (error) {
          console.error('Error fetching earnings:', error);
        }
      }
    };

    fetchBookingHistory();
    fetchEarnings();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      // TODO: Implement profile update API call
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectDelete = (subjectToDelete) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject !== subjectToDelete)
    }));
  };

  const handleSubjectAdd = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      setProfileData(prev => ({
        ...prev,
        subjects: [...prev.subjects, e.target.value]
      }));
      e.target.value = '';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 3,
              position: 'relative',
            }}
          >
            <Avatar
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
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Typography>
              
              {user?.role === 'tutor' && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={4.5} precision={0.5} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    (4.5/5 from 24 reviews)
                  </Typography>
                </Box>
              )}
            </Box>

            <Button
              variant={isEditing ? "contained" : "outlined"}
              startIcon={<EditIcon />}
              onClick={handleEditToggle}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Paper>
        </Grid>

        {/* Profile Content */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
              centered
            >
              <Tab icon={<SchoolIcon />} label="About" />
              {user?.role === 'tutor' && <Tab icon={<WorkIcon />} label="Experience" />}
              <Tab icon={<BookIcon />} label="Subjects" />
              {user?.role === 'tutor' && <Tab icon={<StarIcon />} label="Reviews" />}
              <Tab icon={<HistoryIcon />} label="Booking History" />
              {user?.role === 'tutor' && <Tab icon={<MoneyIcon />} label="Earnings" />}
            </Tabs>

            <TabPanel value={tabValue} index={0}>
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
            </TabPanel>

            {user?.role === 'tutor' && (
              <TabPanel value={tabValue} index={1}>
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
            )}

            <TabPanel value={tabValue} index={user?.role === 'tutor' ? 2 : 1}>
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

            {user?.role === 'tutor' && (
              <TabPanel value={tabValue} index={3}>
                <List>
                  {/* Sample reviews - replace with actual data */}
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
            )}

            {/* Booking History Tab */}
            <TabPanel value={tabValue} index={user?.role === 'tutor' ? 4 : 3}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      {user?.role === 'student' ? (
                        <TableCell>Tutor</TableCell>
                      ) : (
                        <TableCell>Student</TableCell>
                      )}
                      <TableCell>Service</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      {user?.role === 'tutor' && <TableCell>Earnings</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookingHistory.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>
                          {new Date(booking.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user?.role === 'student'
                            ? booking.tutor.name
                            : booking.student.name}
                        </TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>{booking.duration} mins</TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
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
                        {user?.role === 'tutor' && (
                          <TableCell>${booking.earnings}</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Earnings Tab (Tutors Only) */}
            {user?.role === 'tutor' && (
              <TabPanel value={tabValue} index={5}>
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
                      {earnings.monthly.map((month) => (
                        <TableRow key={month.month}>
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
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;
