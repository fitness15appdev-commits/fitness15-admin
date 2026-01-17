import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, AlertTriangle, IndianRupee, Sparkles, CreditCard, Calendar, Filter } from "lucide-react";
import StatCard from "../components/StatCard";
import ExpiringMemberships from "../components/ExpiringMemberships";
import PaymentsDue from "../components/PaymentsDue";
import ActivationPending from "../components/ActivationPending";
import QuickActions from "../components/QuickActions";
import { fetchDashboardData } from "../services/api";
import "../styles/dashboard.css";

const icons = [Users, UserCheck, AlertTriangle, IndianRupee];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeMembers: 0,
      activationPending: 0,
      expiringSoon: 0,
      totalMembershipCost: 0
    },
    expiringMembers: [],
    pendingActivations: {
      count: 0,
      list: []
    },
    payments: {
      count: 0,
      totalAmount: 0,
      list: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all"); // "all", "monthly", "custom"
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showActivationPendingModal, setShowActivationPendingModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, [dateRange, customStartDate, customEndDate]);

  // Close custom date picker when both dates are set
  useEffect(() => {
    if (dateRange === "custom" && customStartDate && customEndDate) {
      // Small delay to allow user to see the selection
      const timer = setTimeout(() => {
        setShowCustomDatePicker(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [customStartDate, customEndDate, dateRange]);

  const loadDashboardData = async () => {
    try {
      const data = await fetchDashboardData(dateRange, customStartDate, customEndDate);
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range === "custom") {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  // Get date range label for subscription cost
  const getDateRangeLabel = () => {
    if (dateRange === "all") return "All Time";
    if (dateRange === "monthly") return "Monthly";
    if (dateRange === "custom" && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`;
    }
    return "All Time";
  };

  // Format stats for StatCard component
  const stats = [
    { title: "Active Members", value: dashboardData.stats.activeMembers },
    { title: "Activation Pending", value: dashboardData.stats.activationPending },
    { title: "Expiring Soon", value: dashboardData.stats.expiringSoon },
    { 
      title: `Total Membership Cost (₹) - ${getDateRangeLabel()}`, 
      value: formatCost(dashboardData.stats.totalMembershipCost),
      showFilter: true
    }
  ];

  function formatCost(amount) {
    if (amount >= 100000) {
      return (amount / 100000).toFixed(1) + "L";
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + "K";
    }
    return amount.toString();
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="dashboard-header"
      >
        <div className="dashboard-title-container">
          <div className="dashboard-icon-wrapper">
            <Sparkles className="stat-card-icon" />
          </div>
          <h1 className="dashboard-title">Fitness 15</h1>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="stats-grid"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {s.showFilter && (
              <div className="date-filter-container">
                <div className="date-filter-buttons">
                  <button
                    className={`date-filter-btn ${dateRange === "all" ? "active" : ""}`}
                    onClick={() => handleDateRangeChange("all")}
                  >
                    All Time
                  </button>
                  <button
                    className={`date-filter-btn ${dateRange === "monthly" ? "active" : ""}`}
                    onClick={() => handleDateRangeChange("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`date-filter-btn ${dateRange === "custom" ? "active" : ""}`}
                    onClick={() => handleDateRangeChange("custom")}
                  >
                    Custom
                  </button>
                </div>
                {showCustomDatePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="custom-date-picker"
                  >
                    <div className="date-input-group">
                      <label>
                        <Calendar className="form-icon" style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="date-input"
                      />
                    </div>
                    <div className="date-input-group">
                      <label>
                        <Calendar className="form-icon" style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="date-input"
                        min={customStartDate}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <StatCard 
                {...s} 
                icon={icons[i]} 
                index={i}
                onClick={s.title === "Activation Pending" ? () => setShowActivationPendingModal(true) : undefined}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bottom-grid"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ExpiringMemberships members={dashboardData.expiringMembers} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PaymentsDue 
            paymentsDue={dashboardData.payments.count} 
            totalAmount={dashboardData.payments.totalAmount} 
            paymentsList={dashboardData.payments.list || []}
            onPaymentPaid={loadDashboardData}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <QuickActions onMemberAdded={loadDashboardData} />
        </motion.div>
      </motion.div>

      {/* Activation Pending Modal */}
      <ActivationPending
        pendingCount={dashboardData.pendingActivations.count}
        pendingList={dashboardData.pendingActivations.list || []}
        onMemberActivated={loadDashboardData}
        isOpen={showActivationPendingModal}
        onClose={() => setShowActivationPendingModal(false)}
      />
    </div>
  );
}