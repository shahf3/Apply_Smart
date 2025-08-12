
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ stat, index }) {
  const isPositiveTrend = stat.change && (stat.change.includes('+') || stat.change.includes('Complete'));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -6,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="group relative bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-lg border border-gray-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Background gradient overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300`}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 dark:opacity-10">
        <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full transform translate-x-12 -translate-y-12`} />
      </div>

      {/* Header with icon and trend */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <motion.div
          className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300`}
        >
          <stat.icon className="w-6 h-6 text-white drop-shadow-sm" />
        </motion.div>
        
        {stat.change && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15 + 0.2 }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isPositiveTrend 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20' 
                : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'
            }`}
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {stat.change}
          </motion.div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.1 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-1 leading-tight"
        >
          {stat.value}
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.15 }}
          className="text-gray-500 dark:text-gray-400 font-medium mb-4 text-sm"
        >
          {stat.title}
        </motion.p>
      </div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.15 + 0.3 }}
        className="relative z-10 mt-3"
      >
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: stat.title === 'Profile Completion' 
                ? stat.value.replace('%', '') + '%' 
                : '75%'
            }}
            transition={{ 
              delay: index * 0.2 + 0.5,
              duration: 1.2,
              ease: "circOut"
            }}
            className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
