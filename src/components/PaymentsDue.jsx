import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X, Phone, DollarSign, Calendar, Check } from "lucide-react";
import { GOOGLE_SCRIPT_URL } from "../constants/api";

export default function PaymentsDue({ paymentsDue, totalAmount, paymentsList = [], onPaymentPaid }) {
  const [showDetails, setShowDetails] = useState(false);
  const [processingPayment, setProcessingPayment] = useState({});

  function initials(name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  const avatarClasses = [
    "expiring-member-avatar-1",
    "expiring-member-avatar-2",
    "expiring-member-avatar-3",
    "expiring-member-avatar-4",
  ];

  const closeModal = () => {
    setShowDetails(false);
  };

  const handleMarkAsPaid = async (payment) => {
    const paymentKey = `${payment.phone}-${payment.name}`;
    setProcessingPayment(prev => ({ ...prev, [paymentKey]: true }));

    try {
      const today = new Date().toISOString().split('T')[0];
      const params = new URLSearchParams({
        action: "markPaymentPaid",
        number: payment.phone,
        paymentDate: today,
      });

      const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
        redirect: "follow",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Refresh dashboard data
          if (onPaymentPaid) {
            onPaymentPaid();
          }
        } else {
          alert(result.message || "Failed to mark payment as paid");
        }
      } else {
        alert("Failed to connect to server");
      }
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      alert("Failed to mark payment as paid. Please try again.");
    } finally {
      setProcessingPayment(prev => {
        const newState = { ...prev };
        delete newState[paymentKey];
        return newState;
      });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div className="occupancy-card">
          <div className="stat-card-overlay"></div>
          <div className="occupancy-card-content">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="occupancy-icon-wrapper"
            >
              <CreditCard className="occupancy-icon" />
            </motion.div>
            <h2 className="occupancy-title">Payments Due</h2>
            <div className="occupancy-content">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="occupancy-value"
              >
                {paymentsDue}
              </motion.div>
              <p className="occupancy-label">payments pending</p>
              <div className="occupancy-progress-container">
                <div className="occupancy-progress-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: paymentsDue > 0 ? "100%" : "0%" }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="occupancy-progress-fill"
                  />
                </div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="occupancy-percentage"
                >
                  ₹{totalAmount.toLocaleString()}
                </motion.span>
              </div>
              {paymentsDue > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => setShowDetails(true)}
                  className="see-details-button"
                >
                  See Details
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetails && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="contact-modal-overlay"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="contact-modal payments-modal"
              style={{ top: '50%', left: '50%' }}
            >
              <button className="contact-modal-close" onClick={closeModal}>
                <X className="quick-action-icon" />
              </button>
              <div className="contact-modal-header">
                <CreditCard className="stat-card-icon" style={{ width: '32px', height: '32px' }} />
                <h3 className="contact-modal-name">Pending Payments</h3>
              </div>
              <div className="payments-list">
                {paymentsList.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '20px' }}>
                    No pending payments
                  </p>
                ) : (
                  paymentsList.map((payment, index) => (
                    <motion.div
                      key={`${payment.name}-${payment.phone}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="payment-item"
                    >
                      <div className="payment-item-header">
                        <div className={`expiring-member-avatar ${avatarClasses[index % avatarClasses.length]}`}>
                          {initials(payment.name)}
                        </div>
                        <div className="payment-item-info">
                          <p className="payment-item-name">{payment.name}</p>
                          <div className="payment-item-details">
                            <span className="payment-detail">
                              <Phone className="payment-detail-icon" />
                              {payment.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="payment-item-amount">
                        <DollarSign className="payment-amount-icon" />
                        <span className="payment-amount-value">₹{payment.amount.toLocaleString()}</span>
                      </div>
                      <div className="payment-item-date">
                        <Calendar className="payment-date-icon" />
                        <span className={`payment-date-value ${payment.daysUntilPayment === 0 ? 'overdue' : ''}`}>
                          {payment.daysUntilPayment === 0 
                            ? 'Due Today' 
                            : payment.daysUntilPayment < 0 
                            ? `${Math.abs(payment.daysUntilPayment)} days overdue`
                            : `Due in ${payment.daysUntilPayment} day${payment.daysUntilPayment !== 1 ? 's' : ''}`
                          }
                        </span>
                      </div>
                      <button
                        className="payment-paid-button"
                        onClick={() => handleMarkAsPaid(payment)}
                        disabled={processingPayment[`${payment.phone}-${payment.name}`]}
                      >
                        <Check className="payment-paid-icon" />
                        {processingPayment[`${payment.phone}-${payment.name}`] ? "Processing..." : "Mark as Paid"}
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
