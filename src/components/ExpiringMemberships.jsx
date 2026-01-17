import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Phone, Mail, Calendar } from "lucide-react";
import ExtendMembershipForm from "./ExtendMembershipForm";

export default function ExpiringMemberships({ members }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isExtendFormOpen, setIsExtendFormOpen] = useState(false);
  const [prefillPhone, setPrefillPhone] = useState("");

  function initials(name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0,2)
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
    setSelectedMember(null); // Close the contact details modal
  };

  const handleExtendFormClose = () => {
    setIsExtendFormOpen(false);
    setSelectedMember(null);
    setPrefillPhone("");
  };

  const handleExtendFormSubmit = () => {
    // Form submission handled by ExtendMembershipForm
    setIsExtendFormOpen(false);
    setSelectedMember(null);
    setPrefillPhone("");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div className="expiring-card">
          <div className="stat-card-overlay"></div>
          <div className="expiring-card-content">
            <div className="expiring-card-header">
              <div className="expiring-card-icon-wrapper">
                <Clock className="stat-card-icon" style={{ width: '20px', height: '20px' }} />
              </div>
              <h2 className="expiring-card-title">Expiring Memberships</h2>
            </div>
            <div className="expiring-members-list">
              {members.map((m, index) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="expiring-member-item"
                  onClick={() => handleMemberClick(m)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="expiring-member-info">
                    <motion.span
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`expiring-member-avatar ${avatarClasses[index % avatarClasses.length]}`}
                    >
                      {initials(m.name)}
                    </motion.span>
                    <span className="expiring-member-name">{m.name}</span>
                  </span>
                  <span className="expiring-member-days">
                    {m.daysLeft} days
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

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
                <div className={`expiring-member-avatar ${avatarClasses[members.findIndex(m => m.name === selectedMember.name) % avatarClasses.length]}`}>
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
                  <Clock className="contact-detail-icon" />
                  <div>
                    <p className="contact-detail-label">Membership Expires In</p>
                    <p className="contact-detail-value">{selectedMember.daysLeft} days</p>
                  </div>
                </div>
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