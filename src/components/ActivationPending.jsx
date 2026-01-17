import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, X, Phone, Mail, Clock } from "lucide-react";
import ActivateMemberForm from "./ActivateMemberForm";

export default function ActivationPending({ pendingCount, pendingList = [], onMemberActivated, isOpen: externalIsOpen, onClose: externalOnClose }) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isActivateFormOpen, setIsActivateFormOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : showDetails;
  const handleClose = externalOnClose || (() => setShowDetails(false));

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
    if (externalOnClose) {
      externalOnClose();
    } else {
      setShowDetails(false);
    }
    setSelectedMember(null);
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleActivateMember = (member) => {
    setPrefillData({
      number: member.phone,
      name: member.name,
      specialNotes: member.specialNotes || ""
    });
    setIsActivateFormOpen(true);
    setSelectedMember(null);
    setShowDetails(false);
  };

  const handleActivateFormClose = () => {
    setIsActivateFormOpen(false);
    setPrefillData(null);
    if (onMemberActivated) {
      onMemberActivated();
    }
  };

  const handleActivateFormSubmit = () => {
    setIsActivateFormOpen(false);
    setPrefillData(null);
    if (onMemberActivated) {
      onMemberActivated();
    }
  };

  // If external control is provided, only render modal, not the card
  if (externalIsOpen !== undefined) {
    return (
      <>
        <AnimatePresence>
          {isOpen && (
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
                  <UserCheck className="stat-card-icon" style={{ width: '32px', height: '32px' }} />
                  <h3 className="contact-modal-name">Pending Activations</h3>
                </div>
                <div className="payments-list">
                  {pendingList.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '20px' }}>
                      No pending activations
                    </p>
                  ) : (
                    pendingList.map((member, index) => (
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
                            </div>
                          </div>
                        </div>
                        {member.specialNotes && (
                          <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            {member.specialNotes}
                          </div>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivateMember(member);
                          }}
                          className="extend-membership-button"
                          style={{ marginTop: '12px', width: '100%' }}
                        >
                          <UserCheck className="extend-membership-icon" style={{ width: '18px', height: '18px' }} />
                          Activate Member
                        </motion.button>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
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
                  <div className={`expiring-member-avatar ${avatarClasses[pendingList.findIndex(m => m.name === selectedMember.name) % avatarClasses.length]}`}>
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
                  {selectedMember.specialNotes && (
                    <div className="contact-detail-item">
                      <Clock className="contact-detail-icon" />
                      <div>
                        <p className="contact-detail-label">Special Notes</p>
                        <p className="contact-detail-value">{selectedMember.specialNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="contact-modal-actions">
                  <button
                    className="extend-membership-button"
                    onClick={() => handleActivateMember(selectedMember)}
                  >
                    <UserCheck className="extend-membership-icon" />
                    Activate Member
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <ActivateMemberForm
          isOpen={isActivateFormOpen}
          onClose={handleActivateFormClose}
          onSubmit={handleActivateFormSubmit}
          prefillData={prefillData}
        />
      </>
    );
  }

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
              <UserCheck className="occupancy-icon" />
            </motion.div>
            <h2 className="occupancy-title">Activation Pending</h2>
            <div className="occupancy-content">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="occupancy-value"
              >
                {pendingCount}
              </motion.div>
              <p className="occupancy-label">members awaiting activation</p>
              {pendingCount > 0 && (
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
                <UserCheck className="stat-card-icon" style={{ width: '32px', height: '32px' }} />
                <h3 className="contact-modal-name">Pending Activations</h3>
              </div>
              <div className="payments-list">
                {pendingList.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '20px' }}>
                    No pending activations
                  </p>
                ) : (
                  pendingList.map((member, index) => (
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
                          </div>
                        </div>
                      </div>
                      {member.specialNotes && (
                        <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          {member.specialNotes}
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateMember(member);
                        }}
                        className="extend-membership-button"
                        style={{ marginTop: '12px', width: '100%' }}
                      >
                        <UserCheck className="extend-membership-icon" style={{ width: '18px', height: '18px' }} />
                        Activate Member
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
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
                <div className={`expiring-member-avatar ${avatarClasses[pendingList.findIndex(m => m.name === selectedMember.name) % avatarClasses.length]}`}>
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
                {selectedMember.specialNotes && (
                  <div className="contact-detail-item">
                    <Clock className="contact-detail-icon" />
                    <div>
                      <p className="contact-detail-label">Special Notes</p>
                      <p className="contact-detail-value">{selectedMember.specialNotes}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="contact-modal-actions">
                <button
                  className="extend-membership-button"
                  onClick={() => handleActivateMember(selectedMember)}
                >
                  <UserCheck className="extend-membership-icon" />
                  Activate Member
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ActivateMemberForm
        isOpen={isActivateFormOpen}
        onClose={handleActivateFormClose}
        onSubmit={handleActivateFormSubmit}
        prefillData={prefillData}
      />
    </>
  );
}
