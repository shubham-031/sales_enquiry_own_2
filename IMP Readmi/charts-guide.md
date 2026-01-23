# Charts & Visualizations Guide for Sales Enquiry Dashboard

## Overview
This guide shows all the charts to implement in your project with specific attributes (data fields) and what each chart reveals about team performance for admin understanding.

---

## 📊 Complete Chart Implementation Plan

### Chart 1: **Statistics Cards** (Top Priority)
**Type:** Metric Cards (Not a traditional chart)
**Attributes Used:**
- Total count of all enquiries
- Count of OPEN status enquiries
- Count of QUOTED activity enquiries
- Count of REGRETED activity enquiries

**What Admin Understands:**
- Quick overview of system health
- How many enquiries are pending action
- Success vs. failure ratio at a glance
- Identifies bottlenecks immediately

**Color Scheme:**
- Total: Blue (#2563eb)
- Open: Amber (#f59e0b)
- Quoted: Green (#10b981)
- Regretted: Red (#ef4444)

**Database Query:**
```javascript
const totalEnquiries = db.enquiries.countDocuments();
const openEnquiries = db.enquiries.countDocuments({ status: 'OPEN' });
const quotedEnquiries = db.enquiries.countDocuments({ activity: 'QUOTED' });
const regrettedEnquiries = db.enquiries.countDocuments({ activity: 'REGRETED' });
```

---

### Chart 2: **Monthly Enquiry Trends** (Line Chart) ⭐ BEST FOR ADMIN
**Type:** Multi-line Chart
**Attributes Used:**
- Date Received (GROUP BY Month)
- Total Count per month
- Quoted Count per month
- Regretted Count per month

**Why Admin Loves This:**
- Shows business growth or decline over time
- Identifies seasonal patterns
- Reveals if team is improving or declining
- Helps forecast future enquiries
- Shows success/failure trends month-wise

**Visual:**
```
Y-Axis: Number of Enquiries (0-100)
X-Axis: Months (Apr-Sep 2025)
3 Lines:
  - Total Enquiries (Blue)
  - Quoted Enquiries (Green)
  - Regretted Enquiries (Red)
```

**Database Query:**
```javascript
db.enquiries.aggregate([
  {
    $group: {
      _id: { month: { $month: "$dateReceived" }, year: { $year: "$dateReceived" } },
      totalCount: { $sum: 1 },
      quotedCount: { $sum: { $cond: [{ $eq: ["$activity", "QUOTED"] }, 1, 0] } },
      regrettedCount: { $sum: { $cond: [{ $eq: ["$activity", "REGRETED"] }, 1, 0] } }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } }
])
```

**Sample Data Interpretation:**
- April: 80 total, 65 quoted, 5 regretted = 81% success
- May: 70 total, 55 quoted, 8 regretted = 79% success
- June: 65 total, 52 quoted, 4 regretted = 80% success
- **Admin Insight:** Success rate is consistent ~80%, steady growth

---

### Chart 3: **Sales Team Performance** (Horizontal Bar Chart) ⭐ BEST FOR ADMIN
**Type:** Horizontal Bar Chart
**Attributes Used:**
- Sales Person Name (from SALES column)
- Count of enquiries per sales person
- Show Top 10 performers

**Why Admin Loves This:**
- Instantly see who is working and who isn't
- Compare individual performance easily
- Identify top performers for recognition
- Spot underperformers for coaching
- Fair basis for incentives and promotions

**Visual:**
```
Top performers shown as longest bars
Color: Gradient from light to dark blue
Top Person: MALINI - 98 enquiries (longest bar)
Next: CHINNAMALLA - 85 enquiries
...continues down
```

**Database Query:**
```javascript
db.enquiries.aggregate([
  {
    $group: {
      _id: "$sales",
      totalEnquiries: { $sum: 1 }
    }
  },
  { $sort: { totalEnquiries: -1 } },
  { $limit: 10 }
])
```

**Sample Data:**
| Sales Person | Enquiries | % of Team |
|-------------|-----------|----------|
| MALINI | 98 | 22.9% |
| CHINNAMALLA | 85 | 19.8% |
| SEEMA | 44 | 10.3% |
| ANKITA | 8 | 1.9% |
| Others | 260 | 60.7% |

**Admin Insight:** MALINI and CHINNAMALLA are handling 42.7% of all enquiries. Are they overloaded or just efficient?

---

### Chart 4: **R&D Team Performance** (Vertical Bar Chart) ⭐ BEST FOR ADMIN
**Type:** Vertical Bar Chart
**Attributes Used:**
- R&D Person Name (from R&D column)
- Count of enquiries per R&D person
- Show all team members

**Why Admin Loves This:**
- See if workload is distributed fairly
- Identify bottlenecks (one person doing everything?)
- Recognize high contributors
- Plan team capacity and hiring needs

**Visual:**
```
X-Axis: R&D Team Members
Y-Axis: Number of Enquiries

SANTOSH: 229 (Very tall bar - PROBLEM!)
SUSHILA: 38 (Medium bar)
DEELIP: 8 (Short bar)
VINOD: 3 (Very short bar)
```

**Database Query:**
```javascript
db.enquiries.aggregate([
  {
    $group: {
      _id: "$rnd",
      totalEnquiries: { $sum: 1 }
    }
  },
  { $sort: { totalEnquiries: -1 } }
])
```

**Sample Data:**
| R&D Person | Enquiries | % Workload |
|-----------|-----------|----------|
| SANTOSH | 229 | 53.5% |
| SUSHILA | 38 | 8.9% |
| DEELIP | 8 | 1.9% |
| VINOD | 3 | 0.7% |

**Admin Insight:** ⚠️ SANTOSH is handling 53.5% of all work! Serious workload imbalance. Need to redistribute or hire more R&D team.

---

### Chart 5: **Activity Status Distribution** (Doughnut Chart)
**Type:** Doughnut Chart
**Attributes Used:**
- Activity field (QUOTED, REGRETED, IN-PROGRESS, ON-HOLD)
- Count of each activity type

**Why Admin Loves This:**
- See overall team performance at a glance
- Green (Quoted) = Success, Red (Regretted) = Failure
- Identifies process bottlenecks
- Quick health check of system

**Visual:**
```
Doughnut with center cutout
  - QUOTED: 218 (50.9%) - Green - Large slice
  - REGRETTED: 33 (7.7%) - Red - Small slice
  - IN-PROGRESS: 150 (35%) - Blue - Medium slice
  - ON-HOLD: 27 (6.3%) - Yellow - Small slice
```

**Database Query:**
```javascript
db.enquiries.aggregate([
  {
    $group: {
      _id: "$activity",
      count: { $sum: 1 }
    }
  }
])
```

**Admin Insight:** 50.9% quoted is good! But 7.7% rejection rate might be high or acceptable depending on industry.

---

### Chart 6: **Market Distribution** (Pie Chart)
**Type:** Pie Chart
**Attributes Used:**
- Market Type (EXPORT / DOMESTIC)
- Count of enquiries per market

**Why Admin Loves This:**
- Understand revenue split between markets
- Plan market strategy
- Allocate resources to high-value markets
- Identify growth opportunities

**Visual:**
```
Pie Chart:
  - DOMESTIC: 214 (50%) - Blue
  - EXPORT: 43 (10%) - Green
  - UNSPECIFIED: 171 (40%) - Gray
```

**Database Query:**
```javascript
db.enquiries.aggregate([
  {
    $group: {
      _id: "$marketSegment",
      count: { $sum: 1 }
    }
  }
])
```

**Admin Insight:** 40% unspecified is a data quality issue! Need to clean this up.

---

### Chart 7: **Team Performance Metrics** (KPI Cards)
**Type:** Summary Metrics
**Calculated From:**
- (Quoted Enquiries / Total Enquiries) × 100 = **Success Rate**
- (Regretted Enquiries / Total Enquiries) × 100 = **Rejection Rate**
- Average of Days to Complete = **Avg Fulfillment Time**
- Count of unique sales people = **Active Sales Team**
- Count of unique R&D people = **Active R&D Team**

**Why Admin Loves This:**
- Single-glance KPIs
- Shows team's bottom-line performance
- Easy to track month-over-month improvements

**Sample Calculations:**
- Success Rate: (218 / 428) × 100 = **50.9%** ✅
- Rejection Rate: (33 / 428) × 100 = **7.7%** ✅
- Avg Fulfillment: ~**2.05 days** ✅
- Active Sales Team: **11 members**
- Active R&D Team: **4 members**

**Database Query:**
```javascript
db.enquiries.aggregate([
  {
    $facet: {
      successRate: [
        { $group: { _id: null, quoted: { $sum: { $cond: [{ $eq: ["$activity", "QUOTED"] }, 1, 0] } }, total: { $sum: 1 } } },
        { $project: { rate: { $multiply: [{ $divide: ["$quoted", "$total"] }, 100] } } }
      ],
      rejectionRate: [
        { $group: { _id: null, regretted: { $sum: { $cond: [{ $eq: ["$activity", "REGRETED"] }, 1, 0] } }, total: { $sum: 1 } } },
        { $project: { rate: { $multiply: [{ $divide: ["$regretted", "$total"] }, 100] } } }
      ],
      avgFulfillment: [
        { $group: { _id: null, avg: { $avg: "$fulfillmentDays" } } }
      ]
    }
  }
])
```

---

### Chart 8: **Product Type Distribution** (Bar Chart)
**Type:** Horizontal Bar Chart
**Attributes Used:**
- Product Type (SP, NSP, SP+NSP, Other)
- Count of each product type

**Why Admin Loves This:**
- See which product types are in demand
- Plan inventory and resources
- Identify which products need more focus
- Revenue opportunity areas

**Visual:**
```
SP: ■■■■■ (Some count)
NSP: ■■■ (Fewer count)
SP+NSP: ■■ (Mix)
Other: ■ (Minimal)
```

**Database Query:**
```javascript
db.enquiries.aggregate([
  {
    $group: {
      _id: "$productType",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
])
```

---

### Chart 9: **Fulfillment Time Analysis** (Histogram/Bar Chart)
**Type:** Histogram
**Attributes Used:**
- Days to Complete (fulfillmentDays)
- Group into ranges: 0-1 day, 1-3 days, 3-5 days, 5+ days

**Why Admin Loves This:**
- See how fast team delivers
- Identify if there are delays
- Compare against SLA targets
- Plan team capacity

**Visual:**
```
0-1 days: 150 enquiries ■■■■■■■■ (Fast ✓)
1-3 days: 200 enquiries ■■■■■■■■■■ (Good ✓)
3-5 days: 70 enquiries ■■■■ (OK)
5+ days: 8 enquiries ■ (Delayed ✗)
```

**Admin Insight:** 95% of enquiries completed within 3 days - excellent performance!

---

## 🎯 Top 3 Charts for Admin Understanding

### #1: **Sales Team Performance (Bar Chart)** 
Shows individual team member workload and contribution.

### #2: **Monthly Trends (Line Chart)**
Shows business growth and success rates over time.

### #3: **R&D Team Performance (Bar Chart)**
Shows if workload is fairly distributed or bottlenecked.

---

## 💡 Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  📊 SALES ENQUIRY DASHBOARD - ADMIN VIEW            │
├─────────────────────────────────────────────────────┤
│                                                       │
│ [Total: 428]  [Open: 173]  [Quoted: 218]  [Reg: 33] │
│                                                       │
│ ┌─────────────────────┬──────────────────────────┐  │
│ │  Monthly Trends     │   Sales Team Performance │  │
│ │  (LINE CHART)       │   (BAR CHART)            │  │
│ │  Shows growth!      │   Shows individual perf! │  │
│ └─────────────────────┴──────────────────────────┘  │
│                                                       │
│ ┌─────────────────────┬──────────────────────────┐  │
│ │  R&D Performance    │   Activity Distribution  │  │
│ │  (BAR CHART)        │   (DOUGHNUT CHART)       │  │
│ │  Shows workload!    │   Shows status!          │  │
│ └─────────────────────┴──────────────────────────┘  │
│                                                       │
│ ┌─────────────────────┬──────────────────────────┐  │
│ │  Fulfillment Time   │   Market Distribution    │  │
│ │  (HISTOGRAM)        │   (PIE CHART)            │  │
│ │  Shows speed!       │   Shows market split!    │  │
│ └─────────────────────┴──────────────────────────┘  │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 📈 Code Example: Implementing Top 3 Charts

### 1. Monthly Trends Chart (React Component)
```javascript
import { Line } from 'react-chartjs-2';

const MonthlyTrends = ({ data }) => {
  const chartData = {
    labels: data.map(d => `${d._id.month}/${d._id.year}`),
    datasets: [
      {
        label: 'Total Enquiries',
        data: data.map(d => d.totalCount),
        borderColor: '#3b82f6',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Quoted',
        data: data.map(d => d.quotedCount),
        borderColor: '#10b981',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Regretted',
        data: data.map(d => d.regrettedCount),
        borderColor: '#ef4444',
        fill: false,
        tension: 0.4
      }
    ]
  };

  return <Line data={chartData} options={{ responsive: true }} />;
};
```

### 2. Sales Team Performance (Bar Chart)
```javascript
import { Bar } from 'react-chartjs-2';

const SalesPerformance = ({ data }) => {
  const chartData = {
    labels: data.map(d => d._id),
    datasets: [
      {
        label: 'Enquiries Handled',
        data: data.map(d => d.totalEnquiries),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', 
          '#ef4444', '#8b5cf6', '#ec4899'
        ],
        borderRadius: 8
      }
    ]
  };

  return (
    <Bar 
      data={chartData} 
      options={{
        indexAxis: 'y',
        responsive: true
      }} 
    />
  );
};
```

### 3. R&D Team Performance (Vertical Bar Chart)
```javascript
import { Bar } from 'react-chartjs-2';

const RNDPerformance = ({ data }) => {
  const chartData = {
    labels: data.map(d => d._id),
    datasets: [
      {
        label: 'Enquiries Handled',
        data: data.map(d => d.totalEnquiries),
        backgroundColor: '#f59e0b',
        borderRadius: 8
      }
    ]
  };

  return <Bar data={chartData} options={{ responsive: true }} />;
};
```

---

## 🎨 Color Scheme Reference

```javascript
const chartColors = {
  primary: '#3b82f6',      // Blue
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber/Yellow
  danger: '#ef4444',       // Red
  info: '#0ea5e9',         // Cyan
  secondary: '#8b5cf6',    // Purple
  accent: '#ec4899'        // Pink
};
```

---