import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Calendar, XCircle, Sparkles } from "lucide-react";
import AddMemberForm from "./AddMemberForm";
import ExtendMembershipForm from "./ExtendMembershipForm";
import ExpiredMembers from "./ExpiredMembers";

const actions = [
  { label: "Add Member", icon: UserPlus, buttonClass: "quick-action-button-1", delay: 0, action: "addMember" },
  { label: "Extend Membership", icon: Calendar, buttonClass: "quick-action-button-2", delay: 0.1, action: "extend" },
  { label: "Expired Members", icon: XCircle, buttonClass: "quick-action-button-3", delay: 0.2, action: "expired" },
];

export default function QuickActions({ onMemberAdded }) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isExtendFormOpen, setIsExtendFormOpen] = useState(false);
  const [isExpiredMembersOpen, setIsExpiredMembersOpen] = useState(false);

  const handleActionClick = (action) => {
    if (action === "addMember") {
      setIsAddFormOpen(true);
    } else if (action === "extend") {
      setIsExtendFormOpen(true);
    } else if (action === "expired") {
      setIsExpiredMembersOpen(true);
    } else {
      // Handle other actions here
      console.log(`Action: ${action}`);
    }
  };

  const handleFormSubmit = (data) => {
    console.log("Form submitted:", data);
    // Refresh dashboard data after member is added/extended
    if (onMemberAdded) {
      setTimeout(() => {
        onMemberAdded();
      }, 1000); // Wait a bit for Google Sheets to update
    }
  };

  return (
    <>
      <div className="quick-actions-card">
        <div className="stat-card-overlay"></div>
        <div className="quick-actions-content">
          <div className="quick-actions-header">
            <div className="quick-actions-icon-wrapper">
              <Sparkles className="stat-card-icon" style={{ width: '20px', height: '20px' }} />
            </div>
            <h2 className="quick-actions-title">Quick Actions</h2>
          </div>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: action.delay }}
                whileHover={{ scale: 1.02 }}
              >
                <button 
                  className={`quick-action-button ${action.buttonClass}`}
                  onClick={() => handleActionClick(action.action)}
                >
                  <Icon className="quick-action-icon" />
                  {action.label}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
      <AddMemberForm 
        isOpen={isAddFormOpen} 
        onClose={() => setIsAddFormOpen(false)} 
        onSubmit={handleFormSubmit}
      />
      <ExtendMembershipForm 
        isOpen={isExtendFormOpen} 
        onClose={() => setIsExtendFormOpen(false)} 
        onSubmit={handleFormSubmit}
      />
      <ExpiredMembers
        isOpen={isExpiredMembersOpen}
        onClose={() => setIsExpiredMembersOpen(false)}
        onMemberExtended={handleFormSubmit}
      />
    </>
  );
}