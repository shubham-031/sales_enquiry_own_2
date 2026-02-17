import { useState, useEffect, useCallback, useRef } from 'react';
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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Close,
  TrendingUp,
  CalendarMonth,
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
  // ============= EXISTING STATE =============
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

  // Drilldown Modal State
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberMonthlyData, setMemberMonthlyData] = useState(null);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  // ============= NEW: REAL-TIME STATE =============
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);
  const lastFetchRef = useRef(Date.now());

  // ============= ENHANCED FETCH FUNCTION =============
  const fetchAllData = useCallback(async (isAutoRefresh = false) => {
    const now = Date.now();
    if (now - lastFetchRef.current < 5000 && isAutoRefresh) {
      return;
    }
    
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }
      setIsRefreshing(true);
      
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
      setLastUpdated(new Date());
      lastFetchRef.current = now;
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('❌ Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [startDate, endDate, role]);

  // ============= AUTO-REFRESH LOGIC =============
  useEffect(() => {
    fetchAllData(false);
  }, []);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchAllData(true);
      }, refreshInterval * 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchAllData]);

  useEffect(() => {
    if (startDate || endDate || role) {
      fetchAllData(false);
    }
  }, [startDate, endDate, role, fetchAllData]);

  useEffect(() => {
    const handleExcelUpload = () => {
      toast.info('New data detected, refreshing dashboard...');
      setTimeout(() => fetchAllData(false), 2000);
    };

    window.addEventListener('excelUploaded', handleExcelUpload);
    return () => window.removeEventListener('excelUploaded', handleExcelUpload);
  }, [fetchAllData]);

  // ============= HELPER FUNCTIONS =============
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleTimeString();
  };

  const handleForceRefresh = () => {
    lastFetchRef.current = 0;
    fetchAllData(false);
  };

  // ============= EXISTING FUNCTIONS (KEEP AS IS) =============
  const fetchMemberMonthlyData = async (memberName) => {
    try {
      setDrilldownLoading(true);
      
      const params = {};
      if (startDate) {
        params.startDate = dayjs(startDate).format('YYYY-MM-DD');
      }
      if (endDate) {
        params.endDate = dayjs(endDate).format('YYYY-MM-DD');
      }

      const data = await dashboardService.getMemberMonthlyPerformance(memberName, params);
      
      setMemberMonthlyData(data);
    } catch (error) {
      console.error('❌ Error fetching member monthly data:', error);
      toast.error('Failed to load member details');
    } finally {
      setDrilldownLoading(false);
    }
  };

  const handleMemberClick = (memberName) => {
    setSelectedMember(memberName);
    setDrilldownOpen(true);
    fetchMemberMonthlyData(memberName);
  };

  const handleCloseDrilldown = () => {
    setDrilldownOpen(false);
    setSelectedMember(null);
    setMemberMonthlyData(null);
  };

  const handleApplyFilter = () => {
    fetchAllData();
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setRole('');
  };

  // ============= CHART OPTIONS (KEEP YOUR EXISTING CODE) =============
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

  const salesTeamHorizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
    scales: {
      x: {
        stacked: false,
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
        stacked: false,
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
        borderRadius: 6,
        borderSkipped: false,
      }
    },
    barThickness: 18,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: '600', family: 'Inter' },
          boxWidth: 10,
          boxHeight: 10,
        }
      },
      tooltip: {
        enabled: false,
        external: function(context) {
          let tooltipEl = document.getElementById('chartjs-tooltip-sales');
          
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip-sales';
            tooltipEl.style.background = 'rgba(0, 0, 0, 0.95)';
            tooltipEl.style.borderRadius = '12px';
            tooltipEl.style.color = 'white';
            tooltipEl.style.opacity = '0';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.transform = 'translate(-50%, -110%)';
            tooltipEl.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            tooltipEl.style.padding = '12px 16px';
            tooltipEl.style.fontSize = '13px';
            tooltipEl.style.fontFamily = 'Inter, sans-serif';
            tooltipEl.style.zIndex = '9999';
            tooltipEl.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
            tooltipEl.style.minWidth = '200px';
            tooltipEl.style.maxWidth = '200px';
            tooltipEl.style.border = '1px solid rgba(255,255,255,0.1)';
            document.body.appendChild(tooltipEl);
          }

          const tooltipModel = context.tooltip;
          
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          if (tooltipModel.dataPoints && tooltipModel.dataPoints.length > 0) {
            const dataIndex = tooltipModel.dataPoints[0].dataIndex;
            const member = teamPerformance?.salesTeam?.[dataIndex];

            if (member) {
              let innerHTML = `
                <div style="margin-bottom: 8px; font-weight: bold; font-size: 14px; text-align: center;">
                  ${member._id || 'Unknown'}
                </div>
                <div style="height: 1px; background: rgba(255,255,255,0.2); margin: 8px 0;"></div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 10px; height: 10px; background: #2563eb; border-radius: 2px;"></div>
                      <span style="font-size: 12px;">Total</span>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${member.totalEnquiries || 0}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></div>
                      <span style="font-size: 12px;">Open</span>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${member.open || 0}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></div>
                      <span style="font-size: 12px;">Closed</span>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${member.closed || 0}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 10px; height: 10px; background: #f59e0b; border-radius: 2px;"></div>
                      <span style="font-size: 12px;">Quoted</span>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${member.quoted || 0}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 10px; height: 10px; background: #8b5cf6; border-radius: 2px;"></div>
                      <span style="font-size: 12px;">Regretted</span>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${member.regretted || 0}</span>
                  </div>
                </div>
              `;
              tooltipEl.innerHTML = innerHTML;
            }

            const position = context.chart.canvas.getBoundingClientRect();
            tooltipEl.style.opacity = '1';
            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
          }
        }
      }
    }
  };

  const rndTeamBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const memberName = teamPerformance?.rndTeam?.[index]?._id;
        if (memberName) {
          handleMemberClick(memberName);
        }
      }
    },
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
    },
    barThickness: 60,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: '600', family: 'Inter' },
          boxWidth: 10,
          boxHeight: 10,
        }
      },
      tooltip: {
        enabled: false,
        external: function(context) {
          let tooltipEl = document.getElementById('chartjs-tooltip-rnd');
          
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip-rnd';
            tooltipEl.style.background = 'rgba(0, 0, 0, 0.95)';
            tooltipEl.style.borderRadius = '12px';
            tooltipEl.style.color = 'white';
            tooltipEl.style.opacity = '0';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.transform = 'translate(-50%, -110%)';
            tooltipEl.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            tooltipEl.style.padding = '12px 16px';
            tooltipEl.style.fontSize = '13px';
            tooltipEl.style.fontFamily = 'Inter, sans-serif';
            tooltipEl.style.zIndex = '9999';
            tooltipEl.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
            tooltipEl.style.minWidth = '220px';
            tooltipEl.style.maxWidth = '220px';
            tooltipEl.style.border = '1px solid rgba(255,255,255,0.1)';
            document.body.appendChild(tooltipEl);
          }

          const tooltipModel = context.tooltip;
          
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          if (tooltipModel.dataPoints && tooltipModel.dataPoints.length > 0) {
            const dataIndex = tooltipModel.dataPoints[0].dataIndex;
            const member = teamPerformance?.rndTeam?.[dataIndex];

            if (member) {
              let innerHTML = `
                <div style="margin-bottom: 8px; font-weight: bold; font-size: 14px; text-align: center;">
                  ${member._id || 'Unknown'}
                </div>
                <div style="height: 1px; background: rgba(255,255,255,0.2); margin: 8px 0;"></div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 10px; height: 10px; background: #f59e0b; border-radius: 2px;"></div>
                    <span style="font-size: 12px;">Enquiries Handled</span>
                  </div>
                  <span style="font-weight: bold; font-size: 12px;">${member.totalEnquiries || 0}</span>
                </div>
                <div style="height: 1px; background: rgba(255,255,255,0.15); margin: 8px 0;"></div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></div>
                      <span style="font-size: 12px;">Open</span>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${member.open || 0}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></div>
                      <span style="font-size: 12px;">Closed</span>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${member.closed || 0}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 10px; height: 10px; background: #f59e0b; border-radius: 2px;"></div>
                      <span style="font-size: 12px;">Quoted</span>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${member.quoted || 0}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 10px; height: 10px; background: #8b5cf6; border-radius: 2px;"></div>
                      <span style="font-size: 12px;">Regretted</span>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${member.regretted || 0}</span>
                  </div>
                </div>
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.15); text-align: center;">
                  <span style="font-size: 11px; color: #10b981;">🔍 Click to view monthly breakdown</span>
                </div>
              `;
              tooltipEl.innerHTML = innerHTML;
            }

            const position = context.chart.canvas.getBoundingClientRect();
            tooltipEl.style.opacity = '1';
            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
          }
        }
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
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
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
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  // ============= CHART DATA (KEEP YOUR EXISTING CODE) =============
  // ============= CHART DATA WITH NULL SAFETY =============
