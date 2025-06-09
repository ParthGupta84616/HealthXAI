import React from 'react';
import { motion } from 'framer-motion';

const PleaseSetYourPublicKeyMessage = ({ isDiagnosisPage = false }) => {
  // The isDiagnosisPage prop seems unused in the current implementation,
  // but kept it in case it's needed for future variations.
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="mt-4 px-4 py-3 bg-red-100 text-red-700 rounded-xl shadow-sm text-sm text-center w-full"
    >
      Vapi API Key missing or invalid. Please check your <code>.env</code> file
      (<code>NEXT_PUBLIC_VAPI_API_KEY</code>).
    </motion.div>
  );
};

export default PleaseSetYourPublicKeyMessage;