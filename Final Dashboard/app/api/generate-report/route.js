import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI - This runs on the server where the key is available
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Parses the markdown text into a structured JSON object.
 * This structure should align with what MedicalReportPDF in Card5.jsx expects.
 */
function parseMarkdownToStructured(markdownText) {
  console.log("[parseMarkdownToStructured] Starting to parse markdown:", markdownText.substring(0, 100) + "...");
  
  // Initialize the structure matching MedicalReportPDF's needs
  const structured = {
    patientInformation: {}, // Expected as an object { key: value, ... }
    chiefComplaint: "", // Expected as a string
    historyOfPresentIllness: "", // Expected as a string
    relevantMedicalHistory: [], // Expected as an array of strings
    assessment: "", // Expected as a string
    recommendedNextSteps: [] // Expected as an array of strings
  };

  // Split the markdown by headings (## pattern)
  const sections = markdownText.split(/^## /m);
  console.log(`[parseMarkdownToStructured] Found ${sections.length} sections`);

  // Process each section
  for (const section of sections) {
    if (!section.trim()) continue;
    
    // Get the first line as the heading
    const lines = section.trim().split('\n');
    const heading = lines[0].trim();
    console.log(`[parseMarkdownToStructured] Processing section: "${heading}"`);
    
    const content = lines.slice(1).join('\n').trim();
    
    // Map headings to the structured object
    if (heading.includes("Patient Information")) {
      const infoLines = content.split('\n');
      infoLines.forEach(line => {
        if (line.includes(':')) {
          // Ensure key is consistently formatted (e.g., camelCase or lowercase)
          // Here, using lowercase to match the example, but consistency is key.
          const [rawKey, value] = line.split(':', 2).map(s => s.trim());
          // Simple conversion to camelCase or just lowercase
          const key = rawKey.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); 
          if (key && value) {
            structured.patientInformation[key] = value;
          }
        }
      });
      console.log("[parseMarkdownToStructured] Patient Information:", structured.patientInformation);
    } 
    else if (heading.includes("Chief Complaint")) {
      structured.chiefComplaint = content;
      console.log("[parseMarkdownToStructured] Chief Complaint:", structured.chiefComplaint);
    }
    else if (heading.includes("History of Present Illness")) {
      structured.historyOfPresentIllness = content;
      console.log("[parseMarkdownToStructured] History length:", structured.historyOfPresentIllness.length);
    }
    else if (heading.includes("Relevant Medical History")) {
      // Ensure items are split correctly and empty lines are filtered
      structured.relevantMedicalHistory = content
        .split(/\n/) // Split by new line
        .map(item => item.replace(/^[•*\-]\s*/, '').trim()) // Remove list markers
        .filter(item => item.length > 0); // Remove empty items
      console.log("[parseMarkdownToStructured] Medical History items:", structured.relevantMedicalHistory);
    }
    else if (heading.includes("Assessment")) {
      structured.assessment = content;
      console.log("[parseMarkdownToStructured] Assessment length:", structured.assessment.length);
    }
    else if (heading.includes("Recommended Next Steps")) {
      // Ensure items are split correctly and empty lines are filtered
      structured.recommendedNextSteps = content
        .split(/\n/) // Split by new line
        .map(item => item.replace(/^\d+\.\s*/, '').trim()) // Remove numbered list markers
        .filter(item => item.length > 0); // Remove empty items
      console.log("[parseMarkdownToStructured] Recommended steps:", structured.recommendedNextSteps);
    }
  }

  console.log("[parseMarkdownToStructured] Completed parsing, returning structured data:", structured);
  return structured;
}

/**
 * Generates a medical report summary from a conversation transcript using Gemini.
 * Returns an object containing both markdown and structured data.
 */