const monthlyTrendData = trendAnalysis && trendAnalysis.length > 0 ? {
  labels: trendAnalysis.map(item => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[item._id.month - 1]} ${item._id.year}`;
  }),
  datasets: [
    {
      label: 'Total Enquiries',
      data: trendAnalysis.map(item => item.totalEnquiries || 0),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    },
    {
      label: 'Quoted',
      data: trendAnalysis.map(item => item.quoted || 0),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    },
    {
      label: 'Regretted',
      data: trendAnalysis.map(item => item.regretted || 0),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      pointBackgroundColor: '#ef4444',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }
  ]
} : {
  labels: [],
  datasets: []
};

const salesTeamData = teamPerformance?.salesTeam && teamPerformance.salesTeam.length > 0 ? {
  labels: teamPerformance.salesTeam.slice(0, 10).map(item => item._id || 'Unknown'),
  datasets: [
    {
      label: 'Total',
      data: teamPerformance.salesTeam.slice(0, 10).map(item => item.totalEnquiries || 0),
      backgroundColor: '#2563eb',
      borderRadius: 6,
      barThickness: 18,
    },
    {
      label: 'Open',
      data: teamPerformance.salesTeam.slice(0, 10).map(item => item.open || 0),
      backgroundColor: '#10b981',
      borderRadius: 6,
      barThickness: 18,
    },
    {
      label: 'Closed',
      data: teamPerformance.salesTeam.slice(0, 10).map(item => item.closed || 0),
      backgroundColor: '#ef4444',
      borderRadius: 6,
      barThickness: 18,
    },
    {
      label: 'Quoted',
      data: teamPerformance.salesTeam.slice(0, 10).map(item => item.quoted || 0),
      backgroundColor: '#f59e0b',
      borderRadius: 6,
      barThickness: 18,
    },
    {
      label: 'Regretted',
      data: teamPerformance.salesTeam.slice(0, 10).map(item => item.regretted || 0),
      backgroundColor: '#8b5cf6',
      borderRadius: 6,
      barThickness: 18,
    },
  ]
} : {
  labels: [],
  datasets: []
};

const rndTeamData = teamPerformance?.rndTeam && teamPerformance.rndTeam.length > 0 ? {
  labels: teamPerformance.rndTeam.map(item => item._id || 'Unknown'),
  datasets: [{
    label: 'Enquiries Handled',
    data: teamPerformance.rndTeam.map(item => item.totalEnquiries || 0),
    backgroundColor: '#f59e0b',
    borderWidth: 0,
  }]
} : {
  labels: [],
  datasets: []
};

const memberMonthlyChartData = memberMonthlyData?.monthlyPerformance && memberMonthlyData.monthlyPerformance.length > 0 ? {
  labels: memberMonthlyData.monthlyPerformance.map(item => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[item.monthNumber - 1]} ${item.year}`;
  }),
  datasets: [
    {
      label: 'Total',
      data: memberMonthlyData.monthlyPerformance.map(item => item.total),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Quoted',
      data: memberMonthlyData.monthlyPerformance.map(item => item.quoted),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Regretted',
      data: memberMonthlyData.monthlyPerformance.map(item => item.regretted),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
    }
  ]
} : null;

