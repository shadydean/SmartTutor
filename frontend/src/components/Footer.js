import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              About SmartTutor
            </Typography>
            <Typography variant="body2">
              We are dedicated to providing high-quality tutoring services to help students
              achieve their academic goals. Our platform connects students with expert tutors
              for personalized learning experiences.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link href="/" color="inherit">Home</Link>
              <Link href="/services" color="inherit">Services</Link>
              <Link href="/blog" color="inherit">Blog</Link>
              <Link href="/book-online" color="inherit">Book Online</Link>
              <Link href="/contact" color="inherit">Contact Us</Link>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact Info
            </Typography>
            <Typography variant="body2" paragraph>
              Email: contact@smarttutor.com
            </Typography>
            <Typography variant="body2" paragraph>
              Phone: +1 (555) 123-4567
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Follow Us
            </Typography>
            <Box>
              <IconButton color="inherit">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 4 }}
        >
          © {new Date().getFullYear()} SmartTutor. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
