import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from '../../utils/axios';

const ManageColumns = () => {
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    isRequired: false,
    description: '',
  });

  // Fetch custom fields on mount
  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/custom-fields');
      setCustomFields(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch custom fields');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      label: '',
      type: 'text',
      isRequired: false,
      description: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleCreateField = async () => {
    try {
      // Validate
      if (!formData.name || !formData.label) {
        setError('Name and Label are required');
        return;
      }

      setLoading(true);
      const response = await axios.post('/custom-fields', formData);
      
      setCustomFields([response.data.data, ...customFields]);
      setSuccess('Custom field created successfully!');
      setOpenDialog(false);
      setError('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create custom field');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteField = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom field?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/custom-fields/${id}`);
      
      setCustomFields(customFields.filter(field => field._id !== id));
      setSuccess('Custom field deleted successfully!');
      setError('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete custom field');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      text: 'primary',
      number: 'info',
      date: 'warning',
      boolean: 'success',
      select: 'secondary',
    };
    return colors[type] || 'default';
  };

  if (loading && customFields.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Manage Custom Columns
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={loading}
          >
            Add New Column
          </Button>
        </Stack>

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

        {customFields.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              No custom columns defined yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Create Your First Column
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Label</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Internal Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customFields.map(field => (
                  <TableRow key={field._id} hover>
                    <TableCell>{field.label}</TableCell>
                    <TableCell>
                      <code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                        {field.name}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={field.type}
                        size="small"
                        color={getTypeColor(field.type)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={field.isRequired ? 'Required' : 'Optional'}
                        size="small"
                        color={field.isRequired ? 'error' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{field.description || '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteField(field._id)}
                        disabled={loading}
                        title="Delete this custom field"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create Custom Field Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Custom Column</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Internal Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., manufacturing_cost"
              helperText="Lowercase letters, numbers, and underscores only"
              error={formData.name && !/^[a-z0-9_]+$/.test(formData.name)}
            />
            <TextField
              fullWidth
              label="Display Label"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              placeholder="e.g., Manufacturing Cost"
            />
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Field Type"
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="boolean">Boolean (Yes/No)</MenuItem>
                <MenuItem value="select">Select (Dropdown)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description"
              multiline
              rows={2}
            />
            <Box>
              <label>
                <input
                  type="checkbox"
                  name="isRequired"
                  checked={formData.isRequired}
                  onChange={handleCheckboxChange}
                />
                {' '}
                Required Field
              </label>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateField}
            variant="contained"
            disabled={loading || !formData.name || !formData.label}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageColumns;