const activityDistributionData = activityDistribution && activityDistribution.length > 0 ? {
  labels: activityDistribution.map(item => item._id || 'Unknown'),
  datasets: [{
    data: activityDistribution.map(item => item.count || 0),
    backgroundColor: [
      '#10b981',
      '#ef4444',
      '#3b82f6',
      '#f59e0b',
    ],
    borderWidth: 0,
    hoverOffset: 15,
  }]
} : {
  labels: [],
  datasets: []
};

const marketDistributionData = stats ? {
  labels: ['Domestic', 'Export'],
  datasets: [{
    data: [
      stats.marketDistribution?.domestic || 0,
      stats.marketDistribution?.export || 0
    ],
    backgroundColor: [
      '#3b82f6',
      '#10b981',
    ],
    borderWidth: 0,
    hoverOffset: 15,
  }]
} : {
  labels: [],
  datasets: []
};

const productTypeData = productDistribution && productDistribution.length > 0 ? {
  labels: productDistribution.map(item => item._id || 'Unknown'),
  datasets: [{
    label: 'Product Type Count',
    data: productDistribution.map(item => item.count || 0),
    backgroundColor: [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
    ],
    borderRadius: 8,
    borderWidth: 0,
  }]
} : {
  labels: [],
  datasets: []
};

