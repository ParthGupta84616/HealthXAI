import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/base/Button';
import TranscriptDisplay from './TranscriptDisplay';
import ReportDisplay from './ReportDisplay';

// Animation variants for the modal
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

const TranscriptReportModal = ({
  show,
  onClose,
  transcript,
  report,
  isGeneratingReport,
  onDownloadPdf, // Pass the PDF download function
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="transcript-modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={onClose} // Close on backdrop click
        >
          {/* Inner Card */}
          <motion.div
            className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-xl bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside card
          >
            {/* Transcript Display Section */}
            <TranscriptDisplay transcript={transcript} />

            {/* Report Section */}
            <ReportDisplay
              report={report}
              isGenerating={isGeneratingReport}
              onDownloadPdf={onDownloadPdf}
            />

            {/* Close Button */}
            <Button
              label="Close"
              onClick={onClose}
              className="mt-6 w-full sm:w-auto mx-auto px-6 py-2 rounded-full bg-slate-600 text-white hover:bg-slate-700 transition-all duration-200 shadow focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 font-medium"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TranscriptReportModal;