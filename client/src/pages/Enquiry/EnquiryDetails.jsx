import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { enquiryService } from '../../services/enquiryService';

const EnquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnquiryDetails();
  }, [id]);

  const fetchEnquiryDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await enquiryService.getEnquiryById(id);
      setEnquiry(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enquiry details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'Quoted':
        return 'success';
      case 'Regretted':
        return 'error';
      case 'In Progress':
        return 'info';
      case 'On Hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Closed' ? 'default' : 'warning';
  };

  const getDepartmentStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'Not Required':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/enquiries')}>
          Back to List
        </Button>
      </Box>
    );
  }

  if (!enquiry) {
    return <Typography>Enquiry not found</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/enquiries')}
            sx={{ mb: 1 }}
          >
            Back to List
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Enquiry Details
          </Typography>
          <Typography variant="h6" color="primary" mt={1}>
            {enquiry.enquiryNumber}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/enquiries/edit/${id}`)}
        >
          Edit Enquiry
        </Button>
      </Box>

      {/* Status Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Activity Status
              </Typography>
              <Chip
                label={enquiry.activity}
                color={getActivityColor(enquiry.activity)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Enquiry Status
              </Typography>
              <Chip
                label={enquiry.status}
                color={getStatusColor(enquiry.status)}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Market Type
              </Typography>
              <Chip
                label={enquiry.marketType}
                color={enquiry.marketType === 'Export' ? 'primary' : 'default'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Product Type
              </Typography>
              <Typography variant="h6" mt={1}>
                {enquiry.productType}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Department Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <AssignmentIcon sx={{ mr: 1 }} />
          Department Status
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Drawing
            </Typography>
            <Chip
              label={enquiry.drawingStatus || 'Pending'}
              color={getDepartmentStatusColor(enquiry.drawingStatus)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Costing
            </Typography>
            <Chip
              label={enquiry.costingStatus || 'Pending'}
              color={getDepartmentStatusColor(enquiry.costingStatus)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              R&D
            </Typography>
            <Chip
              label={enquiry.rndStatus || 'Pending'}
              color={getDepartmentStatusColor(enquiry.rndStatus)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Sales
            </Typography>
            <Chip
              label={enquiry.salesStatus || 'Pending'}
              color={getDepartmentStatusColor(enquiry.salesStatus)}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Status Cards */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <BusinessIcon sx={{ mr: 1 }} />
          Customer Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              Customer Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {enquiry.customerName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              Enquiry Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatDate(enquiry.enquiryDate)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Supply Scope
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {enquiry.supplyScope || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Team Assignment */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1 }} />
          Team Assignment
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              Sales Representative
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {enquiry.salesRepresentative?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {enquiry.salesRepresentative?.email || ''}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              R&D Handler
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {enquiry.rndHandler?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {enquiry.rndHandler?.email || ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Timeline */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <CalendarTodayIcon sx={{ mr: 1 }} />
          Timeline
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="textSecondary">
              Enquiry Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatDate(enquiry.enquiryDate)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="textSecondary">
              Date Received
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatDate(enquiry.dateReceived)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="textSecondary">
              Date Submitted
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatDate(enquiry.dateSubmitted)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="textSecondary">
              Quote Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatDate(enquiry.quoteDate)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="textSecondary">
              Closure Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatDate(enquiry.closureDate)}
            </Typography>
          </Grid>
          {enquiry.daysRequiredForFulfillment && (
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Days Required for Fulfillment
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {enquiry.daysRequiredForFulfillment} days
              </Typography>
            </Grid>
          )}
          {enquiry.fulfillmentTime && (
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Actual Fulfillment Time
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {enquiry.fulfillmentTime} days
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Additional Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <AssignmentIcon sx={{ mr: 1 }} />
          Additional Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Remarks
            </Typography>
            <Typography variant="body1">
              {enquiry.remarks || 'No remarks provided'}
            </Typography>
          </Grid>
          {enquiry.delayRemarks && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Delay Remarks
              </Typography>
              <Typography variant="body1" color="warning.main">
                {enquiry.delayRemarks}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              Created By
            </Typography>
            <Typography variant="body1">
              {enquiry.createdBy?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formatDate(enquiry.createdAt)}
            </Typography>
          </Grid>
          {enquiry.updatedBy && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Last Updated By
              </Typography>
              <Typography variant="body1">
                {enquiry.updatedBy?.name || 'N/A'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {formatDate(enquiry.updatedAt)}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Dynamic/Imported Fields Section */}
      {enquiry.dynamicFields && Object.keys(enquiry.dynamicFields).length > 0 && (
        <Paper sx={{ p: 3, backgroundColor: '#f0f4f8' }}>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
            <AssignmentIcon sx={{ mr: 1 }} />
            📊 Additional Imported Fields
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
            These fields were imported from the Excel file and stored as custom data
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            {Object.entries(enquiry.dynamicFields).map(([fieldName, fieldValue]) => (
              <Grid item xs={12} md={6} key={fieldName}>
                <Paper sx={{ p: 2, backgroundColor: 'white' }}>
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {/* Convert field name from snake_case to Title Case */}
                    {fieldName
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {fieldValue !== null && fieldValue !== undefined
                      ? String(fieldValue)
                      : '—'}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default EnquiryDetails;
