
import React from 'react';
import { motion } from 'framer-motion';

export default function SidebarItem({ 
  item, 
  isActive, 
  isCollapsed, 
  onClick,
  index 
}) {
  return (
    <motion.button
      key={item.id}
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: index * 0.05,
        duration: 0.3,
        ease: "easeOut" 
      }}
      whileHover={{ 
        scale: 1.02, 
        x: isCollapsed ? 0 : 4,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300
        ${isCollapsed ? 'justify-center' : ''}
        ${isActive 
          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/20` 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        />
      )}

      {/* Icon container */}
      <motion.div 
        className={`
          w-5 h-5 flex-shrink-0 relative
          ${isActive ? 'drop-shadow-sm' : ''}
        `}
        transition={{ duration: 0.2 }}
      >
        <item.icon className="w-full h-full" />
      </motion.div>

      {/* Text content */}
      {!isCollapsed && (
        <motion.div 
          className="text-left flex-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <span className="font-semibold block text-sm leading-tight">{item.label}</span>
          <span className={`text-xs leading-tight transition-colors duration-200 ${
              isActive ? 'text-white/70' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
            }`}>
            {item.description}
          </span>
        </motion.div>
      )}

      {/* Notification badge */}
      {item.badge && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
        >
          {item.badge}
        </motion.div>
      )}
    </motion.button>
  );
}
