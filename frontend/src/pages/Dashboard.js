import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalEarnings: 0,
    averageRating: 0,
    completionRate: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [earningsData, setEarningsData] = useState({
    labels: [],
    data: []
  });
  const [sessionsData, setSessionsData] = useState({
    labels: [],
    data: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, sessionsRes, activityRes, earningsRes, sessionsDataRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/upcoming-sessions'),
          api.get('/dashboard/recent-activity'),
          api.get('/dashboard/earnings-data'),
          api.get('/dashboard/sessions-data'),
        ]);

        setStats(statsRes.data);
        setUpcomingSessions(sessionsRes.data);
        setRecentActivity(activityRes.data);
        setEarningsData(earningsRes.data);
        setSessionsData(sessionsDataRes.data);
        setError('');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const earningsChartData = {
    labels: earningsData.labels,
    datasets: [
      {
        label: 'Monthly Earnings ($)',
        data: earningsData.data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const sessionsChartData = {
    labels: sessionsData.labels,
    datasets: [
      {
        label: 'Monthly Sessions',
        data: sessionsData.data,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
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
            value={`${stats.completionRate.toFixed(1)}%`}
            subtitle="Sessions completed"
          />
        </Grid>

        {/* Charts */}
        {user?.role === 'tutor' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Earnings Overview
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={earningsChartData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sessions Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={sessionsChartData} options={chartOptions} />
            </Box>
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
                <ListItem key={activity.id}>
                  <ListItemText
                    primary={activity.title}
                    secondary={`${activity.description} - ${new Date(activity.date).toLocaleDateString()} ${activity.time}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={activity.status}
                      color={
                        activity.status === 'completed'
                          ? 'success'
                          : activity.status === 'cancelled'
                          ? 'error'
                          : 'primary'
                      }
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
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
                <ListItem key={session._id}>
                  <ListItemText
                    primary={session.service.title}
                    secondary={`${new Date(session.date).toLocaleDateString()} ${session.startTime}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Join Meeting">
                      <IconButton edge="end" aria-label="join">
                        <VideoCallIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
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
