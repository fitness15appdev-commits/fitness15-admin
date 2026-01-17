import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function LiveOccupancy({ current, totalMembers }) {
  const percent = Math.round((current / totalMembers) * 100);
  
  return (
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
            <Users className="occupancy-icon" />
          </motion.div>
          <h2 className="occupancy-title">Members Inside</h2>
          <div className="occupancy-content">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="occupancy-value"
            >
              {current}
            </motion.div>
            <p className="occupancy-label">out of {totalMembers} members</p>
            <div className="occupancy-progress-container">
              <div className="occupancy-progress-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
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
                {percent}%
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}