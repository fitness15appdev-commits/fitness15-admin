import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Phone, User, Mail, Calendar, Shield, Target, AlertTriangle, CreditCard, IndianRupee } from "lucide-react";
import { fetchMemberDetails } from "../services/api";

export default function MemberDetails({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [memberData, setMemberData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setMemberData(null);

    if (!phoneNumber.trim()) {
      setError("Please enter a phone number");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      const data = await fetchMemberDetails(phoneNumber.trim());
      setMemberData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch member details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber("");
    setMemberData(null);
    setError("");
    onClose();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "₹0";
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
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
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="contact-modal member-details-modal"
            style={{ top: '50%', left: '50%' }}
          >
            <button className="contact-modal-close" onClick={handleClose}>
              <X className="quick-action-icon" />
            </button>

            <div className="contact-modal-header">
              <Search className="stat-card-icon" style={{ width: '32px', height: '32px' }} />
              <h3 className="contact-modal-name">Get Member Details</h3>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="member-search-form">
              <div className="form-group">
                <label className="form-label">
                  <Phone className="form-icon" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-input"
                  placeholder="Enter member's phone number"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                className="form-button form-button-submit"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search Member"}
              </button>
            </form>

            {/* Member Details Display */}
            <AnimatePresence>
              {memberData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="member-details-content"
                >
                  {/* Member Basic Info */}
                  <div className="member-info-section">
                    <h4 className="section-title">Basic Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <User className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Name:</span>
                          <span className="info-value">{memberData.name || "N/A"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Phone className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Phone:</span>
                          <span className="info-value">{memberData.phoneNumber || "N/A"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Mail className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Email:</span>
                          <span className="info-value">{memberData.email || "N/A"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Calendar className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Date of Birth:</span>
                          <span className="info-value">{formatDate(memberData.dateOfBirth)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Membership Information */}
                  <div className="member-info-section">
                    <h4 className="section-title">Membership Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <CreditCard className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Membership Type:</span>
                          <span className="info-value">{memberData.membershipType || "N/A"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Calendar className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Duration:</span>
                          <span className="info-value">{memberData.duration || "N/A"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Calendar className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Start Date:</span>
                          <span className="info-value">{formatDate(memberData.startDate)}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Calendar className="info-icon" size={16} />
                        <div>
                          <span className="info-label">End Date:</span>
                          <span className="info-value">{formatDate(memberData.endDate)}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <IndianRupee className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Membership Fees:</span>
                          <span className="info-value">{formatCurrency(memberData.membershipFees)}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <CreditCard className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Payment Type:</span>
                          <span className="info-value">{memberData.paymentType || "N/A"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <IndianRupee className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Next Payment:</span>
                          <span className="info-value">{formatCurrency(memberData.nextPayment)}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Calendar className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Payment Due Date:</span>
                          <span className="info-value">{formatDate(memberData.paymentDueDate)}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Calendar className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Last Payment Date:</span>
                          <span className="info-value">{formatDate(memberData.lastPaymentDate)}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Shield className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Status:</span>
                          <span className={`info-value status-${memberData.status?.toLowerCase()}`}>
                            {memberData.status || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact & Goals */}
                  <div className="member-info-section">
                    <h4 className="section-title">Emergency Contact & Goals</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <User className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Emergency Contact:</span>
                          <span className="info-value">{memberData.emergencyContactName || "N/A"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Phone className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Emergency Phone:</span>
                          <span className="info-value">{memberData.emergencyContactPhone || "N/A"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Target className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Goal:</span>
                          <span className="info-value">{memberData.goal || "N/A"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <AlertTriangle className="info-icon" size={16} />
                        <div>
                          <span className="info-label">Medical Notes:</span>
                          <span className="info-value">{memberData.medicalNotes || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Notes */}
                  {memberData.specialNotes && (
                    <div className="member-info-section">
                      <h4 className="section-title">Special Notes</h4>
                      <p className="special-notes">{memberData.specialNotes}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}