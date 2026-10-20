// src/pages/PrivatePage/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp, FiUsers, FiCalendar, FiRefreshCw,
  FiPackage, FiClock, FiCheckCircle, FiAlertCircle, FiShoppingBag,
  FiUser, FiActivity, FiTruck, FiChevronDown,
  FiArrowLeft, FiArrowRight, FiDollarSign, FiBarChart2, FiPieChart
} from 'react-icons/fi';
import { BsCurrencyRupee, BsWallet2 } from 'react-icons/bs';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

import Sidebar from '../../../components/Sidebar/Sidebar';

// ── API Imports ──
import { getAllOrders } from '../../../api/orderApi';
import { getAllExpenses as getCustomerExpenses } from '../../../api/expenseApi';
import { getAllExpenses as getAdminExpenses } from '../../../api/adminexpenseApi';
import { getAllCustomers } from '../../../api/customerApi';
import { getAllJobs } from '../../../api/jobApi';
import { getAllAdminPayments } from '../../../api/adminPaymentApi';
import { getAllCredits } from '../../../api/creditApi';

import laborService from '../../../api/laborService';
import attendanceService from '../../../api/attendanceService';

import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date filter state
  const [dateFilterType, setDateFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekNumber());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Chart data states
  const [orderTrendData, setOrderTrendData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [paymentDistribution, setPaymentDistribution] = useState([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState([]);

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 8 }, (_, i) => currentYear - 3 + i);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [orders, setOrders] = useState([]);

  const [summary, setSummary] = useState({
    totalRevenue: 0, completedRevenue: 0, totalExpenses: 0, totalProfit: 0,
    pendingInProgressExpenses: 0, pendingOrdersAdvance: 0,
    totalCreditGiven: 0, totalCreditPaid: 0, totalCreditPending: 0,
    totalOrders: 0, totalCustomers: 0, totalJobs: 0,
    pendingPaymentOrders: 0, partialPaymentOrders: 0, completePaymentOrders: 0,
    completedOrdersPaymentPending: 0, delayedOrders: 0, activeOrders: 0,
    pendingOrders: 0, completedOrders: 0, inProgressOrders: 0,
    pendingOrdersPaymentAmount: 0, inProgressOrdersPaymentAmount: 0, completedOrdersPaymentAmount: 0,
    pendingOrdersRemainingAmount: 0, inProgressOrdersRemainingAmount: 0, completedOrdersRemainingAmount: 0,
    totalWorkers: 0, activeWorkers: 0, todayAttendance: 0,
    totalSalaryBuilt: 0, totalSalaryPaid: 0, totalSalaryPending: 0,
  });

  const CHART_COLORS = {
    primary: '#3b82f6', success: '#10b981', warning: '#f59e0b',
    danger: '#ef4444', purple: '#8b5cf6', pink: '#ec489a',
    cyan: '#06b6d4', indigo: '#6366f1'
  };

  function getCurrentWeekNumber() {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startDate.getDay() + 1) / 7);
  }

  function getWeeksInYear(year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const days = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startDate.getDay()) / 7);
  }

  function getWeekDates(year, weekNumber) {
    const startDate = new Date(year, 0, 1);
    const dayOffset = startDate.getDay();
    const daysToAdd = (weekNumber - 1) * 7 - dayOffset;
    const weekStart = new Date(year, 0, 1 + daysToAdd);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { weekStart, weekEnd };
  }

  const getDateRange = () => {
    let startDate, endDate;
    switch (dateFilterType) {
      case 'year':
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31);
        break;
      case 'month':
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0);
        break;
      case 'week': {
        const { weekStart, weekEnd } = getWeekDates(selectedYear, selectedWeek);
        startDate = weekStart;
        endDate = weekEnd;
        break;
      }
      case 'day':
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(2000, 0, 1);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
    }
    return { startDate, endDate };
  };

  const getDateRangeDisplay = () => {
    switch (dateFilterType) {
      case 'year': return `${selectedYear}`;
      case 'month': return `${months[selectedMonth]} ${selectedYear}`;
      case 'week': {
        const { weekStart, weekEnd } = getWeekDates(selectedYear, selectedWeek);
        return `Week ${selectedWeek} (${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()})`;
      }
      case 'day':
        return new Date(selectedDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
      default: return 'All Time';
    }
  };

  const navigatePrevious = () => {
    switch (dateFilterType) {
      case 'year': setSelectedYear(prev => prev - 1); break;
      case 'month':
        if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(prev => prev - 1); }
        else setSelectedMonth(prev => prev - 1);
        break;
      case 'week':
        if (selectedWeek === 1) { setSelectedYear(prev => prev - 1); setSelectedWeek(getWeeksInYear(selectedYear - 1)); }
        else setSelectedWeek(prev => prev - 1);
        break;
      case 'day': {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d.toISOString().split('T')[0]);
        break;
      }
    }
  };

  const navigateNext = () => {
    const today = new Date();
    switch (dateFilterType) {
      case 'year':
        if (selectedYear < today.getFullYear()) setSelectedYear(prev => prev + 1);
        break;
      case 'month':
        if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth()) return;
        if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(prev => prev + 1); }
        else setSelectedMonth(prev => prev + 1);
        break;
      case 'week': {
        const currentWeek = getCurrentWeekNumber();
        if (selectedYear === today.getFullYear() && selectedWeek === currentWeek) return;
        const weeksInYear = getWeeksInYear(selectedYear);
        if (selectedWeek === weeksInYear) { setSelectedYear(prev => prev + 1); setSelectedWeek(1); }
        else setSelectedWeek(prev => prev + 1);
        break;
      }
      case 'day': {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        if (d <= today) setSelectedDate(d.toISOString().split('T')[0]);
        break;
      }
    }
  };

  const filterByDateRange = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const { startDate, endDate } = getDateRange();
    return data.filter(item => {
      if (!item) return false;
      const itemDate = new Date(item.date || item.createdAt || Date.now());
      if (isNaN(itemDate.getTime())) return false;
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  useEffect(() => { fetchDashboardData(); }, [dateFilterType, selectedYear, selectedMonth, selectedWeek, selectedDate]);

  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return `Rs ${num.toLocaleString('en-PK')}`;
  };
  const formatNumber = (num) => Number(num || 0).toLocaleString('en-PK');
  const roundToTwoDecimals = (value) => Number((value).toFixed(2));

  const handleOrderCardClick = (filterType, filterValue) => {
    navigate('/all-orders', {
      state: { orderFilter: filterType, filterValue, fromDashboard: true }
    });
  };

  const prepareChartData = (ordersData) => {
    const filteredOrders = filterByDateRange(ordersData);

    const ordersByDate = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.date || order.createdAt || Date.now());
      if (isNaN(date.getTime())) return;
      const dateKey = date.toISOString().split('T')[0];
      if (!ordersByDate[dateKey]) ordersByDate[dateKey] = { count: 0, revenue: 0 };
      ordersByDate[dateKey].count++;
      ordersByDate[dateKey].revenue += (order.finalTotal || 0);
    });
    setOrderTrendData(Object.keys(ordersByDate).sort().slice(-7).map(date => ({
      date, orders: ordersByDate[date].count, revenue: ordersByDate[date].revenue
    })));

    const statusCount = { pending: 0, 'in-progress': 0, completed: 0, delayed: 0 };
    filteredOrders.forEach(order => {
      const status = order.status || 'pending';
      if (statusCount[status] !== undefined) statusCount[status]++;
      if (order.dueDate && new Date(order.dueDate) < new Date() && status !== 'completed') statusCount.delayed++;
    });
    setStatusDistribution([
      { name: 'Pending', value: statusCount.pending, color: CHART_COLORS.warning },
      { name: 'In Progress', value: statusCount['in-progress'], color: CHART_COLORS.primary },
      { name: 'Completed', value: statusCount.completed, color: CHART_COLORS.success },
      { name: 'Delayed', value: statusCount.delayed, color: CHART_COLORS.danger }
    ].filter(i => i.value > 0));

    const paymentCount = { pending: 0, partial: 0, paid: 0 };
    filteredOrders.forEach(order => { paymentCount[order.paymentStatus || 'pending']++; });
    setPaymentDistribution([
      { name: 'Pending', value: paymentCount.pending, color: CHART_COLORS.warning },
      { name: 'Partial', value: paymentCount.partial, color: CHART_COLORS.purple },
      { name: 'Paid', value: paymentCount.paid, color: CHART_COLORS.success }
    ].filter(i => i.value > 0));

    const monthlyData = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.date || order.createdAt || Date.now());
      if (isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyData[key]) monthlyData[key] = { month: months[date.getMonth()].slice(0, 3), year: date.getFullYear(), revenue: 0, orders: 0 };
      monthlyData[key].revenue += (order.finalTotal || 0);
      monthlyData[key].orders++;
    });
    setMonthlyPerformance(Object.keys(monthlyData).sort().slice(-6).map(k => monthlyData[k]));

    const revenueByDate = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.date || order.createdAt || Date.now());
      if (isNaN(date.getTime())) return;
      const dateKey = date.toISOString().split('T')[0];
      if (!revenueByDate[dateKey]) revenueByDate[dateKey] = 0;
      revenueByDate[dateKey] += (order.finalTotal || 0);
    });
    setRevenueData(Object.keys(revenueByDate).sort().slice(-7).map(date => ({ date, revenue: revenueByDate[date] })));
  };

  // ✅ بہتر extract — ہر قسم کی API response handle کرتا ہے
  const extract = (result, label) => {
    if (result.status !== 'fulfilled') {
      console.warn(`⚠️ ${label} failed:`, result.reason?.message || result.reason);
      return [];
    }
    const r = result.value;
    console.log(`✅ ${label}:`, r);

    if (Array.isArray(r)) return r;
    if (r?.data?.data && Array.isArray(r.data.data)) return r.data.data;
    if (r?.data && Array.isArray(r.data)) return r.data;

    // Named fields (labor API وغیرہ کے لیے)
    const namedFields = ['labor', 'orders', 'customers', 'expenses', 'payments', 'credits', 'attendance', 'jobs', 'items', 'list', 'results'];
    for (const field of namedFields) {
      if (r?.[field] && Array.isArray(r[field])) return r[field];
      if (r?.data?.[field] && Array.isArray(r.data[field])) return r.data[field];
    }

    console.warn(`⚠️ ${label}: unknown format`, r);
    return [];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        getAllOrders(),
        getCustomerExpenses({ limit: 1000 }),
        getAdminExpenses({ limit: 1000 }),
        getAllCustomers(),
        getAllJobs(),
        getAllAdminPayments({ limit: 1000 }),
        getAllCredits(),
        laborService.getAllLabor(),
        attendanceService.getTodayAttendance(),
      ]);

      const ordersData = extract(results[0], 'Orders');
      const customerExpensesData = extract(results[1], 'Customer Expenses');
      const adminExpensesData = extract(results[2], 'Admin Expenses');
      const customersData = extract(results[3], 'Customers');
      const jobsData = extract(results[4], 'Jobs');
      const adminPaymentsData = extract(results[5], 'Admin Payments');
      const creditsData = extract(results[6], 'Credits');
      const laborData = extract(results[7], 'Labor');
      const todayAttendanceData = extract(results[8], 'Today Attendance');

      console.log('📊 Counts:', {
        orders: ordersData.length, customerExpenses: customerExpensesData.length,
        adminExpenses: adminExpensesData.length, customers: customersData.length,
        jobs: jobsData.length, adminPayments: adminPaymentsData.length,
        credits: creditsData.length, labor: laborData.length, attendance: todayAttendanceData.length,
      });

      setOrders(ordersData);
      prepareChartData(ordersData);

      const allExpenses = [...customerExpensesData, ...adminExpensesData];

      const newSummary = calculateSummaries(
        ordersData, allExpenses, customersData, jobsData, adminPaymentsData,
        creditsData, laborData, todayAttendanceData
      );
      setSummary(newSummary);

    } catch (error) {
      console.error("❌ FATAL Error:", error);
      setError(error?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaries = (
    ordersData, allExpenses, customersData, jobsData, adminPaymentsData,
    creditsData, laborData, todayAttendanceData
  ) => {
    // ✅ Safety checks — har argument array ho
    const safeArray = (v) => Array.isArray(v) ? v : [];
    const safeOrders = safeArray(ordersData);
    const safeExpenses = safeArray(allExpenses);
    const safeCustomers = safeArray(customersData);
    const safeJobs = safeArray(jobsData);
    const safeAdminPayments = safeArray(adminPaymentsData);
    const safeCredits = safeArray(creditsData);
    const safeLabor = safeArray(laborData);
    const safeAttendance = safeArray(todayAttendanceData);

    const filteredOrders = filterByDateRange(safeOrders);
    const filteredAllExpenses = filterByDateRange(safeExpenses);
    const filteredAdminPayments = filterByDateRange(safeAdminPayments);

    // ── Completed orders revenue (NET Profit کے لیے) ──
    const completedOrdersList = filteredOrders.filter(o => o && o.status === 'completed');
    const completedRevenue = completedOrdersList.reduce((sum, order) => {
      const advance = roundToTwoDecimals(order.advancePayment || 0);
      const embedded = (order.payments || []).reduce((pSum, p) => pSum + roundToTwoDecimals(p.amount || 0), 0);
      return sum + advance + embedded;
    }, 0);

    const totalAdminPaymentsAmount = filteredAdminPayments.reduce((sum, p) => sum + roundToTwoDecimals(p?.amount || 0), 0);
    const totalRevenue = roundToTwoDecimals(completedRevenue + totalAdminPaymentsAmount);
    const totalExpenses = roundToTwoDecimals(filteredAllExpenses.reduce((sum, exp) => sum + roundToTwoDecimals(exp?.amount || 0), 0));

    // WIP expenses (Pending + In-Progress)
    const pendingInProgressIds = new Set(
      filteredOrders.filter(o => o && (o.status === 'pending' || o.status === 'in-progress')).map(o => o._id)
    );
    const pendingInProgressExpenses = roundToTwoDecimals(
      filteredAllExpenses.filter(exp => {
        if (!exp) return false;
        const linked = exp.orderId || exp.order?._id || exp.order;
        if (!linked) return false;
        const id = typeof linked === 'object' ? linked._id : linked;
        return pendingInProgressIds.has(id);
      }).reduce((sum, exp) => sum + roundToTwoDecimals(exp.amount || 0), 0)
    );

    const totalProfit = roundToTwoDecimals(totalRevenue - totalExpenses);

    // Pending Advance
    const pendingOrdersAdvance = roundToTwoDecimals(
      filteredOrders.filter(o => o && o.status === 'pending').reduce((sum, o) => {
        const adv = roundToTwoDecimals(o.advancePayment || 0);
        const emb = (o.payments || []).reduce((s, p) => s + roundToTwoDecimals(p.amount || 0), 0);
        return sum + adv + emb;
      }, 0)
    );

    // Order counts
    let pendingPayment = 0, partialPayment = 0, completePayment = 0, completedOrdersPaymentPending = 0;
    let delayedOrders = 0, activeOrders = 0, pendingOrders = 0, completedOrders = 0, inProgressOrders = 0;
    let pendingOrdersPaymentAmount = 0, inProgressOrdersPaymentAmount = 0, completedOrdersPaymentAmount = 0;
    let pendingOrdersRemainingAmount = 0, inProgressOrdersRemainingAmount = 0, completedOrdersRemainingAmount = 0;

    const today = new Date();
    filteredOrders.forEach(order => {
      if (!order) return;
      const os = order.status || 'pending';
      const ps = order.paymentStatus || 'pending';
      const finalTotal = order.finalTotal || 0;
      const advance = order.advancePayment || 0;
      const paymentsTotal = (order.payments || []).reduce((s, p) => s + (p?.amount || 0), 0);
      const totalReceived = advance + paymentsTotal;
      const remaining = finalTotal - totalReceived;

      if (ps === 'paid') completePayment++;
      else if (ps === 'partial') partialPayment++;
      else pendingPayment++;

      if (os === 'pending') {
        pendingOrdersPaymentAmount += totalReceived;
        pendingOrdersRemainingAmount += remaining;
        pendingOrders++;
      } else if (os === 'in-progress') {
        inProgressOrdersPaymentAmount += totalReceived;
        inProgressOrdersRemainingAmount += remaining;
        inProgressOrders++;
        activeOrders++;
      } else if (os === 'completed') {
        completedOrdersPaymentAmount += totalReceived;
        completedOrdersRemainingAmount += remaining;
        completedOrders++;
      }

      if (os === 'completed' && ps !== 'paid') completedOrdersPaymentPending++;
      if (order.dueDate && new Date(order.dueDate) < today && os !== 'completed') delayedOrders++;
    });

    // ── Credits ──
    const totalCreditGiven = safeCredits.reduce((sum, c) => sum + (c?.totalAmount || 0), 0);
    const totalCreditPaid = safeCredits.reduce(
      (sum, c) => sum + (c?.payments || []).reduce((ps, p) => ps + (p?.amount || 0), 0), 0
    );
    const totalCreditPending = totalCreditGiven - totalCreditPaid;

    // ── Labor ──
    const totalWorkers = safeLabor.length;
    const activeWorkers = safeLabor.filter(l => l && l.employmentStatus === 'Active').length;

    // Today's attendance — kai formats handle karo
    let todayAttendanceList = safeAttendance;
    if (safeAttendance && !Array.isArray(safeAttendance)) {
      if (safeAttendance.attendance) todayAttendanceList = safeAttendance.attendance;
      else if (safeAttendance.data) todayAttendanceList = safeAttendance.data;
      else todayAttendanceList = [];
    }
    const todayAttendance = Array.isArray(todayAttendanceList)
      ? todayAttendanceList.filter(a => a && (a.status || '').toLowerCase() === 'present').length
      : 0;

    // Salary built
    let totalSalaryBuilt = 0;
    safeLabor.forEach(worker => {
      if (!worker) return;
      if (worker.paymentType === 'Monthly') {
        totalSalaryBuilt += Number(worker.monthlySalary) || 0;
      } else if (worker.paymentType === 'Per Day') {
        totalSalaryBuilt += Number(worker.perDayRate) || Number(worker.dailyWage) || 0;
      }
    });

    // Worker payments API nahi — Paid = 0
    const totalSalaryPaid = 0;
    const totalSalaryPending = Math.max(0, totalSalaryBuilt - totalSalaryPaid);

    return {
      totalRevenue, completedRevenue, totalExpenses, totalProfit,
      pendingInProgressExpenses, pendingOrdersAdvance,
      totalCreditGiven, totalCreditPaid, totalCreditPending,
      totalOrders: filteredOrders.length,
      totalCustomers: safeCustomers.length,
      totalJobs: safeJobs.length,
      pendingPaymentOrders: pendingPayment, partialPaymentOrders: partialPayment, completePaymentOrders: completePayment,
      completedOrdersPaymentPending, delayedOrders, activeOrders,
      pendingOrders, completedOrders, inProgressOrders,
      pendingOrdersPaymentAmount, inProgressOrdersPaymentAmount, completedOrdersPaymentAmount,
      pendingOrdersRemainingAmount, inProgressOrdersRemainingAmount, completedOrdersRemainingAmount,
      totalWorkers, activeWorkers, todayAttendance,
      totalSalaryBuilt, totalSalaryPaid, totalSalaryPending,
    };
  };

  const handleRefresh = () => fetchDashboardData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="dashboard__chart-tooltip">
          <p className="dashboard__chart-tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="dashboard__chart-tooltip-item" style={{ color: entry.color }}>
              <span className="tooltip-dot" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.name.toLowerCase().includes('revenue') ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="dashboard__container">
        <Sidebar />
        <div className="dashboard__content dashboard__content--loading">
          <div className="dashboard__spinner"></div>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard__container">
        <Sidebar />
        <div className="dashboard__content dashboard__content--error">
          <FiPackage className="dashboard__error-icon" />
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="dashboard__refresh-btn">
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard__container sideber-container-Mobile">
      <Sidebar />
      <div className="dashboard__content">

        {/* HEADER */}
        <div className="dashboard__header">
          <div className="dashboard__header-left">
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__subtitle">Welcome back, Admin</p>
          </div>
          <div className="dashboard__header-right">
            <div className="dashboard__filter-container">
              <button className="dashboard__filter-trigger" onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}>
                <FiCalendar />
                <span>{getDateRangeDisplay()}</span>
                <FiChevronDown className={isFilterDropdownOpen ? 'rotate' : ''} />
              </button>
              {isFilterDropdownOpen && (
                <div className="dashboard__filter-dropdown">
                  {['all', 'year', 'month', 'week', 'day'].map(type => (
                    <button key={type} className={`dashboard__filter-option ${dateFilterType === type ? 'active' : ''}`}
                      onClick={() => { setDateFilterType(type); setIsFilterDropdownOpen(false); }}>
                      {type === 'all' ? 'All Time' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {dateFilterType !== 'all' && (
              <div className="dashboard__date-navigation">
                <button onClick={navigatePrevious} className="dashboard__nav-btn"><FiArrowLeft /></button>
                {(dateFilterType === 'year' || dateFilterType === 'month' || dateFilterType === 'week') && (
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="dashboard__year-select">
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                )}
                {dateFilterType === 'month' && (
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="dashboard__month-select">
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                )}
                {dateFilterType === 'week' && (
                  <select value={selectedWeek} onChange={(e) => setSelectedWeek(parseInt(e.target.value))} className="dashboard__week-select">
                    {Array.from({ length: getWeeksInYear(selectedYear) }, (_, i) => i + 1).map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                )}
                {dateFilterType === 'day' && (
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className="dashboard__date-picker" />
                )}
                <button onClick={navigateNext} className="dashboard__nav-btn"><FiArrowRight /></button>
              </div>
            )}

            <button onClick={handleRefresh} className="dashboard__refresh-btn">
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* FINANCIAL CARDS — 4 */}
        <div className="dashboard__financial-section">
          <div className="dashboard__financial-card dashboard__financial-card--balance">
            <div className="dashboard__financial-icon"><BsCurrencyRupee /></div>
            <div className="dashboard__financial-content">
              <span className="dashboard__financial-label">Balance (Completed)</span>
              <span className="dashboard__financial-value">{formatCurrency(summary.totalRevenue)}</span>
            </div>
          </div>

          <div className="dashboard__financial-card dashboard__financial-card--expenses">
            <div className="dashboard__financial-icon"><BsWallet2 /></div>
            <div className="dashboard__financial-content">
              <span className="dashboard__financial-label">Total Exp</span>
              <span className="dashboard__financial-value">{formatCurrency(summary.totalExpenses)}</span>
            </div>
          </div>

          <div className="dashboard__financial-card dashboard__financial-card--profit">
            <div className="dashboard__financial-icon"><FiTrendingUp /></div>
            <div className="dashboard__financial-content">
              <span className="dashboard__financial-label">NET Profit</span>
              <span className="dashboard__financial-value">{formatCurrency(summary.totalProfit)}</span>
            </div>
          </div>

          <div
            className="dashboard__financial-card dashboard__financial-card--credits"
            onClick={() => navigate('/credit')}
            style={{ cursor: 'pointer' }}
          >
            <div className="dashboard__financial-icon"><BsWallet2 /></div>
            <div className="dashboard__financial-content">
              <span className="dashboard__financial-label">Credits (Payable)</span>
              <span className="dashboard__financial-value">{formatCurrency(summary.totalCreditPending)}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                Paid: {formatCurrency(summary.totalCreditPaid)}
              </span>
            </div>
          </div>
        </div>

        {/* ORDER RELATED */}
        <div className="dashboard__orders-section">
          <div className="dashboard__orders-header">
            <h3>Order Related</h3>
            <span className="dashboard__orders-total">Total: {formatNumber(summary.totalOrders)}</span>
          </div>

          <div className="dashboard__orders-grid">
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'all')}>
              <div className="dashboard__order-icon dashboard__order-icon--ordered"><FiShoppingBag /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Total Orders</span>
                <span className="dashboard__order-value">{formatNumber(summary.totalOrders)}</span>
              </div>
            </div>
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'pending')}>
              <div className="dashboard__order-icon dashboard__order-icon--pending"><FiClock /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Pending</span>
                <span className="dashboard__order-value">{formatNumber(summary.pendingOrders)}</span>
              </div>
            </div>
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'in-progress')}>
              <div className="dashboard__order-icon dashboard__order-icon--active"><FiActivity /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">In Progress</span>
                <span className="dashboard__order-value">{formatNumber(summary.inProgressOrders)}</span>
              </div>
            </div>
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'completed')}>
              <div className="dashboard__order-icon dashboard__order-icon--complete"><FiCheckCircle /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Completed</span>
                <span className="dashboard__order-value">{formatNumber(summary.completedOrders)}</span>
              </div>
            </div>
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'delayed')}>
              <div className="dashboard__order-icon dashboard__order-icon--delay"><FiAlertCircle /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Delayed</span>
                <span className="dashboard__order-value">{formatNumber(summary.delayedOrders)}</span>
              </div>
            </div>
          </div>

          <div className="dashboard__payment-amount-section">
            <div className="dashboard__payment-amount-header"><h4>Work In Progress — Cost & Payments</h4></div>
            <div className="dashboard__payment-amount-grid">
              <div className="dashboard__payment-amount-card pending-status">
                <div className="payment-amount-icon"><FiDollarSign /></div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">Pending — Received</span>
                  <span className="payment-amount-value">{formatCurrency(summary.pendingOrdersPaymentAmount)}</span>
                  <span className="payment-amount-sub">Remaining: {formatCurrency(summary.pendingOrdersRemainingAmount)}</span>
                </div>
              </div>
              <div className="dashboard__payment-amount-card progress-status">
                <div className="payment-amount-icon"><FiActivity /></div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">In Progress — Received</span>
                  <span className="payment-amount-value">{formatCurrency(summary.inProgressOrdersPaymentAmount)}</span>
                  <span className="payment-amount-sub">Remaining: {formatCurrency(summary.inProgressOrdersRemainingAmount)}</span>
                </div>
              </div>
              <div className="dashboard__payment-amount-card completed-status">
                <div className="payment-amount-icon"><FiCheckCircle /></div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">Completed — Received</span>
                  <span className="payment-amount-value">{formatCurrency(summary.completedOrdersPaymentAmount)}</span>
                  <span className="payment-amount-sub">Remaining: {formatCurrency(summary.completedOrdersRemainingAmount)}</span>
                </div>
              </div>
              <div className="dashboard__payment-amount-card wip-expense-status">
                <div className="payment-amount-icon"><BsWallet2 /></div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">WIP Expenses</span>
                  <span className="payment-amount-value">{formatCurrency(summary.pendingInProgressExpenses)}</span>
                  <span className="payment-amount-sub">Pending + In-Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LABOR RELATED */}
        <div className="dashboard__orders-section">
          <div className="dashboard__orders-header">
            <h3>Labor Related</h3>
            <span className="dashboard__orders-total">Total: {formatNumber(summary.totalWorkers)}</span>
          </div>

          <div className="dashboard__orders-grid">
            <div className="dashboard__order-card" onClick={() => navigate('/labor')}>
              <div className="dashboard__order-icon dashboard__order-icon--ordered"><FiUsers /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Total Workers</span>
                <span className="dashboard__order-value">{formatNumber(summary.totalWorkers)}</span>
              </div>
            </div>
            <div className="dashboard__order-card" onClick={() => navigate('/labor')}>
              <div className="dashboard__order-icon dashboard__order-icon--complete"><FiUser /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Active Workers</span>
                <span className="dashboard__order-value">{formatNumber(summary.activeWorkers)}</span>
              </div>
            </div>
            <div className="dashboard__order-card" onClick={() => navigate('/attendance')}>
              <div className="dashboard__order-icon dashboard__order-icon--pending"><FiCheckCircle /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Today's Attendance</span>
                <span className="dashboard__order-value">{formatNumber(summary.todayAttendance)}</span>
              </div>
            </div>
            <div className="dashboard__order-card" onClick={() => navigate('/worker-payment')}>
              <div className="dashboard__order-icon dashboard__order-icon--active"><FiClock /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Salary Built</span>
                <span className="dashboard__order-value">{formatCurrency(summary.totalSalaryBuilt)}</span>
              </div>
            </div>
            <div className="dashboard__order-card" onClick={() => navigate('/worker-payment')}>
              <div className="dashboard__order-icon dashboard__order-icon--complete"><FiCheckCircle /></div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Salary Paid</span>
                <span className="dashboard__order-value">{formatCurrency(summary.totalSalaryPaid)}</span>
              </div>
            </div>
          </div>

          <div className="dashboard__payment-amount-section">
            <div className="dashboard__payment-amount-header"><h4>Salary Summary</h4></div>
            <div className="dashboard__payment-amount-grid">
              <div className="dashboard__payment-amount-card completed-status">
                <div className="payment-amount-icon"><FiCheckCircle /></div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">Total Salary Built</span>
                  <span className="payment-amount-value">{formatCurrency(summary.totalSalaryBuilt)}</span>
                </div>
              </div>
              <div className="dashboard__payment-amount-card progress-status">
                <div className="payment-amount-icon"><FiDollarSign /></div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">Salary Paid</span>
                  <span className="payment-amount-value">{formatCurrency(summary.totalSalaryPaid)}</span>
                </div>
              </div>
              <div className="dashboard__payment-amount-card pending-status">
                <div className="payment-amount-icon"><FiClock /></div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">Salary Remaining</span>
                  <span className="payment-amount-value">{formatCurrency(summary.totalSalaryPending)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT STATUS */}
        <div className="dashboard__payment-section">
          <div className="dashboard__payment-header"><h3>Payment Status</h3></div>
          <div className="dashboard__payment-cards">
            <div className="dashboard__payment-card dashboard__payment-card--pending" onClick={() => handleOrderCardClick('payment', 'pending_payment')}>
              <div className="dashboard__payment-icon"><FiAlertCircle /></div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Pending Payment</span>
                <span className="dashboard__payment-value">{formatNumber(summary.pendingPaymentOrders)}</span>
              </div>
            </div>
            <div className="dashboard__payment-card dashboard__payment-card--partial" onClick={() => handleOrderCardClick('payment', 'partial_payment')}>
              <div className="dashboard__payment-icon"><FiClock /></div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Partial Payment</span>
                <span className="dashboard__payment-value">{formatNumber(summary.partialPaymentOrders)}</span>
              </div>
            </div>
            <div className="dashboard__payment-card dashboard__payment-card--complete" onClick={() => handleOrderCardClick('payment', 'complete_payment')}>
              <div className="dashboard__payment-icon"><FiCheckCircle /></div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Complete Payment</span>
                <span className="dashboard__payment-value">{formatNumber(summary.completePaymentOrders)}</span>
              </div>
            </div>
            <div className="dashboard__payment-card dashboard__payment-card--warning" onClick={() => handleOrderCardClick('payment', 'completed_payment_pending')}>
              <div className="dashboard__payment-icon"><FiTruck /></div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Completed - Pending Pay</span>
                <span className="dashboard__payment-value">{formatNumber(summary.completedOrdersPaymentPending)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER */}
        <div className="dashboard__customer-section">
          <div className="dashboard__customer-header">
            <h3>Customer</h3>
            <span className="dashboard__customer-total">Total: {formatNumber(summary.totalCustomers)}</span>
          </div>
          <div className="dashboard__customer-cards">
            <div className="dashboard__customer-card">
              <div className="dashboard__customer-icon"><FiUsers /></div>
              <div className="dashboard__customer-info">
                <span className="dashboard__customer-label">Total Customers</span>
                <span className="dashboard__customer-value">{formatNumber(summary.totalCustomers)}</span>
              </div>
            </div>
            <div className="dashboard__customer-card">
              <div className="dashboard__customer-icon"><FiUser /></div>
              <div className="dashboard__customer-info">
                <span className="dashboard__customer-label">Active Customers</span>
                <span className="dashboard__customer-value">{formatNumber(Math.floor(summary.totalCustomers * 0.7))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="dashboard__recent-orders">
          <div className="dashboard__section-header">
            <h3>Recent Orders</h3>
            <button onClick={() => navigate('/all-orders')} className="dashboard__view-all-btn">View All</button>
          </div>
          <div className="dashboard__table-wrapper">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Order Status</th><th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? orders.slice(0, 5).map(order => {
                  const ps = order.paymentStatus || 'pending';
                  const os = order.status || 'pending';
                  return (
                    <tr key={order._id} onClick={() => navigate(`/customer-orders/${order._id}`)} style={{ cursor: 'pointer' }}>
                      <td className="dashboard__table-order-id">{order.billNumber || order._id?.slice(-8) || 'N/A'}</td>
                      <td className="dashboard__table-customer">{order.customer?.name || 'N/A'}</td>
                      <td>{new Date(order.date || order.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td className="dashboard__table-amount">{formatCurrency(order.finalTotal || 0)}</td>
                      <td><span className={`dashboard__status-badge dashboard__status-badge--${os}`}>{os === 'pending' ? 'Pending' : os === 'in-progress' ? 'In Progress' : 'Completed'}</span></td>
                      <td><span className={`dashboard__status-badge dashboard__status-badge--${ps}`}>{ps === 'pending' ? 'Pending' : ps === 'partial' ? 'Partial' : 'Paid'}</span></td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CHARTS */}
        <div className="dashboard__charts-section">
          <div className="dashboard__section-header">
            <h3>Analytics & Reports</h3>
            <span className="dashboard__insights-badge">Real-time Insights</span>
          </div>

          <div className="dashboard__charts-grid">
            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><FiBarChart2 /></div>
                <div><h3>Order & Revenue Trend</h3><p>Last 7 days</p></div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={orderTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke={CHART_COLORS.primary} strokeWidth={2} name="Orders" dot={{ fill: CHART_COLORS.primary, r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={CHART_COLORS.success} strokeWidth={2} name="Revenue" dot={{ fill: CHART_COLORS.success, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><FiTrendingUp /></div>
                <div><h3>Revenue Trend</h3><p>Daily revenue</p></div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} fillOpacity={0.2} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><FiBarChart2 /></div>
                <div><h3>Monthly Performance</h3><p>Last 6 months</p></div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="orders" fill={CHART_COLORS.primary} name="Orders" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" fill={CHART_COLORS.success} name="Revenue" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><FiPieChart /></div>
                <div><h3>Order Status</h3><p>Current breakdown</p></div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" labelLine label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} innerRadius={60} dataKey="value" paddingAngle={5}>
                    {statusDistribution.map((entry, index) => <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #ec489a, #db2777)' }}><FiPieChart /></div>
                <div><h3>Payment Status</h3><p>Collection status</p></div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={paymentDistribution} cx="50%" cy="50%" labelLine label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} innerRadius={60} dataKey="value" paddingAngle={5}>
                    {paymentDistribution.map((entry, index) => <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;