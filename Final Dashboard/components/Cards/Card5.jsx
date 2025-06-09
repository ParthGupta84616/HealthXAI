import React, { useState, useEffect } from "react";
import { 
  Document, Page, Text, View, StyleSheet, PDFDownloadLink, 
  Font, Image 
} from "@react-pdf/renderer";

// Register fonts (optional but improves appearance)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2563EB',
    fontWeight: 700,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
    color: '#1F2937',
    paddingBottom: 5,
    borderBottom: '1px solid #E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 700,
    width: '30%',
  },
  infoValue: {
    width: '70%',
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bulletPoint: {
    width: 15,
  },
  listContent: {
    flex: 1,
  },
  numberPoint: {
    width: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 10,
    borderTop: '1px solid #E5E7EB',
    paddingTop: 10,
  },
  logo: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    marginBottom: 10,
  }
});

// PDF Document component
const MedicalReportPDF = ({ reportData }) => {
  // Handle the structured data format
  const { 
    patientInformation, 
    chiefComplaint, 
    historyOfPresentIllness, 
    relevantMedicalHistory, 
    assessment, 
    recommendedNextSteps 
  } = reportData.structured || {};

  // Get current date for the report
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Optional: Add logo */}
        {/* <Image style={styles.logo} src="/logo.png" /> */}
        
        <Text style={styles.header}>Medical Consultation Summary</Text>
        <Text style={{fontSize: 11, textAlign: 'center', marginBottom: 20, color: '#6B7280'}}>
          Generated on {currentDate}
        </Text>
        
        {/* Patient Information Section */}
        {patientInformation && Object.keys(patientInformation).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Information</Text>
            {Object.entries(patientInformation).map(([key, value], index) => (
              <View style={styles.infoRow} key={index}>
                <Text style={styles.infoLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Chief Complaint Section */}
        {chiefComplaint && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chief Complaint</Text>
            <Text style={styles.paragraph}>{chiefComplaint}</Text>
          </View>
        )}
        
        {/* History of Present Illness Section */}
        {historyOfPresentIllness && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History of Present Illness</Text>
            <Text style={styles.paragraph}>{historyOfPresentIllness}</Text>
          </View>
        )}
        
        {/* Relevant Medical History Section */}
        {relevantMedicalHistory && relevantMedicalHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Relevant Medical History</Text>
            {relevantMedicalHistory.map((item, index) => (
              <View style={styles.listItem} key={index}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.listContent}>{item}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Assessment Section */}
        {assessment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Assistant's Assessment</Text>
            <Text style={styles.paragraph}>{assessment}</Text>
          </View>
        )}
        
        {/* Recommended Next Steps Section */}
        {recommendedNextSteps && recommendedNextSteps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Assistant's Recommended Next Steps</Text>
            {recommendedNextSteps.map((step, index) => (
              <View style={styles.listItem} key={index}>
                <Text style={styles.numberPoint}>{index + 1}.</Text>
                <Text style={styles.listContent}>{step}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Footer */}
        <Text style={styles.footer}>
          This report was automatically generated based on an AI consultation. 
          Please consult with a healthcare professional for medical advice.
        </Text>
      </Page>
    </Document>
  );
};

// Fallback component for markdown reports
const MarkdownReportPDF = ({ reportText }) => {
  // Create a simplified version for markdown reports
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Medical Consultation Summary</Text>
        
        {/* Split the report into sections based on markdown headings */}
        {reportText.split(/^## /m).map((section, index) => {
          if (!section.trim()) return null;
          
          const lines = section.trim().split('\n');
          const heading = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();
          
          return (
            <View style={styles.section} key={index}>
              <Text style={styles.sectionTitle}>{heading}</Text>
              <Text style={styles.paragraph}>{content}</Text>
            </View>
          );
        })}
        
        <Text style={styles.footer}>
          This report was automatically generated based on an AI consultation. 
          Please consult with a healthcare professional for medical advice.
        </Text>
      </Page>
    </Document>
  );
};

// Component for report generation and download
const Card5 = ({
  transcript = [],
  generateReportApiCall,
  downloadReportAsPDF,
  conversationActive = false,
  report: externalReport,
  isGeneratingReport: externalIsGenerating
}) => {
  const bottomCardMinHeight = "min-h-[220px]";

  // Use local state that can be overridden by props
  const [localReport, setLocalReport] = useState(null);
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  // Use external state if provided, otherwise use local state
  const report = externalReport !== undefined ? externalReport : localReport;
  const isGeneratingReport = externalIsGenerating !== undefined ? externalIsGenerating : localIsGenerating;

  // Update local state when external report changes
  useEffect(() => {
    if (externalReport) {
      setIsReportGenerated(true);
    }
  }, [externalReport]);

  // Function to handle generate report button click
  const handleGenerateReport = async () => {
    // Prevent generating report if conversation is active
    if (conversationActive) {
      alert("Please finish your conversation before generating a report.");
      return;
    }

    if (!transcript || transcript.length === 0) {
      alert("No transcript available. Please complete a consultation first.");
      return;
    }

    setLocalIsGenerating(true);
    setLocalReport(null);

    try {
      // If a function was passed from the parent, use it
      if (typeof generateReportApiCall === "function") {
        // Call the function and capture the returned report
        const generatedReport = await generateReportApiCall(transcript);
        
        // Only update local report if external one isn't being managed by parent
        if (externalReport === undefined) {
          setLocalReport(generatedReport || { markdown: "No report content received" });
        }
      } else {
        // Otherwise make the API call directly
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        setLocalReport(data.report);
      }

      setIsReportGenerated(true);
    } catch (error) {
      console.error("Failed to generate report:", error);
      setLocalReport({ 
        markdown: `Failed to generate report: ${error.message}`,
        structured: null 
      });
    } finally {
      setLocalIsGenerating(false);
    }
  };

  // Get appropriate PDF document based on report format
  const getPdfDocument = () => {
    if (!report) return null;
    
    if (report.structured) {
      return <MedicalReportPDF reportData={report} />;
    } else {
      const reportText = typeof report === 'string' ? report : (report.markdown || "No report content");
      return <MarkdownReportPDF reportText={reportText} />;
    }
  };

  // Determine if the generate button should be disabled
  const generateButtonDisabled =
    isGeneratingReport || conversationActive || transcript.length === 0;
    
  // Determine if download button should be disabled
  const downloadButtonDisabled = !report || isGeneratingReport;

  return (
    <div
      className={`relative bg-gray-100 rounded-2xl p-6 overflow-hidden shadow-md ${bottomCardMinHeight} flex flex-col justify-between`}
      style={{
        backgroundImage: "url('/assets/pattern.svg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
        backgroundSize: "200px",
      }}
    >
      <div>
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Report Management
          </h2>
        </div>
        <p className="text-base text-gray-600 mb-4">
          {isReportGenerated
            ? "Your medical report is ready to download."
            : conversationActive
            ? "Finish your conversation to generate a report."
            : "Generate and download reports based on your consultation for your personal records."}
        </p>
        {isReportGenerated && (
          <div className="mt-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg
                className="mr-1.5 h-2 w-2 text-green-400"
                fill="currentColor"
                viewBox="0 0 8 8"
              >
                <circle cx="4" cy="4" r="3" />
              </svg>
              Report Generated
            </span>
          </div>
        )}
        {conversationActive && (
          <div className="mt-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <svg
                className="mr-1.5 h-2 w-2 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 8 8"
              >
                <circle cx="4" cy="4" r="3" />
              </svg>
              Conversation Active
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
        <button
          onClick={handleGenerateReport}
          disabled={generateButtonDisabled}
          className={`inline-flex items-center justify-between ${
            generateButtonDisabled
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-white hover:shadow-lg"
          } text-gray-900 font-medium px-5 py-3 rounded-full shadow-sm transition`}
          title={
            conversationActive
              ? "Finish your conversation first"
              : "Generate medical report"
          }
        >
          {isGeneratingReport ? "Generating..." : "Generate Report"}
          {!isGeneratingReport && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          )}
        </button>
        
        {/* Replace the download button with PDFDownloadLink when report is available */}
        {report ? (
          <PDFDownloadLink 
            document={getPdfDocument()}
            fileName="medical-report.pdf"
            className={`inline-flex items-center justify-between ${
              downloadButtonDisabled
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-white hover:shadow-lg"
            } text-gray-900 font-medium px-5 py-3 rounded-full shadow-sm transition`}
            disabled={downloadButtonDisabled}
          >
            {({ loading }) => 
              loading ? 'Preparing PDF...' : (
                <>
                  Download Report
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </>
              )
            }
          </PDFDownloadLink>
        ) : (
          <button
            disabled={true}
            className="inline-flex items-center justify-between bg-gray-200 cursor-not-allowed text-gray-900 font-medium px-5 py-3 rounded-full shadow-sm transition"
          >
            Download Report
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Card5;