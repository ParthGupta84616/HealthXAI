import React from 'react';
import Button from '@/components/base/Button';

const ReportDisplay = ({ report, isGenerating, onDownloadPdf }) => {
  // Check if the report is valid (exists and doesn't indicate an error/failure)
  const isValidReport = report && !report.startsWith("Error:") && !report.startsWith("Failed");

  return (
    <div className="mt-6 pt-4 border-t border-slate-200">
      <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">
        Generated Summary
      </h3>
      {isGenerating ? (
        <p className="text-center text-slate-500 animate-pulse">
          Generating report...
        </p>
      ) : (
        <>
          {/* Report Text Display */}
          <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded mb-4 max-h-[30vh] overflow-y-auto border">
            {/* Display the report or a placeholder message */}
            {report || "Report generation failed or is pending."}
          </div>
          {/* Download Button - Conditionally rendered */}
          {isValidReport && (
            <Button
              label="Download Report (PDF)"
              onClick={onDownloadPdf} // Use the passed function directly
              disabled={isGenerating} // Should already be false here, but good practice
              className="w-full sm:w-auto mx-auto px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 font-medium disabled:opacity-60"
            />
          )}
        </>
      )}
    </div>
  );
};

export default ReportDisplay;