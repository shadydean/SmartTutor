import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const steps = ['Select Service', 'Choose Tutor', 'Select Time', 'Confirm Booking'];

function BookOnline() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    service: '',
    tutor: '',
    date: '',
    time: '',
  });

  const services = [
    {
      id: 1,
      title: 'One-on-One Tutoring',
      description: 'Personalized tutoring sessions tailored to your needs',
      price: 50,
      duration: 60,
    },
    {
      id: 2,
      title: 'Group Study Session',
      description: 'Learn collaboratively with other students',
      price: 30,
      duration: 90,
    },
    {
      id: 3,
      title: 'Exam Preparation',
      description: 'Focused preparation for upcoming exams',
      price: 60,
      duration: 120,
    },
  ];

  const tutors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      subjects: ['Mathematics', 'Physics'],
      rating: 4.9,
      experience: '8 years',
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      subjects: ['Chemistry', 'Biology'],
      rating: 4.8,
      experience: '10 years',
    },
    {
      id: 3,
      name: 'Dr. Emily Brown',
      subjects: ['Literature', 'History'],
      rating: 4.7,
      experience: '6 years',
    },
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
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
              <Grid item xs={12} md={4} key={service.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: bookingData.service === service.id ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                  onClick={() => handleInputChange({ target: { name: 'service', value: service.id } })}
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
              <Grid item xs={12} md={4} key={tutor.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: bookingData.tutor === tutor.id ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                  onClick={() => handleInputChange({ target: { name: 'tutor', value: tutor.id } })}
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
        const selectedService = services.find((s) => s.id === bookingData.service);
        const selectedTutor = tutors.find((t) => t.id === bookingData.tutor);

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Book a Session
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Booking Confirmed!
            </Typography>
            <Typography paragraph>
              Your session has been booked successfully. You will receive a confirmation email shortly.
            </Typography>
            <Button variant="contained" href="/dashboard">
              Go to Dashboard
            </Button>
          </Box>
        ) : (
          <>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && !bookingData.service) ||
                  (activeStep === 1 && !bookingData.tutor) ||
                  (activeStep === 2 && (!bookingData.date || !bookingData.time))
                }
              >
                {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default BookOnline;
