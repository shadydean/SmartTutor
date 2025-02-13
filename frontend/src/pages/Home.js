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
} from '@mui/material';
import { styled } from '@mui/material/styles';

const Hero = styled(Box)(({ theme }) => ({
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/hero-bg.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '70vh',
  display: 'flex',
  alignItems: 'center',
  color: 'white',
}));

const services = [
  {
    title: 'Assignment Help',
    description: 'Get expert help with your assignments across various subjects',
    image: '/assignment.jpg',
  },
  {
    title: 'Performance Review',
    description: 'Detailed analysis of your academic performance with personalized feedback',
    image: '/performance.jpg',
  },
  {
    title: '1-on-1 Mentoring',
    description: 'Personal guidance from experienced tutors in your field',
    image: '/mentoring.jpg',
  },
  {
    title: 'Study Groups',
    description: 'Join collaborative study sessions with peers',
    image: '/study-groups.jpg',
  },
  {
    title: 'Exam Preparation',
    description: 'Comprehensive exam prep with practice tests and materials',
    image: '/exam-prep.jpg',
  },
  {
    title: 'Skills Workshop',
    description: 'Learn essential academic and professional skills',
    image: '/workshop.jpg',
  },
];

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
          <Button variant="contained" size="large" sx={{ mt: 2 }}>
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
        <Typography variant="h2" component="h2" gutterBottom>
          Our Services
        </Typography>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={service.image}
                  alt={service.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                  <Button variant="contained" sx={{ mt: 2 }}>
                    Book Now
                  </Button>
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
              paddingBottom: '56.25%', // 16:9 aspect ratio
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
