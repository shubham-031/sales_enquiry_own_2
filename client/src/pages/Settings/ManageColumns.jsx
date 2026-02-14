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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import axios from '../../utils/axios';

const ManageColumns = () => {
  const [customFields, setCustomFields] = useState([]);
  const [systemFields, setSystemFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteForce, setDeleteForce] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({ requiresForce: false, affectedCount: 0 });
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    isRequired: false,
    description: '',
  });
  const [editFormData, setEditFormData] = useState({
    kind: 'custom',
    id: '',
    name: '',
    label: '',
    type: 'text',
  });

  // Fetch custom fields on mount
  useEffect(() => {
    fetchCustomFields();
    fetchSystemFields();
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

  const fetchSystemFields = async () => {
    try {
      const response = await axios.get('/system-fields');
      setSystemFields(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch system fields');
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

  const handleOpenEditDialog = (field, kind) => {
    setEditFormData({
      kind,
      id: kind === 'custom' ? field._id : '',
      name: field.name,
      label: field.label,
      type: field.type,
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleOpenDeleteDialog = (field, kind) => {
    setDeleteTarget({
      kind,
      id: kind === 'custom' ? field._id : '',
      name: field.name,
      label: field.label,
    });
    setDeleteForce(false);
    setDeleteInfo({ requiresForce: false, affectedCount: 0 });
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteTarget(null);
    setDeleteForce(false);
    setDeleteInfo({ requiresForce: false, affectedCount: 0 });
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
      window.dispatchEvent(new Event('custom-fields-updated'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create custom field');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = async () => {
    try {
      if (!editFormData.label) {
        setError('Label is required');
        return;
      }

      setLoading(true);
      let response = null;
      if (editFormData.kind === 'system') {
        response = await axios.put(`/system-fields/${editFormData.name}`, {
          label: editFormData.label,
        });
        const updatedField = response.data.data;
        setSystemFields(systemFields.map(field => (
          field.name === updatedField.name ? updatedField : field
        )));
      } else {
        response = await axios.put(`/custom-fields/${editFormData.id}`, {
          label: editFormData.label,
          type: editFormData.type,
        });
        const updatedField = response.data.data;
        setCustomFields(customFields.map(field => (
          field._id === updatedField._id ? updatedField : field
        )));
      }

      setSuccess('Column updated successfully!');
      setError('');
      setOpenEditDialog(false);
      window.dispatchEvent(new Event('custom-fields-updated'));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update custom field');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteField = async () => {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      const endpoint = deleteTarget.kind === 'system'
        ? `/system-fields/${deleteTarget.name}`
        : `/custom-fields/${deleteTarget.id}`;

      await axios.delete(endpoint, {
        params: deleteForce ? { force: true } : {},
      });

      if (deleteTarget.kind === 'system') {
        setSystemFields(systemFields.filter(field => field.name !== deleteTarget.name));
      } else {
        setCustomFields(customFields.filter(field => field._id !== deleteTarget.id));
      }
      setSuccess('Column deleted successfully!');
      setError('');
      setOpenDeleteDialog(false);
      window.dispatchEvent(new Event('custom-fields-updated'));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const response = err.response?.data;
      if (err.response?.status === 409 && response?.requiresForce) {
        setDeleteInfo({
          requiresForce: true,
          affectedCount: response.affectedCount || 0,
        });
        return;
      }
      setError(response?.message || 'Failed to delete custom field');
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

  if (loading && customFields.length === 0 && systemFields.length === 0) {
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
            Manage Columns
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

        {customFields.length === 0 && systemFields.length === 0 ? (
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
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                System Columns
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Label</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Internal Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {systemFields.map(field => (
                      <TableRow key={field.name} hover>
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
                            label={field.isActive ? 'Active' : 'Hidden'}
                            size="small"
                            color={field.isActive ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEditDialog(field, 'system')}
                            disabled={loading}
                            title="Edit this system field"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(field, 'system')}
                            disabled={loading}
                            title="Delete this system field"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Custom Columns
              </Typography>
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
                            color="primary"
                            onClick={() => handleOpenEditDialog(field, 'custom')}
                            disabled={loading}
                            title="Edit this custom field"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(field, 'custom')}
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
            </Box>
          </Stack>
        )}
      </Paper>

      {/* Edit Custom Field Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Column</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Internal Name"
              value={editFormData.name}
              disabled
              helperText="Internal name cannot be changed"
            />
            <TextField
              fullWidth
              label="Display Label"
              value={editFormData.label}
              onChange={(e) => setEditFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g., Manufacturing Cost"
            />
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={editFormData.type}
                onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value }))}
                label="Field Type"
                disabled={editFormData.kind === 'system'}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="boolean">Boolean (Yes/No)</MenuItem>
                <MenuItem value="select">Select (Dropdown)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateField}
            variant="contained"
            disabled={loading || !editFormData.label}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Custom Field Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Column</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Alert severity="warning">
              This will remove the column from all enquiries.
            </Alert>
            {deleteInfo.requiresForce && (
              <Alert severity="error">
                This field has data in {deleteInfo.affectedCount} enquiries. You must confirm to delete.
              </Alert>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteForce}
                  onChange={(e) => setDeleteForce(e.target.checked)}
                />
              }
              label="I understand this will permanently remove the column and its data"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteField}
            variant="contained"
            color="error"
            disabled={loading || !deleteForce}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
