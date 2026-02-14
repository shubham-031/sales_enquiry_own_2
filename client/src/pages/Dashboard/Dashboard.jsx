import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Cancel,
  Timeline,
  Refresh,
  Assessment,
  ShowChart,
  BusinessCenter,
  Speed,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { dashboardService } from '../../services/dashboardService';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <Card 
    sx={{ 
      height: '100%',
      background: 'white',
      border: 'none',
      borderRadius: 3,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${bgColor}, ${color})`,
      }
    }}
  >
    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography 
          color="textSecondary" 
          variant="body2"
          sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            {value}
          </Typography>
        </Box>
        <Box 
          sx={{ 
            color,
            fontSize: 48,
            opacity: 0.9,
            background: `${color}15`,
            borderRadius: 2.5,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'rotate(10deg) scale(1.1)',
            }
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState(null);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [activityDistribution, setActivityDistribution] = useState(null);
  const [productDistribution, setProductDistribution] = useState(null);
  const [fulfillmentAnalysis, setFulfillmentAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Prepare filter params
      const params = {};
      if (startDate) {
        params.startDate = dayjs(startDate).format('YYYY-MM-DD');
      }
      if (endDate) {
        params.endDate = dayjs(endDate).format('YYYY-MM-DD');
      }
      if (role) {
        params.role = role;
      }
      
      const [statsRes, teamRes, marketRes, trendRes, activityRes, productRes, fulfillmentRes] = await Promise.all([
        dashboardService.getStats(params),
        dashboardService.getTeamPerformance(params),
        dashboardService.getMarketAnalysis(params),
        dashboardService.getTrendAnalysis(params),
        dashboardService.getActivityDistribution(params),
        dashboardService.getProductDistribution(params),
        dashboardService.getFulfillmentAnalysis(params),
      ]);
      
      setStats(statsRes);
      setTeamPerformance(teamRes);
      setMarketAnalysis(marketRes);
      setTrendAnalysis(trendRes);
      setActivityDistribution(activityRes);
      setProductDistribution(productRes);
      setFulfillmentAnalysis(fulfillmentRes);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchAllData();
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setRole('');
  };

  useEffect(() => {
    if (startDate === null && endDate === null && role === '') {
      fetchAllData();
    }
  }, [startDate, endDate, role]);

  // Chart configurations
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '600', family: 'Inter' },
          boxWidth: 8,
          boxHeight: 8,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: 16,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 12,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        displayColors: true,
      }
    },
  };

  const lineChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { 
          color: 'rgba(0,0,0,0.04)',
          drawBorder: false,
        },
        ticks: { 
          font: { size: 11, family: 'Inter' },
          padding: 10,
        },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { 
          font: { size: 11, family: 'Inter' },
          padding: 10,
        },
        border: { display: false }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 5,
        hoverRadius: 8,
        borderWidth: 2,
        hoverBorderWidth: 3,
      }
    }
  };

  const barChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { 
          color: 'rgba(0,0,0,0.04)',
          drawBorder: false,
        },
        ticks: { 
          font: { size: 11, family: 'Inter' },
          padding: 10,
        },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { 
          font: { size: 11, family: 'Inter' },
          padding: 10,
        },
        border: { display: false }
      }
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false,
      }
    }
  };

  const horizontalBarOptions = {
    ...commonChartOptions,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        grid: { 
          color: 'rgba(0,0,0,0.04)',
          drawBorder: false,
        },
        ticks: { 
          font: { size: 11, family: 'Inter' },
          padding: 10,
        },
        border: { display: false }
      },
      y: {
        grid: { display: false },
        ticks: { 
          font: { size: 11, family: 'Inter' },
          padding: 10,
        },
        border: { display: false }
      }
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false,
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12, weight: '600', family: 'Inter' },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: 16,
        cornerRadius: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  // Chart 2: Monthly Enquiry Trends (Line Chart)
  const monthlyTrendData = {
    labels: trendAnalysis?.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[item._id.month - 1]} ${item._id.year}`;
    }) || [],
    datasets: [
      {
        label: 'Total Enquiries',
        data: trendAnalysis?.map(item => item.totalEnquiries) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Quoted',
        data: trendAnalysis?.map(item => item.quoted) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Regretted',
        data: trendAnalysis?.map(item => item.regretted) || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  // Chart 3: Sales Team Performance (Horizontal Bar Chart)
  const salesTeamData = {
    labels: teamPerformance?.salesTeam?.slice(0, 10).map(item => item._id) || [],
    datasets: [{
      label: 'Total Enquiries',
      data: teamPerformance?.salesTeam?.slice(0, 10).map(item => item.totalEnquiries) || [],
      backgroundColor: [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#8b5cf6',
        '#ec4899',
        '#0ea5e9',
        '#22c55e',
        '#fb923c',
        '#a855f7',
        '#f43f5e',
      ],
      borderWidth: 0,
    }]
  };

  // Chart 4: R&D Team Performance (Vertical Bar Chart)
  const rndTeamData = {
    labels: teamPerformance?.rndTeam?.map(item => item._id) || [],
    datasets: [{
      label: 'Enquiries Handled',
      data: teamPerformance?.rndTeam?.map(item => item.totalEnquiries) || [],
      backgroundColor: '#f59e0b',
      borderWidth: 0,
    }]
  };

  // Chart 5: Activity Status Distribution (Doughnut Chart)
  const activityDistributionData = {
    labels: activityDistribution?.map(item => item._id) || [],
    datasets: [{
      data: activityDistribution?.map(item => item.count) || [],
      backgroundColor: [
        '#10b981', // Quoted - Green
        '#ef4444', // Regretted - Red
        '#3b82f6', // In Progress - Blue
        '#f59e0b', // On Hold - Yellow
      ],
      borderWidth: 0,
      hoverOffset: 15,
    }]
  };

  // Chart 6: Market Distribution (Pie Chart)
  const marketDistributionData = {
    labels: ['Domestic', 'Export'],
    datasets: [{
      data: [
        stats?.marketDistribution?.domestic || 0,
        stats?.marketDistribution?.export || 0
      ],
      backgroundColor: [
        '#3b82f6', // Domestic - Blue
        '#10b981', // Export - Green
      ],
      borderWidth: 0,
      hoverOffset: 15,
    }]
  };

  // Chart 8: Product Type Distribution (Bar Chart)
  const productTypeData = {
    labels: productDistribution?.map(item => item._id || 'Unknown') || [],
    datasets: [{
      label: 'Product Type Count',
      data: productDistribution?.map(item => item.count) || [],
      backgroundColor: [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#8b5cf6',
      ],
      borderRadius: 8,
      borderWidth: 0,
    }]
  };

  // Chart 9: Fulfillment Time Analysis (Histogram)
  const fulfillmentTimeData = {
    labels: ['0-1 days', '1-3 days', '3-5 days', '5-10 days', '10+ days'],
    datasets: [{
      label: 'Frequency',
      data: fulfillmentAnalysis?.map(item => item.count) || [0, 0, 0, 0, 0],
      backgroundColor: [
        '#10b981', // Fast - Green
        '#3b82f6', // Good - Blue
        '#f59e0b', // OK - Amber
        '#ef4444', // Delayed - Red
        '#8b5cf6', // Very Delayed - Purple
      ],
      borderRadius: 8,
      borderWidth: 0,
    }]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',
      p: 3
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="800" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              color: '#0f172a',
              letterSpacing: '-0.02em'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)'
              }}
            >
              <Assessment sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            Sales Enquiry Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 500 }}>
            Real-time insights and performance metrics
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchAllData}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #7c8ef0 0%, #8659ae 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Date Filter Section */}
      <Paper 
        sx={{ 
          p: 3,
          mb: 3,
          background: 'white',
          border: 'none',
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Date Filter
          </Typography>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              minDate={startDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="role-filter-label">Role</InputLabel>
              <Select
                labelId="role-filter-label"
                id="role-filter"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="superuser">Superuser</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="r&d">R&D</MenuItem>
                <MenuItem value="management">Management</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<FilterList />}
                onClick={handleApplyFilter}
                disabled={!startDate && !endDate && !role}
                sx={{
                  backgroundColor: '#1e40af',
                  '&:hover': {
                    backgroundColor: '#1e3a8a',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#93c5fd',
                    color: 'white',
                  },
                  whiteSpace: 'nowrap',
                }}
              >
                Apply Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearFilter}
                disabled={!startDate && !endDate && !role}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Paper>
      
      {/* Chart 1: Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Enquiries"
            value={stats?.totalEnquiries || 0}
            icon={<Assignment sx={{ fontSize: 48 }} />}
            color="#2563eb"
            bgColor="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Enquiries"
            value={stats?.openEnquiries || 0}
            icon={<Timeline sx={{ fontSize: 48 }} />}
            color="#f59e0b"
            bgColor="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Quoted"
            value={stats?.quotedEnquiries || 0}
            icon={<CheckCircle sx={{ fontSize: 48 }} />}
            color="#10b981"
            bgColor="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Regretted"
            value={stats?.regrettedEnquiries || 0}
            icon={<Cancel sx={{ fontSize: 48 }} />}
            color="#ef4444"
            bgColor="#ef4444"
          />
        </Grid>
      </Grid>

      {/* Chart 7: Team Performance Metrics (KPI Cards) */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'white',
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ShowChart sx={{ fontSize: 28, color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h6" fontWeight="bold">
                Team Performance Metrics
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#10b98110', borderRadius: 2 }}>
                  <Typography variant="body2" color="textSecondary" fontWeight={600} gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main', mb: 1 }}>
                    {stats?.quotedEnquiries && stats?.totalEnquiries 
                      ? ((stats.quotedEnquiries / stats.totalEnquiries) * 100).toFixed(1)
                      : 0}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats?.quotedEnquiries && stats?.totalEnquiries 
                      ? (stats.quotedEnquiries / stats.totalEnquiries) * 100
                      : 0} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: '#dcfce7',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#10b981',
                        borderRadius: 3,
                      }
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#ef444410', borderRadius: 2 }}>
                  <Typography variant="body2" color="textSecondary" fontWeight={600} gutterBottom>
                    Rejection Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'error.main', mb: 1 }}>
                    {stats?.regrettedEnquiries && stats?.totalEnquiries 
                      ? ((stats.regrettedEnquiries / stats.totalEnquiries) * 100).toFixed(1)
                      : 0}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats?.regrettedEnquiries && stats?.totalEnquiries 
                      ? (stats.regrettedEnquiries / stats.totalEnquiries) * 100
                      : 0} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: '#fee2e2',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#ef4444',
                        borderRadius: 3,
                      }
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#3b82f610', borderRadius: 2 }}>
                  <Typography variant="body2" color="textSecondary" fontWeight={600} gutterBottom>
                    Avg Fulfillment
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                    {stats?.avgFulfillmentTime || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" fontWeight={600}>
                    days to fulfill
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f59e0b10', borderRadius: 2 }}>
                  <Typography variant="body2" color="textSecondary" fontWeight={600} gutterBottom>
                    Team Members
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main', mb: 1 }}>
                    {(teamPerformance?.salesTeam?.length || 0) + (teamPerformance?.rndTeam?.length || 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" fontWeight={600}>
                    Sales: {teamPerformance?.salesTeam?.length || 0} | R&D: {teamPerformance?.rndTeam?.length || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart 2: Monthly Enquiry Trends */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'white',
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ShowChart sx={{ fontSize: 28, color: 'primary.main', mr: 1.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Monthly Enquiry Trends
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Track business growth and success rates over time
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 220 }}>
              <Line data={monthlyTrendData} options={lineChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts 3 & 4: Team Performance */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'white',
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BusinessCenter sx={{ fontSize: 28, color: 'secondary.main', mr: 1.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Sales Team Performance
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Top 10 performing sales members
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 200 }}>
              <Bar data={salesTeamData} options={horizontalBarOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'white',
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Speed sx={{ fontSize: 28, color: 'warning.main', mr: 1.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  R&D Team Performance
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Technical team workload distribution
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 200 }}>
              <Bar data={rndTeamData} options={barChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts 5 & 6: Distribution Charts */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'white',
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PieChartIcon sx={{ fontSize: 28, color: 'info.main', mr: 1.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Activity Status Distribution
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Overall team performance breakdown
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={activityDistributionData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'white',
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PieChartIcon sx={{ fontSize: 28, color: 'success.main', mr: 1.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Market Distribution
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Domestic vs Export ratio
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie data={marketDistributionData} options={{
                ...doughnutOptions,
                cutout: '0%',
              }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts 8 & 9: Product & Fulfillment Analysis */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'white',
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BarChartIcon sx={{ fontSize: 28, color: 'secondary.main', mr: 1.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Product Type Distribution
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Which products are in demand
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 200 }}>
              <Bar data={productTypeData} options={barChartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'white',
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BarChartIcon sx={{ fontSize: 28, color: 'error.main', mr: 1.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Fulfillment Time Analysis
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  How fast the team delivers
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 200 }}>
              <Bar data={fulfillmentTimeData} options={barChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
