import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} // Titik awal: tidak terlihat dan sedikit ke bawah
      animate={{ opacity: 1, y: 0 }} // Titik akhir: terlihat penuh dan di posisi normal
      exit={{ opacity: 0, y: -15 }} // Titik keluar: menghilang ke atas (jika kita pakai AnimatePresence)
      transition={{ duration: 0.3, ease: 'easeOut' }} // Durasi dan gaya animasi (smooth)
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;