import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  VideoCall as VideoCallIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Chart.js registration code would go here

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalEarnings: 0,
    averageRating: 0,
    completionRate: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [sessionsData, setSessionsData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, sessionsRes, activityRes, earningsRes, sessionsDataRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/upcoming-sessions'),
          axios.get('/api/dashboard/recent-activity'),
          axios.get('/api/dashboard/earnings-data'),
          axios.get('/api/dashboard/sessions-data'),
        ]);

        setStats(statsRes.data);
        setUpcomingSessions(sessionsRes.data);
        setRecentActivity(activityRes.data);
        setEarningsData(earningsRes.data);
        setSessionsData(sessionsDataRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon, title, value, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CalendarIcon color="primary" />}
            title="Total Sessions"
            value={stats.totalSessions}
            subtitle="All time"
          />
        </Grid>
        {user?.role === 'tutor' && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<MoneyIcon color="primary" />}
              title="Total Earnings"
              value={`$${stats.totalEarnings}`}
              subtitle="All time"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<StarIcon color="primary" />}
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            subtitle="Out of 5.0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TimeIcon color="primary" />}
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            subtitle="Last 30 days"
          />
        </Grid>

        {/* Charts */}
        {user?.role === 'tutor' && (
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Earnings Overview
              </Typography>
              {earningsData && (
                <Line
                  data={earningsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                  height={300}
                />
              )}
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={user?.role === 'tutor' ? 4 : 8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Session Distribution
            </Typography>
            {sessionsData && (
              <Bar
                data={sessionsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                height={300}
              />
            )}
          </Paper>
        </Grid>

        {/* Upcoming Sessions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Sessions
            </Typography>
            <List>
              {upcomingSessions.map((session) => (
                <ListItem key={session._id} divider>
                  <ListItemText
                    primary={session.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {new Date(session.date).toLocaleDateString()} at{' '}
                          {new Date(session.date).toLocaleTimeString()}
                        </Typography>
                        <br />
                        {user?.role === 'student'
                          ? `with ${session.tutor.name}`
                          : `with ${session.student.name}`}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Join Session">
                      <IconButton edge="end" aria-label="join" href={session.meetingLink}>
                        <VideoCallIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send Message">
                      <IconButton edge="end" aria-label="message">
                        <MessageIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity) => (
                <ListItem key={activity._id}>
                  <ListItemText
                    primary={activity.description}
                    secondary={new Date(activity.date).toLocaleString()}
                  />
                  <Chip
                    size="small"
                    icon={<AssignmentIcon />}
                    label={activity.type}
                    color={
                      activity.type === 'completed'
                        ? 'success'
                        : activity.type === 'upcoming'
                        ? 'primary'
                        : 'default'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
