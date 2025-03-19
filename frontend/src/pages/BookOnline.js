import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  CircularProgress,
  CardActionArea,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';

const steps = ['Select Service', 'Choose Tutor', 'Select Time', 'Confirm Booking'];

const services = [
  {
    title: 'Assignment Help',
    description: 'Get expert help with your assignments across various subjects. Upload your work and get solutions from qualified tutors.',
    image: '/assignment.jpg',
    link: '/assignments',
  },
  {
    title: 'Performance Review',
    description: 'Detailed analysis of your academic performance with personalized feedback and improvement strategies.',
    image: '/performance.jpg',
    price: 49.99,
  },
  {
    title: '1-on-1 Mentoring',
    description: 'Personal guidance from experienced tutors in your field. Get dedicated support for your academic journey.',
    image: '/mentoring.jpg',
    price: 79.99,
  },
  {
    title: 'Study Groups',
    description: 'Join collaborative study sessions with peers. Learn together and share knowledge in a supportive environment.',
    image: '/study-groups.jpg',
    price: 29.99,
  },
  {
    title: 'Exam Preparation',
    description: 'Comprehensive exam prep with practice tests, study materials, and expert guidance.',
    image: '/exam-prep.jpg',
    price: 59.99,
  },
  {
    title: 'Skills Workshop',
    description: 'Learn essential academic and professional skills through interactive workshops and hands-on practice.',
    image: '/workshop.jpg',
    price: 39.99,
  },
];

function BookOnline() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [bookingData, setBookingData] = useState({
    service: '',
    tutor: '',
    date: '',
    time: '',
  });

  // Fetch services and tutors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, tutorsRes] = await Promise.all([
          api.get('/services'),
          api.get('/users/tutors')
        ]);
        setServices(servicesRes.data);
        setTutors(tutorsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load services and tutors. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      try {
        const selectedService = services.find((s) => s._id === bookingData.service);
        const selectedTutor = tutors.find((t) => t._id === bookingData.tutor);

        console.log('Sending booking request:', {
          service: bookingData.service,
          tutor: bookingData.tutor,
          date: bookingData.date,
          startTime: bookingData.time,
          selectedService,
          selectedTutor
        });

        // Create the booking
        const response = await api.post('/bookings', {
          service: bookingData.service,
          tutor: bookingData.tutor,
          date: bookingData.date,
          startTime: bookingData.time,
          status: 'upcoming', // Explicitly set status to upcoming
          notes: `Booking for ${selectedService?.title} with ${selectedTutor?.name}`
        });

        console.log('Booking response:', response.data);

        if (response.data) {
          setActiveStep((prevStep) => prevStep + 1);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (err) {
        console.error('Booking error:', {
          error: err,
          response: err.response?.data,
          status: err.response?.status
        });
        
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           'Failed to create booking. Please ensure you are logged in.';
        setError(errorMessage);
        return;
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} md={4} key={service._id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: bookingData.service === service._id ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                  onClick={() => handleInputChange({ target: { name: 'service', value: service._id } })}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${service.price}/hour
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {service.duration} minutes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            {tutors.map((tutor) => (
              <Grid item xs={12} md={4} key={tutor._id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: bookingData.tutor === tutor._id ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                  onClick={() => handleInputChange({ target: { name: 'tutor', value: tutor._id } })}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {tutor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subjects: {tutor.subjects.join(', ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Experience: {tutor.experience}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Rating: {tutor.rating}/5.0
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="date"
                value={bookingData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                name="time"
                value={bookingData.time}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        const selectedService = services.find((s) => s._id === bookingData.service);
        const selectedTutor = tutors.find((t) => t._id === bookingData.tutor);

        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>
                  <strong>Service:</strong> {selectedService?.title}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Tutor:</strong> {selectedTutor?.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Date:</strong> {bookingData.date}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Time:</strong> {bookingData.time}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Price:</strong> ${selectedService?.price}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading services and tutors...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Our Services
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
        Choose from our range of expert tutoring services designed to help you succeed
      </Typography>

      <Grid container spacing={4}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {service.link ? (
                <CardActionArea component={Link} to={service.link}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={service.image}
                    alt={service.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      Get Started
                    </Typography>
                  </CardContent>
                </CardActionArea>
              ) : (
                <>
                  <CardMedia
                    component="img"
                    height="200"
                    image={service.image}
                    alt={service.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary">
                        ${service.price}
                      </Typography>
                      <Button variant="contained" color="primary">
                        Book Now
                      </Button>
                    </Box>
                  </CardContent>
                </>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default BookOnline;
