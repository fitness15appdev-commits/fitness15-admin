import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Phone, Calendar, Clock, CheckCircle, DollarSign, CreditCard } from "lucide-react";
import { GOOGLE_SCRIPT_URL } from "../constants/api";

export default function AddMemberForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    membershipType: "",
    duration: "",
    membershipFees: "",
    paymentType: "Full",
    nextPayment: "",
    paymentDueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const membershipTypes = [
    "Basic",
    "Premium",
    "VIP",
    "Student",
    "Corporate",
  ];

  const durationOptions = [
    { label: "1 Month", value: "1" },
    { label: "3 Months", value: "3" },
    { label: "6 Months", value: "6" },
    { label: "12 Months", value: "12" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.number || !formData.membershipType || !formData.duration || !formData.membershipFees) {
      setError("Please fill in all required fields");
      return;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(formData.number)) {
      setError("Please enter a valid phone number");
      return;
    }
    
    // Validate membership fees is a valid number
    const fees = parseFloat(formData.membershipFees);
    if (isNaN(fees) || fees < 0) {
      setError("Please enter a valid membership fee amount");
      return;
    }
    
    // Validate payment fields based on payment type
    if (formData.paymentType === "Partial") {
      if (!formData.nextPayment || !formData.paymentDueDate) {
        setError("Please fill in Next Payment Amount and Payment Due Date for partial payment");
        return;
      }
      const nextPayment = parseFloat(formData.nextPayment);
      if (isNaN(nextPayment) || nextPayment < 0) {
        setError("Please enter a valid next payment amount");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Build URL with parameters for adding member
      const params = new URLSearchParams({
        action: "addMember",
        name: formData.name,
        number: formData.number,
        membershipType: formData.membershipType,
        duration: formData.duration,
        membershipFees: formData.membershipFees,
        paymentType: formData.paymentType,
        nextPayment: formData.paymentType === "Partial" ? formData.nextPayment : "",
        paymentDueDate: formData.paymentType === "Partial" ? formData.paymentDueDate : "",
        timestamp: new Date().toISOString(),
      });

      // Try to fetch with response reading (handle redirects - 302 is normal for Google Apps Script)
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
        redirect: "follow", // Follow redirects
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Success - show animation
          setShowSuccess(true);
          setIsSubmitting(false);
          
          setTimeout(() => {
            onSubmit(formData);
            setFormData({
              name: "",
              number: "",
              membershipType: "",
              duration: "",
            });
            setError("");
            setShowSuccess(false);
            onClose();
          }, 2500);
        } else {
          // Error from server
          if (result.message && result.message.includes("already exists")) {
            setError("Membership with this number already exists");
          } else {
            setError(result.message || "Failed to add member. Please try again.");
          }
          setIsSubmitting(false);
        }
      } else {
        // HTTP error
        setError("Failed to connect to server. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      // Network or other error - try with no-cors as fallback
      try {
        await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
          method: "GET",
          mode: "no-cors",
        });
        
        // If no-cors succeeds, assume success (server will validate)
        setShowSuccess(true);
        setIsSubmitting(false);
        
        setTimeout(() => {
          onSubmit(formData);
          setFormData({
            name: "",
            number: "",
            membershipType: "",
            duration: "",
          });
          setError("");
          setShowSuccess(false);
          onClose();
        }, 2500);
      } catch (fallbackErr) {
        setError("Failed to add member. Please check your internet connection and try again.");
        console.error("Error submitting form:", fallbackErr);
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!showSuccess) {
      setFormData({
        name: "",
        number: "",
        membershipType: "",
        duration: "",
        membershipFees: "",
        paymentType: "Full",
        nextPayment: "",
        paymentDueDate: "",
      });
      setError("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="contact-modal-overlay"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="contact-modal add-member-modal"
            style={{ top: '50%', left: '50%' }}
          >
            <button className="contact-modal-close" onClick={handleClose}>
              <X className="quick-action-icon" />
            </button>
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="success-animation-container"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="success-check-circle"
                >
                  <CheckCircle className="success-icon" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="success-title"
                >
                  Member Added Successfully!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="success-message"
                >
                  {formData.name} has been added to the system.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="success-progress-bar"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="success-progress-fill"
                  />
                </motion.div>
              </motion.div>
            ) : (
              <>
                <div className="add-member-header">
                  <div className="add-member-icon-wrapper">
                    <UserPlus className="stat-card-icon" style={{ width: '24px', height: '24px' }} />
                  </div>
                  <h3 className="contact-modal-name">Add New Member</h3>
                </div>
                <form onSubmit={handleSubmit} className="add-member-form">
              {error && <div className="form-error">{error}</div>}
              
              <div className="form-group">
                <label className="form-label">
                  <UserPlus className="form-icon" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter member name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone className="form-icon" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar className="form-icon" />
                  Membership Type
                </label>
                <select
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                  className="form-input form-select"
                  required
                >
                  <option value="">Select membership type</option>
                  {membershipTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock className="form-icon" />
                  Duration
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="form-input form-select"
                  required
                >
                  <option value="">Select duration</option>
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <DollarSign className="form-icon" />
                  Membership Fees (₹)
                </label>
                <input
                  type="number"
                  name="membershipFees"
                  value={formData.membershipFees}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter membership fee"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <CreditCard className="form-icon" />
                  Payment Type
                </label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  className="form-input form-select"
                  required
                >
                  <option value="Full">Full</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>

              {formData.paymentType === "Partial" && (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      <DollarSign className="form-icon" />
                      Next Payment Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="nextPayment"
                      value={formData.nextPayment}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter next payment amount"
                      min="0"
                      step="0.01"
                      required={formData.paymentType === "Partial"}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Calendar className="form-icon" />
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      name="paymentDueDate"
                      value={formData.paymentDueDate}
                      onChange={handleChange}
                      className="form-input"
                      required={formData.paymentType === "Partial"}
                    />
                  </div>
                </>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  className="form-button form-button-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="form-button form-button-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

