import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  Avatar,
  Rating,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const Hero = styled(Box)(({ theme }) => ({
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/hero-bg.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '70vh',
  display: 'flex',
  alignItems: 'center',
  color: 'white',
}));

const blogPosts = [
  {
    title: 'How to Excel in Online Learning',
    description: 'Tips and strategies for successful online education',
    image: '/blog1.jpg',
  },
  {
    title: 'Time Management for Students',
    description: 'Master the art of balancing studies and life',
    image: '/blog2.jpg',
  },
  {
    title: 'Choosing the Right Study Method',
    description: 'Find the perfect study technique for your learning style',
    image: '/blog3.jpg',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Computer Science Student',
    avatar: '/avatar1.jpg',
    rating: 5,
    text: 'The tutoring service has been invaluable for my programming courses. My tutor helped me understand complex concepts and improve my coding skills significantly.',
  },
  {
    name: 'Michael Chen',
    role: 'Engineering Student',
    avatar: '/avatar2.jpg',
    rating: 5,
    text: 'I was struggling with advanced calculus until I found this platform. The personalized attention and clear explanations made all the difference.',
  },
  {
    name: 'Emily Brown',
    role: 'Biology Student',
    avatar: '/avatar3.jpg',
    rating: 5,
    text: 'The assignment help service is fantastic! I received detailed explanations and learned so much from the solutions provided.',
  },
  {
    name: 'David Wilson',
    role: 'Physics Student',
    avatar: '/avatar4.jpg',
    rating: 5,
    text: 'The tutors here are not just knowledgeable but also very patient. They ensure you understand the fundamentals before moving to advanced topics.',
  },
];

function Home() {
  return (
    <Box>
      <Hero>
        <Container>
          <Typography variant="h1" component="h1" gutterBottom>
            Your Path to Academic Excellence
          </Typography>
          <Typography variant="h5" gutterBottom>
            Connect with expert tutors and unlock your full potential
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ mt: 2 }}
            component={Link}
            to="/book-online"
          >
            Get Started
          </Button>
        </Container>
      </Hero>

      <Container sx={{ my: 8 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Latest Blog Posts
        </Typography>
        <Grid container spacing={4}>
          {blogPosts.map((post, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={post.image}
                  alt={post.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container sx={{ my: 8 }}>
        <Typography variant="h2" component="h2" gutterBottom align="center">
          What Our Students Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" component="div">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    "{testimonial.text}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container sx={{ my: 8 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Video Library
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Featured Tutorial
          </Typography>
          <Box
            sx={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
            }}
          >
            <Box
              component="iframe"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              src="https://www.youtube.com/embed/your-video-id"
              title="Featured Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Home;
