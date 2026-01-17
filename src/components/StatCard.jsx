import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, index = 0, onClick }) {
  const gradientClass = `stat-card-gradient-${(index % 4) + 1}`;
  const iconGradientClass = `stat-card-icon-gradient-${(index % 4) + 1}`;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div 
        className={`stat-card ${gradientClass}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className="stat-card-overlay"></div>
        <div className="stat-card-content">
          <div className="stat-card-info">
            <p className="stat-card-title">{title}</p>
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="stat-card-value"
            >
              {value}
            </motion.p>
          </div>
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className={`stat-card-icon-wrapper ${iconGradientClass}`}
          >
            <Icon className="stat-card-icon" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}