const fulfillmentTimeData = fulfillmentAnalysis && fulfillmentAnalysis.length > 0 ? {
  labels: ['0-1 days', '1-3 days', '3-5 days', '5-10 days', '10+ days'],
  datasets: [{
    label: 'Frequency',
    data: fulfillmentAnalysis.map(item => item.count || 0),
    backgroundColor: [
      '#10b981',
      '#3b82f6',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
    ],
    borderRadius: 8,
    borderWidth: 0,
  }]
} : {
  labels: [],
  datasets: [{
    label: 'Frequency',
    data: [0, 0, 0, 0, 0],
    backgroundColor: [
      '#10b981',
      '#3b82f6',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',      
    ],
    borderRadius: 8,
    borderWidth: 0,
  }]
};
 // ============= ENHANCED LOADING STATE =============
if (loading || !stats || !teamPerformance || !trendAnalysis || !activityDistribution || !productDistribution || !fulfillmentAnalysis || !marketAnalysis) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',
    }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#667eea' }} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary', fontWeight: 600 }}>
          {loading ? 'Loading Dashboard...' : 'Initializing Data...'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {isRefreshing ? '🔄 Refreshing real-time data...' : 'Fetching all dashboard metrics...'}
        </Typography>
        {autoRefresh && (
          <Chip 
            label={`Auto-refresh: ${refreshInterval}s`} 
            color="success" 
            size="small" 
            sx={{ mt: 2 }}
          />
        )}
      </Box>
    </Box>
  );
}
  // ============= MAIN RENDER =============
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',
      p: 3
    }}>
      {/* ============= NEW: ENHANCED HEADER WITH REAL-TIME CONTROLS ============= */}
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
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                '&::after': autoRefresh ? {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  animation: 'pulse 2s infinite',
                } : {}
              }}
            >
              <Assessment sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            Sales Enquiry Dashboard
            {isRefreshing && (
              <CircularProgress size={20} sx={{ color: '#667eea' }} />
            )}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: autoRefresh ? '#10b98115' : '#ef444415',
                color: autoRefresh ? '#10b981' : '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: autoRefresh ? '#10b981' : '#ef4444',
                  animation: autoRefresh ? 'pulse 2s infinite' : 'none',
                }}
              />
              {autoRefresh ? 'LIVE' : 'PAUSED'}
            </Box>
            Real-time insights • Last updated: {getTimeAgo(lastUpdated)}
          </Typography>
        </Box>
        
        {/* Real-Time Controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Auto-Refresh</InputLabel>
            <Select
              value={autoRefresh ? refreshInterval : 0}
              label="Auto-Refresh"
              onChange={(e) => {
                const value = e.target.value;
                if (value === 0) {
                  setAutoRefresh(false);
                  toast.info('Auto-refresh disabled');
                } else {
                  setAutoRefresh(true);
                  setRefreshInterval(value);
                  toast.success(`Auto-refresh: every ${value}s`);
                }
              }}
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: autoRefresh ? '#10b981' : undefined,
                  borderWidth: autoRefresh ? 2 : 1,
                }
              }}
            >
              <MenuItem value={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cancel sx={{ fontSize: 16, color: '#ef4444' }} />
                  Off
                </Box>
              </MenuItem>
              <MenuItem value={10}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Refresh sx={{ fontSize: 16, color: '#10b981' }} />
                  10 sec
                </Box>
              </MenuItem>
              <MenuItem value={30}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Refresh sx={{ fontSize: 16, color: '#10b981' }} />
                  30 sec
                </Box>
              </MenuItem>
              <MenuItem value={60}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Refresh sx={{ fontSize: 16, color: '#10b981' }} />
                  1 min
                </Box>
              </MenuItem>
              <MenuItem value={120}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Refresh sx={{ fontSize: 16, color: '#10b981' }} />
                  2 min
                </Box>
              </MenuItem>
              <MenuItem value={300}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Refresh sx={{ fontSize: 16, color: '#10b981' }} />
                  5 min
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Tooltip title={`Last updated: ${lastUpdated.toLocaleTimeString()}`}>
            <IconButton 
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #7c8ef0 0%, #8659ae 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                },
                '&.Mui-disabled': {
                  opacity: 0.6,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isRefreshing ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                <Refresh />
              )}
            </IconButton>
          </Tooltip>

          {autoRefresh && (
            <Chip
              icon={<Refresh />}
              label={`${refreshInterval}s`}
              color="success"
              size="small"
              sx={{
                fontWeight: 600,
                animation: 'pulse 2s infinite',
              }}
            />
          )}
        </Stack>
      </Box>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>

      {/* ============= KEEP ALL YOUR EXISTING DASHBOARD SECTIONS ============= */}
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

       {/* ============= CONTINUE WITH ALL YOUR EXISTING SECTIONS ============= */}
 {/* Statistics Cards */}
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

      {/* Team Performance Metrics */}
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

      {/* Monthly Enquiry Trends */}
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

      {/* Team Performance Charts */}
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
                  Top 10 performing sales members - Hover to see details
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 350 }}>
              <Bar data={salesTeamData} options={salesTeamHorizontalBarOptions} />
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
                  🔍 Click on any bar to see monthly breakdown
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 350, cursor: 'pointer' }}>
              <Bar data={rndTeamData} options={rndTeamBarOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Distribution Charts */}
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

      {/* Product & Fulfillment Analysis */}
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

      {/* ===== DRILLDOWN MODAL ===== */}
      <Dialog
        open={drilldownOpen}
        onClose={handleCloseDrilldown}   
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TrendingUp sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedMember} - Monthly Performance Breakdown
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Detailed month-by-month enquiry tracking
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseDrilldown} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {drilldownLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                  Loading monthly performance data...
                </Typography>
              </Box>
            </Box>
          ) : memberMonthlyData && memberMonthlyData.monthlyPerformance && memberMonthlyData.monthlyPerformance.length > 0 ? (
            <>
             {/* Summary Cards with Enhanced Metrics - ALL 5 METRICS */}
<Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={6} sm={4} md={2.4}>
    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#2563eb15', borderRadius: 2 }}>
      <Typography variant="caption" color="textSecondary" fontWeight={600}>
        Total Enquiries
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563eb', mt: 0.5 }}>  
        {memberMonthlyData.summary.totalEnquiries}
      </Typography>
    </Paper>
  </Grid>
  
  <Grid item xs={6} sm={4} md={2.4}>
    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#10b98115', borderRadius: 2 }}>
      <Typography variant="caption" color="textSecondary" fontWeight={600}>
        Open
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
        {memberMonthlyData.summary.totalOpen}
      </Typography>
    </Paper>
  </Grid>
  
  {/* ADDED: Closed Card */}
  <Grid item xs={6} sm={4} md={2.4}>
    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#6366f115', borderRadius: 2 }}>
      <Typography variant="caption" color="textSecondary" fontWeight={600}>
        Closed
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#6366f1', mt: 0.5 }}>
        {memberMonthlyData.summary.totalClosed || 0}
      </Typography>
    </Paper>
  </Grid>
  
  <Grid item xs={6} sm={4} md={2.4}>
    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#10b98115', borderRadius: 2 }}>
      <Typography variant="caption" color="textSecondary" fontWeight={600}>
        Quoted
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
        {memberMonthlyData.summary.totalQuoted}
      </Typography>
    </Paper>
  </Grid>
  
  <Grid item xs={6} sm={4} md={2.4}>
    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#ef444415', borderRadius: 2 }}>
      <Typography variant="caption" color="textSecondary" fontWeight={600}>
        Regretted
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef4444', mt: 0.5 }}>
        {memberMonthlyData.summary.totalRegretted}
      </Typography>
    </Paper>
  </Grid>
</Grid>

{/* Performance Indicator Card */}
<Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={12}>
    <Paper sx={{ 
      p: 2, 
      textAlign: 'center', 
      background: `linear-gradient(135deg, ${
        memberMonthlyData.summary.successRate >= 70 ? '#10b98115' :
        memberMonthlyData.summary.successRate >= 50 ? '#3b82f615' :
        memberMonthlyData.summary.successRate >= 30 ? '#f59e0b15' : '#ef444415'
      }, white)`,
      borderRadius: 2,
      border: `2px solid ${
        memberMonthlyData.summary.successRate >= 70 ? '#10b981' :
        memberMonthlyData.summary.successRate >= 50 ? '#3b82f6' :
        memberMonthlyData.summary.successRate >= 30 ? '#f59e0b' : '#ef4444'
      }20`
    }}>
      <Typography variant="caption" color="textSecondary" fontWeight={600}>
        Performance Rating
      </Typography>
      <Typography variant="h3" sx={{ 
        fontWeight: 800, 
        color: memberMonthlyData.summary.successRate >= 70 ? '#10b981' :
               memberMonthlyData.summary.successRate >= 50 ? '#3b82f6' :
               memberMonthlyData.summary.successRate >= 30 ? '#f59e0b' : '#ef4444',
        mt: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}>
        {memberMonthlyData.summary.successRate >= 70 ? '🏆 Excellent' :
         memberMonthlyData.summary.successRate >= 50 ? '👍 Good' :
         memberMonthlyData.summary.successRate >= 30 ? '⚠️ Average' : '📉 Needs Improvement'}
      </Typography>
      <Typography variant="h5" color="textSecondary" sx={{ mt: 1 }}>
        {memberMonthlyData.summary.successRate}% Success Rate
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3 }}>
        <Box>
          <Typography variant="caption" color="textSecondary">Avg/Month</Typography>
          <Typography variant="h6" fontWeight="bold">{memberMonthlyData.summary.averagePerMonth}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="textSecondary">Months Tracked</Typography>
          <Typography variant="h6" fontWeight="bold">{memberMonthlyData.summary.monthsTracked}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="textSecondary">Closure Rate</Typography>
          <Typography variant="h6" fontWeight="bold">
            {memberMonthlyData.summary.totalEnquiries > 0 
              ? ((memberMonthlyData.summary.totalClosed / memberMonthlyData.summary.totalEnquiries) * 100).toFixed(1)
              : 0}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  </Grid>
</Grid>

              {/* Monthly Trend Chart */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth /> Monthly Trend Analysis
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={memberMonthlyChartData} options={lineChartOptions} />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />
   
              {/* Monthly Data Table */}
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Monthly Breakdown Table
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Month</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Open</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Closed</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quoted</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Regretted</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>In Progress</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {memberMonthlyData.monthlyPerformance.map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            {new Date(row.year, row.monthNumber - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={row.total} color="primary" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={row.open} sx={{ backgroundColor: '#10b98115', color: '#10b981' }} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={row.closed} sx={{ backgroundColor: '#ef444415', color: '#ef4444' }} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={row.quoted} sx={{ backgroundColor: '#10b98115', color: '#10b981' }} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={row.regretted} sx={{ backgroundColor: '#ef444415', color: '#ef4444' }} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={row.inProgress} sx={{ backgroundColor: '#f59e0b15', color: '#f59e0b' }} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CalendarMonth sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Monthly Data Available
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedMember} has no enquiry data for the selected period.  
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDrilldown} variant="outlined" size="large">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
    
export default Dashboard;