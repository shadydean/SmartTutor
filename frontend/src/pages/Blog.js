import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, CardActionArea } from '@mui/material';

function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: 'How to Prepare for College Entrance Exams',
      excerpt: 'Essential tips and strategies for acing your college entrance exams...',
      image: 'https://source.unsplash.com/random/800x600?education',
      date: '2025-02-13',
    },
    {
      id: 2,
      title: 'The Benefits of One-on-One Tutoring',
      excerpt: 'Discover why personalized tutoring can accelerate your learning...',
      image: 'https://source.unsplash.com/random/800x600?teaching',
      date: '2025-02-12',
    },
    {
      id: 3,
      title: 'Study Techniques That Actually Work',
      excerpt: 'Science-backed study methods to help you learn more effectively...',
      image: 'https://source.unsplash.com/random/800x600?study',
      date: '2025-02-11',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Blog
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Latest insights, tips, and news from our tutoring experts
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {blogPosts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="200"
                  image={post.image}
                  alt={post.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.excerpt}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    {new Date(post.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Blog;
