import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, X, Phone, Mail, Calendar, Download, AlertCircle } from "lucide-react";
import ExtendMembershipForm from "./ExtendMembershipForm";
import { fetchExpiredMembers } from "../services/api";

export default function ExpiredMembers({ isOpen, onClose, onMemberExtended }) {
  const [expiredMembers, setExpiredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isExtendFormOpen, setIsExtendFormOpen] = useState(false);
  const [prefillPhone, setPrefillPhone] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadExpiredMembers();
    }
  }, [isOpen]);

  const loadExpiredMembers = async () => {
    setLoading(true);
    try {
      const members = await fetchExpiredMembers();
      setExpiredMembers(members);
    } catch (error) {
      console.error("Error loading expired members:", error);
      setExpiredMembers([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  const handleExtendMembership = () => {
    // Store phone number before clearing selectedMember
    const phoneToPrefill = selectedMember?.phone || "";
    setPrefillPhone(phoneToPrefill);
    setIsExtendFormOpen(true);
    setSelectedMember(null);
  };

  const handleExtendFormClose = () => {
    setIsExtendFormOpen(false);
    setSelectedMember(null);
    setPrefillPhone("");
    loadExpiredMembers(); // Refresh the list
    if (onMemberExtended) {
      onMemberExtended();
    }
  };

  const handleExtendFormSubmit = () => {
    setIsExtendFormOpen(false);
    setSelectedMember(null);
    setPrefillPhone("");
    loadExpiredMembers(); // Refresh the list
    if (onMemberExtended) {
      onMemberExtended();
    }
  };

  const handleDownloadExcel = () => {
    // Create CSV content (Excel can open CSV files)
    const headers = ["Name", "Phone", "Email", "Membership Type", "Duration", "Start Date", "End Date", "Days Expired", "Status"];
    const rows = expiredMembers.map(member => [
      member.name || "",
      member.phone || "",
      member.email || "",
      member.membershipType || "",
      member.duration || "",
      member.startDate || "",
      member.endDate || "",
      member.daysExpired || "0",
      "Expired"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Add BOM for Excel UTF-8 support
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `expired_members_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="contact-modal-overlay"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
          exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="contact-modal expired-members-modal"
          style={{ top: '50%', left: '50%', maxWidth: '800px', maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="contact-modal-close" onClick={onClose}>
            <X className="quick-action-icon" />
          </button>
          <div className="contact-modal-header">
            <XCircle className="stat-card-icon" style={{ width: '32px', height: '32px', color: '#f43f5e' }} />
            <h3 className="contact-modal-name">Expired Members</h3>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadExcel}
              className="extend-membership-button"
              style={{ 
                width: 'auto', 
                padding: '12px 24px',
                background: 'linear-gradient(to right, #10b981, #34d399)'
              }}
            >
              <Download className="extend-membership-icon" style={{ width: '18px', height: '18px' }} />
              Download Excel
            </motion.button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading expired members...
            </div>
          ) : expiredMembers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.7)' }}>
              <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
              <p>No expired members found</p>
            </div>
          ) : (
            <div className="payments-list" style={{ maxHeight: 'calc(90vh - 300px)' }}>
              {expiredMembers.map((member, index) => (
                <motion.div
                  key={`${member.name}-${member.phone}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="payment-item expired-member-item"
                  onClick={() => handleMemberClick(member)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="payment-item-header">
                    <div className={`expiring-member-avatar ${avatarClasses[index % avatarClasses.length]}`}>
                      {initials(member.name)}
                    </div>
                    <div className="payment-item-info">
                      <p className="payment-item-name">{member.name}</p>
                      <div className="payment-item-details">
                        <span className="payment-detail">
                          <Phone className="payment-detail-icon" />
                          {member.phone}
                        </span>
                        {member.email && (
                          <span className="payment-detail">
                            <Mail className="payment-detail-icon" />
                            {member.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="payment-item-date">
                    <Calendar className="payment-date-icon" />
                    <span className="payment-date-value overdue">
                      Expired {member.daysExpired || 0} day{member.daysExpired !== 1 ? 's' : ''} ago
                    </span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    End Date: {formatDate(member.endDate)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
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
              className="contact-modal"
              style={{ top: '50%', left: '50%' }}
            >
              <button className="contact-modal-close" onClick={closeModal}>
                <X className="quick-action-icon" />
              </button>
              <div className="contact-modal-header">
                <div className={`expiring-member-avatar ${avatarClasses[expiredMembers.findIndex(m => m.name === selectedMember.name) % avatarClasses.length]}`}>
                  {initials(selectedMember.name)}
                </div>
                <h3 className="contact-modal-name">{selectedMember.name}</h3>
              </div>
              <div className="contact-modal-details">
                <div className="contact-detail-item">
                  <Phone className="contact-detail-icon" />
                  <div>
                    <p className="contact-detail-label">Phone</p>
                    <p className="contact-detail-value">{selectedMember.phone}</p>
                  </div>
                </div>
                {selectedMember.email && (
                  <div className="contact-detail-item">
                    <Mail className="contact-detail-icon" />
                    <div>
                      <p className="contact-detail-label">Email</p>
                      <p className="contact-detail-value">{selectedMember.email}</p>
                    </div>
                  </div>
                )}
                <div className="contact-detail-item">
                  <Calendar className="contact-detail-icon" />
                  <div>
                    <p className="contact-detail-label">Membership Expired</p>
                    <p className="contact-detail-value">
                      {selectedMember.daysExpired || 0} day{selectedMember.daysExpired !== 1 ? 's' : ''} ago
                    </p>
                  </div>
                </div>
                {selectedMember.endDate && (
                  <div className="contact-detail-item">
                    <Calendar className="contact-detail-icon" />
                    <div>
                      <p className="contact-detail-label">End Date</p>
                      <p className="contact-detail-value">{formatDate(selectedMember.endDate)}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="contact-modal-actions">
                <button
                  className="extend-membership-button"
                  onClick={handleExtendMembership}
                >
                  <Calendar className="extend-membership-icon" />
                  Extend Membership
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ExtendMembershipForm
        isOpen={isExtendFormOpen}
        onClose={handleExtendFormClose}
        onSubmit={handleExtendFormSubmit}
        prefillPhone={prefillPhone}
      />
    </>
  );
}