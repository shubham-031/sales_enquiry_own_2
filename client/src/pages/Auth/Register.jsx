import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Grid,
} from '@mui/material';
import { authService } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'sales',
    department: 'Sales',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);
      setAuth(response.user, response.token);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,.1) 0%, transparent 50%)',
        }
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={10} 
          sx={{ 
            p: 5, 
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            my: 4,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join Sales Enquiry Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  name="role"
                  label="Role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="r&d">R&D</MenuItem>
                  <MenuItem value="management">Management</MenuItem>

                  <MenuItem value="superuser">Superuser</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  name="department"
                  label="Department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="R&D">R&D</MenuItem>
                  <MenuItem value="Management">Management</MenuItem>

                  <MenuItem value="Superuser">Superuser</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Already have an account? Sign In
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
