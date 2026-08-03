import { motion } from 'framer-motion';

export default function Bookings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col"
    >
      <h1 className="text-3xl font-bold text-white mb-8">Bookings</h1>
      <div className="glass-panel rounded-2xl p-12 flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">Coming Soon</h2>
          <p className="text-gray-500">This page is under construction.</p>
        </div>
      </div>
    </motion.div>
  );
}
