import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  DialogContentText,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { enquiryService } from '../../services/enquiryService';
import axios from '../../utils/axios';
import useAuthStore from '../../store/authStore';

const EnquiryList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [enquiries, setEnquiries] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [systemFields, setSystemFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Import dialog states
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  
  // Delete all dialog state
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    activity: '',
    marketType: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchEnquiries();
    fetchCustomFields();
    fetchSystemFields();
  }, []);

  useEffect(() => {
    const handleCustomFieldsUpdated = () => {
      fetchCustomFields();
      fetchSystemFields();
    };

    window.addEventListener('custom-fields-updated', handleCustomFieldsUpdated);
    return () => window.removeEventListener('custom-fields-updated', handleCustomFieldsUpdated);
  }, []);

  const fetchCustomFields = async () => {
    try {
      const response = await axios.get('/custom-fields');
      setCustomFields(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch custom fields:', err);
    }
  };

  const fetchSystemFields = async () => {
    try {
      const response = await axios.get('/system-fields');
      setSystemFields(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch system fields:', err);
    }
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await enquiryService.getAllEnquiries(filters);
      // Ensure data is always an array
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enquiries');
      setEnquiries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEnquiries();
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      activity: '',
      marketType: '',
      startDate: '',
      endDate: '',
    });
    setTimeout(() => fetchEnquiries(), 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await enquiryService.deleteEnquiry(id);
        fetchEnquiries();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete enquiry');
      }
    }
  };

  const handleOpenImportDialog = () => {
    setOpenImportDialog(true);
    setSelectedFile(null);
    setImportResult(null);
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
    setSelectedFile(null);
    setImportResult(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid Excel file (.xls or .xlsx)');
        setSelectedFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    try {
      setImporting(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('/enquiries/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(response.data.data);
      setSuccess(`Import completed! ${response.data.data.successful} enquiries imported successfully.`);
      
      // Refresh the list and close dialog after showing results
      setTimeout(() => {
        fetchEnquiries();
        handleCloseImportDialog();
      }, 5000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import enquiries');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      const result = await enquiryService.deleteAllEnquiries();
      
      setSuccess(`Successfully deleted ${result.deletedCount} enquiries`);
      setOpenDeleteAllDialog(false);
      
      // Refresh the list
      fetchEnquiries();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete all enquiries');
    } finally {
      setDeleting(false);
    }
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

  const systemFieldMap = systemFields.reduce((acc, field) => {
    acc[field.name] = field;
    return acc;
  }, {});

  const isSystemActive = (name) => systemFieldMap[name]?.isActive !== false;
  const getSystemLabel = (name, fallback) => systemFieldMap[name]?.label || fallback;

  const columns = [
    isSystemActive('enquiryNumber') && {
      field: 'enquiryNumber',
      headerName: getSystemLabel('enquiryNumber', 'Enquiry #'),
      width: 150,
      renderCell: (params) => (
        <strong style={{ color: '#1976d2' }}>{params.value}</strong>
      ),
    },
    isSystemActive('customerName') && {
      field: 'customerName',
      headerName: getSystemLabel('customerName', 'Customer'),
      width: 200,
    },
    isSystemActive('poNumber') && {
      field: 'poNumber',
      headerName: getSystemLabel('poNumber', 'PO Number'),
      width: 130,
    },
    isSystemActive('dateReceived') && {
      field: 'dateReceived',
      headerName: getSystemLabel('dateReceived', 'Date Received'),
      width: 130,
      valueGetter: (params) => {
        const date = params.row?.dateReceived;
        if (!date) return 'N/A';
        try {
          return new Date(date).toLocaleDateString();
        } catch {
          return 'N/A';
        }
      },
    },
    isSystemActive('dateSubmitted') && {
      field: 'dateSubmitted',
      headerName: getSystemLabel('dateSubmitted', 'Date Submitted'),
      width: 140,
      valueGetter: (params) => {
        const date = params.row?.dateSubmitted;
        if (!date) return 'N/A';
        try {
          return new Date(date).toLocaleDateString();
        } catch {
          return 'N/A';
        }
      },
    },
    isSystemActive('marketType') && {
      field: 'marketType',
      headerName: getSystemLabel('marketType', 'Market'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Export' ? 'primary' : 'default'}
        />
      ),
    },
    isSystemActive('productType') && {
      field: 'productType',
      headerName: getSystemLabel('productType', 'Product'),
      width: 120,
    },
    isSystemActive('manufacturingType') && {
      field: 'manufacturingType',
      headerName: getSystemLabel('manufacturingType', 'Manufacturing'),
      width: 140,
    },
    isSystemActive('drawingStatus') && {
      field: 'drawingStatus',
      headerName: getSystemLabel('drawingStatus', 'Drawing'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Pending'}
          size="small"
          color={getDepartmentStatusColor(params.value)}
          variant="outlined"
        />
      ),
    },
    isSystemActive('costingStatus') && {
      field: 'costingStatus',
      headerName: getSystemLabel('costingStatus', 'Costing'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Pending'}
          size="small"
          color={getDepartmentStatusColor(params.value)}
          variant="outlined"
        />
      ),
    },
    isSystemActive('rndStatus') && {
      field: 'rndStatus',
      headerName: getSystemLabel('rndStatus', 'R&D'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Pending'}
          size="small"
          color={getDepartmentStatusColor(params.value)}
          variant="outlined"
        />
      ),
    },
    isSystemActive('salesStatus') && {
      field: 'salesStatus',
      headerName: getSystemLabel('salesStatus', 'Sales'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Pending'}
          size="small"
          color={getDepartmentStatusColor(params.value)}
          variant="outlined"
        />
      ),
    },
    isSystemActive('activity') && {
      field: 'activity',
      headerName: getSystemLabel('activity', 'Activity'),
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getActivityColor(params.value)}
        />
      ),
    },
    isSystemActive('status') && {
      field: 'status',
      headerName: getSystemLabel('status', 'Status'),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value)}
          variant="outlined"
        />
      ),
    },
    isSystemActive('salesRepresentative') && {
      field: 'salesRepresentative',
      headerName: getSystemLabel('salesRepresentative', 'Sales Rep'),
      width: 150,
      valueGetter: (params) => params.row?.salesRepresentative?.name || params.row?.salesRepName || 'N/A',
    },
    isSystemActive('rndHandler') && {
      field: 'rndHandler',
      headerName: getSystemLabel('rndHandler', 'R&D Handler'),
      width: 150,
      valueGetter: (params) => params.row?.rndHandler?.name || params.row?.rndHandlerName || 'N/A',
    },
    isSystemActive('daysRequiredForFulfillment') && {
      field: 'daysRequiredForFulfillment',
      headerName: getSystemLabel('daysRequiredForFulfillment', 'Days Required'),
      width: 130,
      valueGetter: (params) => {
        const days = params.row?.daysRequiredForFulfillment;
        return days !== undefined && days !== null ? `${days} days` : 'N/A';
      },
    },
    isSystemActive('remarks') && {
      field: 'remarks',
      headerName: getSystemLabel('remarks', 'Remarks'),
      width: 250,
      valueGetter: (params) => params.row?.remarks || 'No remarks',
    },
    // Dynamic fields columns
    ...customFields.map(field => ({
      field: `dynamicFields.${field.name}`,
      headerName: field.label,
      width: 130,
      valueGetter: (params) => {
        const dynFields = params.row?.dynamicFields || {};
        const value = dynFields[field.name];
        return value !== undefined && value !== null ? String(value) : '—';
      },
    })),
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/enquiries/${params.row._id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/enquiries/edit/${params.row._id}`)}
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
  ].filter(Boolean);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Enquiry Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={handleOpenImportDialog}
          >
            Import Excel
          </Button>
          {(user?.role === 'superuser') && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setOpenDeleteAllDialog(true)}
            >
              Delete All
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/enquiries/new')}
          >
            New Enquiry
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Search & Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Customer or Enquiry #"
              InputProps={{
                endAdornment: <SearchIcon />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              size="small"
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
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              size="small"
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
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Market"
              name="marketType"
              value={filters.marketType}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Domestic">Domestic</MenuItem>
              <MenuItem value="Export">Export</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Button variant="contained" onClick={handleSearch} sx={{ mr: 1 }}>
              Apply Filters
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
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
            rows={enquiries}
            columns={columns}
            getRowId={(row) => row._id}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{
              toolbar: CustomToolbar,
            }}
            sx={{
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          />
        )}
      </Paper>

      {/* Import Dialog */}
      <Dialog open={openImportDialog} onClose={handleCloseImportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Import Enquiries from Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" mb={2}>
              Upload an Excel file (.xls or .xlsx) to import enquiries in bulk.
              The file should contain columns: Customer Name, Enquiry Date, Market Type, Product Type, etc.
            </Typography>

            <input
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              style={{ display: 'none' }}
              id="excel-file-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="excel-file-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadFileIcon />}
                sx={{ mb: 2 }}
              >
                Select Excel File
              </Button>
            </label>

            {selectedFile && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Selected file: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
              </Alert>
            )}

            {importing && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Importing enquiries...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {importResult && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Import Summary:
                  </Typography>
                  <Typography variant="body2">
                    • Total rows: {importResult.total}
                  </Typography>
                  <Typography variant="body2">
                    • Created: {importResult.created || 0}
                  </Typography>
                  <Typography variant="body2">
                    • Updated: {importResult.updated || 0}
                  </Typography>
                  <Typography variant="body2">
                    • Failed: {importResult.failed}
                  </Typography>
                </Alert>

                {importResult.errors && importResult.errors.length > 0 && (
                  <Alert severity="warning">
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Errors ({importResult.errors.length}):
                    </Typography>
                    {importResult.errors.slice(0, 5).map((err, idx) => (
                      <Typography key={idx} variant="caption" display="block">
                        Row {err.row}: {err.error}
                      </Typography>
                    ))}
                    {importResult.errors.length > 5 && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        ... and {importResult.errors.length - 5} more errors
                      </Typography>
                    )}
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog} disabled={importing}>
            Close
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!selectedFile || importing}
            startIcon={importing ? <CircularProgress size={20} /> : <UploadFileIcon />}
          >
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog
        open={openDeleteAllDialog}
        onClose={() => !deleting && setOpenDeleteAllDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete All Enquiries
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Warning:</strong> This action will permanently delete ALL enquiries from the database. 
            This cannot be undone.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Are you absolutely sure you want to delete all {enquiries.length} enquiries?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteAllDialog(false)} 
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAll}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteSweepIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnquiryList;
