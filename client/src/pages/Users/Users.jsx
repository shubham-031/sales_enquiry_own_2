import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import axios from '../../utils/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales',
    department: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/users');
      setUsers(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditMode(true);
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        department: user.department || '',
      });
    } else {
      setEditMode(false);
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'sales',
        department: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'sales',
      department: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editMode) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await axios.put(`/users/${selectedUser._id}`, updateData);
        setSuccess('User updated successfully!');
      } else {
        await axios.post('/users', formData);
        setSuccess('User created successfully!');
      }

      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${id}`);
        setSuccess('User deleted successfully!');
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'management':
        return 'secondary';
      case 'sales':
        return 'primary';
      case 'r&d':
        return 'success';
      case 'superuser':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
          <strong>{params.value}</strong>
        </Box>
      ),
    },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          size="small"
          color={getRoleColor(params.value)}
        />
      ),
    },
    { field: 'department', headerName: 'Department', width: 200 },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 150,
      valueFormatter: (params) => {
        return new Date(params).toLocaleDateString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenDialog(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row._id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row._id}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              required
              fullWidth
              margin="normal"
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              required
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              required={!editMode}
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              helperText={editMode ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
            />
            <TextField
              required
              fullWidth
              select
              margin="normal"
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >

              <MenuItem value="management">Management</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="r&d">R&D</MenuItem>
              <MenuItem value="superuser">Superuser</MenuItem>
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Users;