async function generateReportFromTranscript(transcript) {
  console.log("[generateReportFromTranscript] Starting with transcript length:", transcript.length);
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("[API Route] Gemini API Key is missing.");
    throw new Error("Server configuration error.");
  }

  if (!transcript || transcript.length === 0) {
    console.warn("[generateReportFromTranscript] Transcript data is empty.");
    throw new Error("Transcript data is empty.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5 flash as 2.0 isn't a valid model name
  console.log("[generateReportFromTranscript] Initialized Gemini model: gemini-1.5-flash");

  const formattedTranscript = transcript
    .map(msg => `${msg.role === 'user' ? 'Patient' : 'Dr. Morgan (AI)'}: ${msg.text}`) // Changed msg.message to msg.text
    .join('\n');
  
    console.log("[generateReportFromTranscript] Formatted transcript sample:", 
      formattedTranscript.substring(0, 150) + "...");
  

  // Updated prompt to explicitly ask for JSON output alongside Markdown
  const prompt = `
    Analyze the following conversation transcript between an AI assistant (Dr. Morgan) and a patient regarding their symptoms. Generate a concise medical report summary suitable for a human doctor.

    **Output Format:**
    Provide the output in two formats within a single response:
    1.  **Markdown:** A human-readable report using Markdown headings (##) for each section.
    2.  **JSON Structure:** A JSON object containing the structured data. Use the following keys:
        *   \`patientInformation\`: An object with key-value pairs (e.g., \`{"name": "...", "age": "..."}\`). Use lowercase keys.
        *   \`chiefComplaint\`: A string.
        *   \`historyOfPresentIllness\`: A string.
        *   \`relevantMedicalHistory\`: An array of strings.
        *   \`assessment\`: A string (summary of AI's findings).
        *   \`recommendedNextSteps\`: An array of strings.

    **Report Sections (Include if information is available):**
    1.  **Patient Information:** Name, Age, Weight/Height (if mentioned).
    2.  **Chief Complaint:** The primary reason for the consultation.
    3.  **History of Present Illness:** Symptom details (onset, duration, severity, quality, location, associated symptoms, factors).
    4.  **Relevant Medical History:** Existing conditions, past surgeries, medications disclosed.
    5.  **AI Assistant's Assessment (Summary):** Key points gathered and potential conditions mentioned by the AI (label as AI suggestions).
    6.  **AI Assistant's Recommended Next Steps:** Tests, referrals, or self-care advice suggested by the AI.

    **Instructions:**
    *   Focus on extracting factual information from the conversation.
    *   Do not add information not present in the transcript.
    *   Avoid definitive diagnoses.
    *   If a section has no information, represent it appropriately in both formats (e.g., empty string, empty array, empty object).

    **Conversation Transcript:**
    ---
    ${formattedTranscript}
    ---

    **Generated Output (Markdown and JSON):**
    \`\`\`markdown
    ## Patient Information
    ...

    ## Chief Complaint
    ...
    
    ... (rest of markdown sections) ...
    \`\`\`
    
    \`\`\`json
    {
      "patientInformation": { ... },
      "chiefComplaint": "...",
      "historyOfPresentIllness": "...",
      "relevantMedicalHistory": [ ... ],
      "assessment": "...",
      "recommendedNextSteps": [ ... ]
    }
    \`\`\`
  `;

  console.log("[generateReportFromTranscript] Prompt prepared, sending to Gemini...");
  
  // Configure Gemini for JSON output
  const generationConfig = {
    // Ensure JSON mode is supported and enabled if available, otherwise rely on parsing
    // responseMimeType: "application/json", // Uncomment if using a model/version supporting direct JSON output
  };

  const result = await model.generateContent(prompt, generationConfig);
  const response = await result.response;
  const responseText = await response.text();
  
  console.log("[generateReportFromTranscript] Received response from Gemini, length:", responseText.length);
  console.log("[generateReportFromTranscript] Full Gemini Response Text:\n", responseText); // Log the full response for debugging

  let reportMarkdown = "";
  let structuredReport = null;

  // Attempt to parse both Markdown and JSON from the response
  try {
    // Extract Markdown part
    const mdMatch = responseText.match(/```markdown([\s\S]*?)```/);
    if (mdMatch && mdMatch[1]) {
      reportMarkdown = mdMatch[1].trim();
      console.log("[generateReportFromTranscript] Extracted Markdown part.");
    } else {
      // Fallback if markdown block markers aren't found
      reportMarkdown = responseText.split('```json')[0].trim(); // Assume markdown comes first
      console.warn("[generateReportFromTranscript] Markdown block ```markdown ... ``` not found, attempting fallback extraction.");
    }

    // Extract JSON part
    const jsonMatch = responseText.match(/```json([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      const jsonString = jsonMatch[1].trim();
      console.log("[generateReportFromTranscript] Extracted JSON string:", jsonString);
      structuredReport = JSON.parse(jsonString);
      console.log("[generateReportFromTranscript] Successfully parsed JSON part.");
    } else {
       console.warn("[generateReportFromTranscript] JSON block ```json ... ``` not found. Falling back to parsing the extracted markdown.");
       // Fallback: If JSON block is missing, parse the markdown we extracted/generated
       structuredReport = parseMarkdownToStructured(reportMarkdown || responseText); // Use markdown if available, else full text
    }
    
    // Basic validation of structured report
    if (!structuredReport || typeof structuredReport !== 'object') {
        console.error("[generateReportFromTranscript] Failed to obtain a valid structured report object. Using default structure.");
        structuredReport = { patientInformation: {}, chiefComplaint: "", historyOfPresentIllness: "", relevantMedicalHistory: [], assessment: "", recommendedNextSteps: [] };
    }

  } catch (parseError) {
    console.error("[generateReportFromTranscript] Error parsing Gemini response:", parseError);
    console.warn("[generateReportFromTranscript] Falling back to parsing the full response text as Markdown.");
    // Fallback if parsing fails: try parsing the entire response as markdown
    reportMarkdown = responseText; // Use the full text as markdown
    structuredReport = parseMarkdownToStructured(responseText); 
  }

  // Ensure the final object structure matches what the frontend expects
  const finalReportObject = {
    markdown: reportMarkdown || "Failed to generate markdown report.", // Provide fallback text
    structured: structuredReport // Use the parsed/fallback structured data
  };
  
  console.log("[generateReportFromTranscript] Final report object prepared:", finalReportObject);
  
  return finalReportObject;
}

// POST handler for the API route
export async function POST(request) {
  console.log("[POST] Received request to /api/generate-report");
  
  try {
    const requestData = await request.json();
    console.log("[POST] Request body:", requestData);
    
    const { transcript } = requestData;

    if (!transcript || !Array.isArray(transcript)) {
      console.error("[POST] Invalid or missing transcript in request body");
      return NextResponse.json({ error: 'Transcript is required and must be an array' }, { status: 400 });
    }
    console.log("[POST] Transcript length:", transcript.length);


    console.log("[POST] Calling generateReportFromTranscript...");
    const report = await generateReportFromTranscript(transcript);
    console.log("[POST] Report generated successfully.");

    // The structure returned is { markdown: "...", structured: {...} }
    // The frontend expects { report: { markdown: "...", structured: {...} } }
    console.log("[POST] Sending response:", { report });
    return NextResponse.json({ report }); // Wrap the result in a 'report' key

  } catch (error) {
    console.error("[POST] Error in /api/generate-report:", error);
    // Provide more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}