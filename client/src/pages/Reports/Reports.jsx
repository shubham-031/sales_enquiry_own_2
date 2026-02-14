import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from '../../utils/axios';
import useAuthStore from '../../store/authStore';

const Reports = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reportData, setReportData] = useState(null);

  const canGenerateReport = ['management', 'sales', 'r&d', 'superuser'].includes(user?.role);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    marketType: '',
    productType: '',
    status: '',
    activity: '',
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      marketType: '',
      productType: '',
      status: '',
      activity: '',
    });
    setReportData(null);
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/reports/generate', filters);
      setReportData(response.data.data);
      setSuccess('Report generated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/reports/export/excel', filters, {
        responseType: 'blob',
      });

      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sales_Enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Excel file downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export to Excel');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/reports/export/csv', filters, {
        responseType: 'blob',
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sales_Enquiries_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('CSV file downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export to CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Reports & Analytics
      </Typography>

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <AssessmentIcon sx={{ mr: 1 }} />
          Report Filters
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Market Type"
              name="marketType"
              value={filters.marketType}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Domestic">Domestic</MenuItem>
              <MenuItem value="Export">Export</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Product Type"
              name="productType"
              value={filters.productType}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="SP">SP</MenuItem>
              <MenuItem value="NSP">NSP</MenuItem>
              <MenuItem value="SP+NSP">SP+NSP</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Activity"
              name="activity"
              value={filters.activity}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Quoted">Quoted</MenuItem>
              <MenuItem value="Regretted">Regretted</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={generateReport}
              disabled={loading || !canGenerateReport}
              sx={{ mr: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Alert Messages */}
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

      {/* Export Options */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <DownloadIcon sx={{ mr: 1 }} />
          Export Data
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TableChartIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Excel Export</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  Export filtered data to Excel format (.xlsx) with formatting and styling.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={exportToExcel}
                  disabled={loading}
                >
                  Download Excel
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DescriptionIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">CSV Export</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  Export filtered data to CSV format (.csv) for easy data manipulation.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={exportToCSV}
                  disabled={loading}
                >
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AssessmentIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Report Summary</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  View detailed analytics and summary of filtered enquiries below.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={generateReport}
                  disabled={loading}
                >
                  View Summary
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Summary */}
      {reportData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Summary
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                  <Typography color="white" variant="body2">
                    Total Enquiries
                  </Typography>
                  <Typography color="white" variant="h3" fontWeight="bold">
                    {reportData.summary.totalEnquiries}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <CardContent>
                  <Typography color="white" variant="body2">
                    Quoted
                  </Typography>
                  <Typography color="white" variant="h3" fontWeight="bold">
                    {reportData.summary.quoted}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <CardContent>
                  <Typography color="white" variant="body2">
                    Regretted
                  </Typography>
                  <Typography color="white" variant="h3" fontWeight="bold">
                    {reportData.summary.regretted}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <CardContent>
                  <Typography color="white" variant="body2">
                    In Progress
                  </Typography>
                  <Typography color="white" variant="h3" fontWeight="bold">
                    {reportData.summary.inProgress}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Average Fulfillment Time
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {reportData.summary.avgFulfillmentTime.toFixed(2)} days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Domestic Enquiries
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {reportData.summary.domestic}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Export Enquiries
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {reportData.summary.export}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box mt={3}>
            <Typography variant="body2" color="textSecondary">
              Total enquiries in report: <strong>{reportData.enquiries.length}</strong>
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Reports;
