import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { enquiryService } from '../../services/enquiryService';
import axios from '../../utils/axios';

const EnquiryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [salesUsers, setSalesUsers] = useState([]);
  const [rndUsers, setRndUsers] = useState([]);
  const [customFields, setCustomFields] = useState([]);

  const [formData, setFormData] = useState({
    customerName: '',
    enquiryDate: new Date().toISOString().split('T')[0],
    poNumber: '',
    dateReceived: '',
    dateSubmitted: '',
    marketType: 'Domestic',
    productType: 'SP',
    supplyScope: '',
    quantity: '',
    estimatedValue: '',
    drawingStatus: 'Pending',
    costingStatus: 'Pending',
    rndStatus: 'Pending',
    salesStatus: 'Pending',
    manufacturingType: '',
    salesRepresentative: '',
    rndHandler: '',
    activity: 'In Progress',
    status: 'Open',
    quotationDate: '',
    daysRequiredForFulfillment: '',
    closureDate: '',
    remarks: '',
    dynamicFields: {},
  });

  useEffect(() => {
    fetchUsers();
    fetchCustomFields();
    if (isEditMode) {
      fetchEnquiry();
    }
  }, [id]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      const users = response.data.data;
      setSalesUsers(users.filter((u) => u.role === 'sales' || u.role === 'superuser'));
      setRndUsers(users.filter((u) => u.role === 'r&d' || u.role === 'superuser'));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchCustomFields = async () => {
    try {
      const response = await axios.get('/custom-fields');
      setCustomFields(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch custom fields:', err);
    }
  };

  const fetchEnquiry = async () => {
    try {
      setLoading(true);
      const data = await enquiryService.getEnquiryById(id);
      
      // Format dates for input fields
      const formattedData = {
        ...data,
        enquiryDate: data.enquiryDate ? new Date(data.enquiryDate).toISOString().split('T')[0] : '',
        quotationDate: data.quotationDate ? new Date(data.quotationDate).toISOString().split('T')[0] : '',
        closureDate: data.closureDate ? new Date(data.closureDate).toISOString().split('T')[0] : '',
        salesRepresentative: data.salesRepresentative?._id || '',
        rndHandler: data.rndHandler?._id || '',
        dynamicFields: data.dynamicFields || {},
      };
      
      setFormData(formattedData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-set status based on activity
    if (name === 'activity') {
      if (value === 'Quoted' || value === 'Regretted') {
        setFormData((prev) => ({ ...prev, activity: value, status: 'Closed' }));
      } else {
        setFormData((prev) => ({ ...prev, activity: value, status: 'Open' }));
      }
    }
  };

  const handleDynamicFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      dynamicFields: {
        ...formData.dynamicFields,
        [fieldName]: value,
      },
    });
  };

  const renderDynamicField = (field) => {
    const value = formData.dynamicFields[field.name] || '';

    switch (field.type) {
      case 'number':
        return (
          <TextField
            key={field._id}
            fullWidth
            type="number"
            label={field.label}
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            required={field.isRequired}
            helperText={field.description}
          />
        );
      case 'date':
        return (
          <TextField
            key={field._id}
            fullWidth
            type="date"
            label={field.label}
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            required={field.isRequired}
            InputLabelProps={{ shrink: true }}
            helperText={field.description}
          />
        );
      case 'boolean':
        return (
          <FormControlLabel
            key={field._id}
            control={
              <Checkbox
                checked={value === true || value === 'true'}
                onChange={(e) => handleDynamicFieldChange(field.name, e.target.checked)}
              />
            }
            label={field.label}
          />
        );
      case 'select':
        return (
          <TextField
            key={field._id}
            fullWidth
            select
            label={field.label}
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            required={field.isRequired}
            helperText={field.description}
          >
            <MenuItem value="">None</MenuItem>
            {field.options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        );
      case 'text':
      default:
        return (
          <TextField
            key={field._id}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            required={field.isRequired}
            helperText={field.description}
          />
        );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      
      if (isEditMode) {
        await enquiryService.updateEnquiry(id, formData);
        setSuccess('Enquiry updated successfully!');
      } else {
        await enquiryService.createEnquiry(formData);
        setSuccess('Enquiry created successfully!');
      }

      setTimeout(() => {
        navigate('/enquiries');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save enquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/enquiries');
  };

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {isEditMode ? 'Edit Enquiry' : 'Create New Enquiry'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Optional - will auto-generate if empty"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Enquiry Date"
                name="enquiryDate"
                value={formData.enquiryDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                select
                label="Market Type"
                name="marketType"
                value={formData.marketType}
                onChange={handleChange}
              >
                <MenuItem value="Domestic">Domestic</MenuItem>
                <MenuItem value="Export">Export</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                select
                label="Product Type"
                name="productType"
                value={formData.productType}
                onChange={handleChange}
              >
                <MenuItem value="SP">SP (Speciality Products)</MenuItem>
                <MenuItem value="NSP">NSP (Non-Speciality Products)</MenuItem>
                <MenuItem value="SP+NSP">SP+NSP (Both)</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Supply Scope"
                name="supplyScope"
                value={formData.supplyScope}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Enter supply scope details..."
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="PO Number"
                name="poNumber"
                value={formData.poNumber}
                onChange={handleChange}
                placeholder="Enter PO number..."
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity..."
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Value"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleChange}
                placeholder="Enter estimated value..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date Received"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Date when enquiry was received"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date Submitted"
                name="dateSubmitted"
                value={formData.dateSubmitted}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Date when quote/response was submitted"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Manufacturing Type"
                name="manufacturingType"
                value={formData.manufacturingType}
                onChange={handleChange}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Inhouse">Inhouse</MenuItem>
                <MenuItem value="Broughtout">Broughtout</MenuItem>
                <MenuItem value="Both">Both</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Days Required for Fulfillment"
                name="daysRequiredForFulfillment"
                value={formData.daysRequiredForFulfillment}
                onChange={handleChange}
                placeholder="Expected days for fulfillment..."
              />
            </Grid>
          </Grid>

          {/* Department Status */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Department Status
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                select
                label="Drawing Status"
                name="drawingStatus"
                value={formData.drawingStatus}
                onChange={handleChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Not Required">Not Required</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                select
                label="Costing Status"
                name="costingStatus"
                value={formData.costingStatus}
                onChange={handleChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Not Required">Not Required</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                select
                label="R&D Status"
                name="rndStatus"
                value={formData.rndStatus}
                onChange={handleChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Not Required">Not Required</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                select
                label="Sales Status"
                name="salesStatus"
                value={formData.salesStatus}
                onChange={handleChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Not Required">Not Required</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Team Assignment */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Team Assignment
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                select
                label="Sales Representative"
                name="salesRepresentative"
                value={formData.salesRepresentative}
                onChange={handleChange}
              >
                <MenuItem value="">Select Sales Rep</MenuItem>
                {salesUsers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                select
                label="R&D Handler"
                name="rndHandler"
                value={formData.rndHandler}
                onChange={handleChange}
              >
                <MenuItem value="">Select R&D Handler</MenuItem>
                {rndUsers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Status & Activity */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Status & Activity
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                select
                label="Activity"
                name="activity"
                value={formData.activity}
                onChange={handleChange}
              >
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Quoted">Quoted</MenuItem>
                <MenuItem value="Regretted">Regretted</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Quotation Date"
                name="quotationDate"
                value={formData.quotationDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Date when quote was sent to customer"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Closure Date"
                name="closureDate"
                value={formData.closureDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Date when enquiry was closed"
                disabled={formData.status !== 'Closed'}
              />
            </Grid>
          </Grid>

          {/* Additional Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Additional Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Enter any additional remarks..."
              />
            </Grid>
          </Grid>

          {/* Custom Dynamic Fields */}
          {customFields.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Additional Custom Fields
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                {customFields.map((field) => (
                  <Grid item xs={12} md={6} key={field._id}>
                    {renderDynamicField(field)}
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Form Actions */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {isEditMode ? 'Update Enquiry' : 'Create Enquiry'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/enquiries')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EnquiryForm;
