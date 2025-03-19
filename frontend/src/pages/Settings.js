import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  PhotoCamera,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

function Settings() {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      bio: '',
      profileImage: null,
    },
    notifications: {
      emailNotifications: true,
      bookingReminders: true,
      messageNotifications: true,
      marketingEmails: false,
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          name: user.name || '',
          email: user.email || '',
          bio: user.bio || '',
          profileImage: user.profileImage || null,
        },
      }));
    }
  }, [user]);

  const handleInputChange = (section, field) => (event) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: event.target.value,
      },
    }));
  };

  const handleSwitchChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: event.target.checked,
      },
    }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        console.log('Sending request to upload avatar...');
        const response = await api.post('/users/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Upload response:', response.data);
        
        // Prepend the backend URL to the avatar path
        const avatarUrl = `http://localhost:9000${response.data.avatarUrl}`;
        
        // Update local settings
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            profileImage: avatarUrl,
          },
        }));

        // Update user state in AuthContext if user exists
        if (user) {
          updateUser({
            ...user,
            profileImage: avatarUrl
          });
        }

        setSuccess('Profile image updated successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        console.error('Error response:', error.response?.data);
        setError(error.response?.data?.msg || 'Failed to upload avatar. Please try again.');
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await api.put('/users/profile', settings.profile);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (settings.security.newPassword !== settings.security.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.put('/users/password', {
        currentPassword: settings.security.currentPassword,
        newPassword: settings.security.newPassword,
      });
      
      setSuccess('Password updated successfully!');
      setSettings(prev => ({
        ...prev,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
      }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.put('/users/notifications', settings.notifications);
      setSuccess('Notification preferences updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update notification preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setLoading(true);
        setError('');
        setSuccess('');
        
        await api.delete('/users/account');
        // Handle account deletion success (e.g., logout and redirect)
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete account. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Profile Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Profile Settings</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={settings.profile.profileImage}
                sx={{ width: 100, height: 100, mb: 1 }}
              >
                {settings.profile.name?.charAt(0)}
              </Avatar>
              <IconButton
                component="label"
                onClick={() => console.log('Upload button clicked')}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={(e) => {
                    console.log('File input changed');
                    handleAvatarChange(e);
                  }}
                />
                <PhotoCamera />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={settings.profile.name}
              onChange={handleInputChange('profile', 'name')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={settings.profile.email}
              onChange={handleInputChange('profile', 'email')}
              disabled
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bio"
              value={settings.profile.bio}
              onChange={handleInputChange('profile', 'bio')}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveProfile}
              disabled={loading}
            >
              Save Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Notification Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Notification Preferences</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onChange={handleSwitchChange('emailNotifications')}
                />
              }
              label="Email Notifications"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.bookingReminders}
                  onChange={handleSwitchChange('bookingReminders')}
                />
              }
              label="Booking Reminders"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.messageNotifications}
                  onChange={handleSwitchChange('messageNotifications')}
                />
              }
              label="Message Notifications"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.marketingEmails}
                  onChange={handleSwitchChange('marketingEmails')}
                />
              }
              label="Marketing Emails"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveNotifications}
              disabled={loading}
            >
              Save Notification Preferences
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Security Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Security Settings</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={settings.security.currentPassword}
              onChange={handleInputChange('security', 'currentPassword')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={settings.security.newPassword}
              onChange={handleInputChange('security', 'newPassword')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={settings.security.confirmPassword}
              onChange={handleInputChange('security', 'confirmPassword')}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleChangePassword}
              disabled={loading}
            >
              Change Password
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Account Management */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
          <Typography variant="h6" color="error">Account Management</Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Once you delete your account, there is no going back. Please be certain.
        </Typography>

        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          Delete Account
        </Button>
      </Paper>
    </Container>
  );
}

export default Settings; 