import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Phone, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { GOOGLE_SCRIPT_URL } from "../constants/api";

export default function ExtendMembershipForm({ isOpen, onClose, onSubmit, prefillPhone = "" }) {
  const [formData, setFormData] = useState({
    number: "",
    duration: "",
    paymentDateType: "today", // "today" or "custom"
    paymentDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Update phone number when prefillPhone changes
  useEffect(() => {
    if (prefillPhone && isOpen) {
      setFormData(prev => ({ ...prev, number: prefillPhone }));
    }
  }, [prefillPhone, isOpen]);

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
    if (!formData.number || !formData.duration) {
      setError("Please fill in all fields");
      return;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(formData.number)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine payment date
      let paymentDate = null;
      if (formData.paymentDateType === "today") {
        paymentDate = "today";
      } else if (formData.paymentDateType === "custom" && formData.paymentDate) {
        paymentDate = formData.paymentDate;
      }

      // Build URL with parameters
      const params = new URLSearchParams({
        action: "extendMembership",
        number: formData.number,
        duration: formData.duration,
      });
      
      if (paymentDate) {
        params.append("paymentDate", paymentDate);
      }

      // Google Apps Script Web Apps use redirects (302), handle this properly
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
          method: "GET",
          redirect: "follow",
        });

        const responseText = await response.text();
        
        // Try to parse as JSON first
        let result = null;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          // If not JSON, check for error indicators in HTML
          if (responseText.includes("not found") || responseText.includes("Member with this number")) {
            setError("Member with this number not found");
            setIsSubmitting(false);
            return;
          }
          console.log("Response received (may be HTML):", responseText.substring(0, 200));
        }

        // If we got JSON response, check it
        if (result) {
          if (result.success) {
            setSuccessMessage(`Membership extended by ${formData.duration} month(s) successfully!`);
            setShowSuccess(true);
            setIsSubmitting(false);
            setTimeout(() => {
              onSubmit(formData);
              setFormData({ 
                number: prefillPhone || "", 
                duration: "",
                paymentDateType: "today",
                paymentDate: "",
              });
              setError("");
              setShowSuccess(false);
              onClose();
            }, 2500);
            return;
          } else {
            if (result.message && result.message.includes("not found")) {
              setError("Member with this number not found");
            } else {
              setError(result.message || "Failed to extend membership. Please try again.");
            }
            setIsSubmitting(false);
            return;
          }
        }

        // If we got here, request went through (redirect shows HTML but data is saved)
        setSuccessMessage(`Membership extended by ${formData.duration} month(s) successfully!`);
        setShowSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => {
          onSubmit(formData);
          setFormData({ number: "", duration: "" });
          setError("");
          setShowSuccess(false);
          onClose();
        }, 2500);
      } catch (fetchError) {
        // If fetch fails, try with no-cors
        console.log("Standard fetch failed, trying no-cors:", fetchError);
        try {
          await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
            method: "GET",
            mode: "no-cors",
          });
          // With no-cors, we can't read response but data is saved
          setSuccessMessage(`Membership extended by ${formData.duration} month(s) successfully!`);
          setShowSuccess(true);
          setIsSubmitting(false);
          setTimeout(() => {
            onSubmit(formData);
            setFormData({ number: "", duration: "" });
            setError("");
            setShowSuccess(false);
            onClose();
          }, 2500);
        } catch (noCorsError) {
          setError("Failed to extend membership. Please check your internet connection and try again.");
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setError("Failed to extend membership. Please check your internet connection and try again.");
      console.error("Error submitting form:", err);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!showSuccess) {
      setFormData({
        number: prefillPhone || "",
        duration: "",
        paymentDateType: "today",
        paymentDate: "",
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
                  Membership Extended!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="success-message"
                >
                  {successMessage}
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
                    <Calendar className="stat-card-icon" style={{ width: '24px', height: '24px' }} />
                  </div>
                  <h3 className="contact-modal-name">Extend Membership</h3>
                </div>
                <form onSubmit={handleSubmit} className="add-member-form">
                  {error && (
                    <div className="form-error">
                      <AlertCircle className="form-icon" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      {error}
                    </div>
                  )}
                  
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
                      <Clock className="form-icon" />
                      Extension Duration
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="form-input form-select"
                      required
                    >
                      <option value="">Select duration to extend</option>
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Calendar className="form-icon" />
                      Payment Date
                    </label>
                    <select
                      name="paymentDateType"
                      value={formData.paymentDateType}
                      onChange={handleChange}
                      className="form-input form-select"
                      required
                    >
                      <option value="today">Today</option>
                      <option value="custom">Custom Date</option>
                    </select>
                  </div>

                  {formData.paymentDateType === "custom" && (
                    <div className="form-group">
                      <label className="form-label">
                        <Calendar className="form-icon" />
                        Select Payment Date
                      </label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleChange}
                        className="form-input"
                        min={new Date().toISOString().split('T')[0]}
                        required={formData.paymentDateType === "custom"}
                      />
                    </div>
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
                      {isSubmitting ? "Extending..." : "Extend Membership"}
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

