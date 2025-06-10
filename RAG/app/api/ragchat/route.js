import fs from "fs";
import path from "path";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { Ollama } from "@langchain/ollama";
import { Buffer } from "buffer";

const mainChatMessageHistory = new ChatMessageHistory();

export async function POST(req) {
  try {
    const { question, modelSelected, pdf } = await req.json();
    console.log(question, modelSelected, pdf ? "PDF received" : "No PDF");

    let pdfText = "";

    if (pdf) {
      // Ensure the public directory exists
      const publicPath = path.join(process.cwd(), "public");
      if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
      }

      // Generate a unique filename
      const filename = `file_${Date.now()}.pdf`;
      const filePath = path.join(publicPath, filename);

      // Save the base64 PDF to the public folder
      const pdfBuffer = Buffer.from(pdf, "base64");
      fs.writeFileSync(filePath, pdfBuffer);

      console.log(`PDF saved as: ${filename}`);

      // Fetch extracted text from the existing API
      const apiUrl = `http://localhost:3010/api/pdfiles?file=${filename}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to process PDF: ${await response.text()}`);
      }

      const { text } = await response.json();
      pdfText = text || "";
      console.log("Extracted text:", pdfText);
    }

    // System message
    const systemMessage = `You are a Professional Doctor who is tasked to give medical advice to a patient in a coherent, concise, and clear manner. Provide the patient with the necessary information to help them make an informed decision.`;

    // Add system message to history if not already set
    if (mainChatMessageHistory.messages.length === 0) {
      mainChatMessageHistory.addMessage(new SystemMessage(systemMessage));
    }

    const model = new Ollama({
      model: modelSelected,
      baseUrl: "http://localhost:11434",
      stream: true,
    });

    // Combine extracted text with the user’s question
    const combinedText = `${pdfText}\n\nUser Question: ${question}`;

    // Add the user's question to history
    await mainChatMessageHistory.addMessage(new HumanMessage(question));

    // Generate response
    const completePrompt = `${systemMessage}\n\n${combinedText}\n\nAI: `;
    let fullResponse = "";

    for await (const chunk of await model.stream(completePrompt)) {
      fullResponse += chunk;
    }

    // Add AI response to history
    await mainChatMessageHistory.addMessage(new AIMessage(fullResponse));

    // Remove <think> tags
    function extractMessage(response) {
      return response.replace(/<think>.*?<\/think>/g, "").trim();
    }

    fullResponse = extractMessage(fullResponse);

    return new Response(JSON.stringify({ text: fullResponse }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
