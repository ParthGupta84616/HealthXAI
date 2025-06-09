import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Task from '@/models/Task'; // Import existing model
import connectDb from '@/utils/ConnectDb';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

export async function POST(request) {
  try {
    // 1. Parse the request body
    const body = await request.json();
    const { transcript } = body;
    console.log("This is the Transcript",transcript);

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: 'Invalid transcript data provided' }, 
        { status: 400 }
      );
    }

    // 2. Extract relevant text from the transcript
    // Filter for assistant messages that might contain task information
    const conversationText = transcript
  .filter(msg => (msg.type === 'final' || msg.type === 'partial') && msg.text) 
  .map(msg => `${msg.role}: ${msg.text}`)
  .join('\n\n');

    console.log("This is the conversation text before split",conversationText);
    // If the conversation is too short or empty, return early
    if (conversationText.split('\n').length < 3) {
  return NextResponse.json({
    message: 'Conversation too brief for task extraction',
    taskCount: 0,
    results: []
  }, { status: 200 });
}
    
    console.log("This is the conversation text after split",conversationText);
    // Look specifically for the TASK SUMMARY format we defined in the prompt
    const summaryText = transcript
  .filter(msg => 
    msg.role === 'assistant' && 
    msg.text && 
    (msg.text.toLowerCase().includes('task summary') || 
     msg.text.toLowerCase().includes('new task') || 
     msg.text.toLowerCase().includes('updated task'))
  )
  .map(msg => msg.text)
  .join('\n\n');
    
    console.log("This is the summary text",summaryText);
    // Check if conversation mentions tasks even when a formal summary isn't found
    const mentionsTasks = transcript.some(msg => 
        msg.text && (
          msg.text.toLowerCase().includes('add a task') ||
          msg.text.toLowerCase().includes('new task') ||
          msg.text.toLowerCase().includes('update') && msg.text.toLowerCase().includes('task') ||
          msg.text.toLowerCase().includes('change') && msg.text.toLowerCase().includes('schedule') ||
          msg.text.toLowerCase().includes('mark') && (
            msg.text.toLowerCase().includes('complete') || 
            msg.text.toLowerCase().includes('done')
          )
        )
      );
    console.log("These are the mentioned tasks",mentionsTasks);
    // 3. Construct a prompt for the AI with improved instructions for incomplete conversations
    const promptText = `
Extract tasks that need to be created or updated from the following conversation between a health assistant and a user. 

The tasks are likely listed in a TASK SUMMARY section at the end of the conversation using this format:
- NEW TASK: [Hour] - [Purpose]
- UPDATED TASK: Original '[Original Purpose]' changed to '[New Purpose]' at [Hour]
- COMPLETED: [Hour] - [Purpose]

HOWEVER, the conversation might have ended abruptly or without a proper summary. 
In such cases, carefully analyze the entire conversation to identify:
1. Any clear mentions of adding new tasks (with times and descriptions)
2. Any clear mentions of updating existing tasks (with what was changed)
3. Any clear mentions of completing tasks

FULL CONVERSATION:
${conversationText}

SUMMARY SECTION (if provided):
${summaryText || "No formatted summary section found"}

Your task is to identify:
1. NEW tasks that should be created
2. EXISTING tasks that should be updated

Output ONLY a valid JSON array with objects having these properties:
- "action": either "create" or "update"
- "hour": the time for the task (in format like "8:00 AM")
- "purpose": the description of the task
- "originalPurpose": (only for updates) the original task description that's being updated
- "confidence": a number between 0 and 1 indicating how confident you are about this task extraction (0.9+ for explicit mentions, lower for inferred tasks)

Example format:
[
  {"action": "create", "hour": "5:00 PM", "purpose": "Yoga session", "confidence": 0.95},
  {"action": "update", "hour": "12:30 PM", "purpose": "Salad with grilled chicken", "originalPurpose": "Prepare and eat a healthy lunch (e.g., salad)", "confidence": 0.8}
]

If no tasks need to be created or updated, return an empty array: []
`;

    console.log("Sending to AI for processing...");

    // 4. Call the AI model
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const textResponse = response.text();

    // 5. Parse the AI response to extract JSON
    let tasksToProcess = [];
    try {
      // Extract JSON from the response (accounting for possible markdown code blocks)
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        tasksToProcess = JSON.parse(jsonStr);
      } else {
        // Try alternative parsing method if needed
        const cleanedText = textResponse.replace(/```json|```/g, '').trim();
        tasksToProcess = JSON.parse(cleanedText);
      }
      
      console.log("Extracted tasks:", tasksToProcess);

      // If no tasks were found, but conversation hints at tasks, retry with a more aggressive approach
      if (tasksToProcess.length === 0 && mentionsTasks) {
        console.log("No tasks found in initial pass, but conversation mentions tasks. Trying again with less formal extraction...");
        
        // More aggressive second pass to extract tasks 
        const secondPassPrompt = `
The following is a conversation between a health assistant and a user. The conversation mentions creating, updating, or completing tasks,
but doesn't have a clear summary. Please carefully analyze the entire conversation to extract ANY implied or mentioned tasks.

${conversationText}

Find ANY mentions of:
1. Creating new tasks (with time if mentioned)
2. Changing existing tasks (what was changed)
3. Completing tasks

Be more liberal with your extraction. If you see any hint of a task, extract it.
Output ONLY a valid JSON array. For uncertain cases, include them but with lower confidence scores:

[
  {"action": "create", "hour": "5:00 PM", "purpose": "Yoga session", "confidence": 0.7},
  {"action": "update", "hour": "12:00 PM", "purpose": "Salad with grilled chicken", "originalPurpose": "Healthy lunch", "confidence": 0.6}
]
`;
        
        const secondPassResult = await model.generateContent(secondPassPrompt);
        const secondPassResponse = await secondPassResult.response;
        const secondPassText = secondPassResponse.text();
        
        try {
          const secondPassMatch = secondPassText.match(/\[[\s\S]*\]/);
          if (secondPassMatch) {
            tasksToProcess = JSON.parse(secondPassMatch[0]);
            console.log("Second pass extracted tasks:", tasksToProcess);
          }
        } catch (secondPassError) {
          console.error("Error in second pass extraction:", secondPassError);
          // Continue with empty tasks array from first pass
        }
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw AI response:", textResponse);
      return NextResponse.json(
        { error: 'Failed to parse tasks from AI response', rawResponse: textResponse }, 
        { status: 500 }
      );
    }

    
    // 6. Connect to the database using the utility function
    try {
      await connectDb();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: 'Database connection failed', message: dbError.message }, 
        { status: 500 }
      );
    }

    // 7. Process the tasks (create or update in the database)
    const results = [];
    
    // Filter out low-confidence tasks (below 0.5) if confidence score is provided
    const filteredTasks = tasksToProcess.filter(task => 
      !task.hasOwnProperty('confidence') || task.confidence >= 0.5
    );
    
    for (const task of filteredTasks) {
      try {
        if (task.action === 'create' && task.hour && task.purpose) {
          // Create a new task
          const newTask = new Task({
            hour: task.hour,
            purpose: task.purpose,
            done: false
          });
          
          await newTask.save();
          results.push({ 
            status: 'created', 
            task: {
              id: newTask._id,
              hour: newTask.hour,
              purpose: newTask.purpose,
              done: newTask.done
            },
            confidence: task.confidence || 1.0
          });
          
        } else if (task.action === 'update' && task.originalPurpose) {
          // Find the task by matching the original purpose
          const existingTask = await Task.findOne({ 
            purpose: { $regex: new RegExp(task.originalPurpose, 'i') }
          });
          
          if (existingTask) {
            // Update the task
            if (task.hour) existingTask.hour = task.hour;
            if (task.purpose) existingTask.purpose = task.purpose;
            
            await existingTask.save();
            results.push({ 
              status: 'updated', 
              task: {
                id: existingTask._id,
                hour: existingTask.hour,
                purpose: existingTask.purpose,
                done: existingTask.done
              },
              confidence: task.confidence || 1.0
            });
          } else {
            results.push({ 
              status: 'not_found', 
              originalPurpose: task.originalPurpose,
              confidence: task.confidence || 1.0
            });
          }
        } else {
          results.push({ 
            status: 'invalid_data', 
            task,
            confidence: task.confidence || 0.0
          });
        }
      } catch (taskError) {
        console.error("Error processing task:", task, taskError);
        results.push({ 
          status: 'error', 
          task, 
          error: taskError.message 
        });
      }
    }

    // 8. Return the results with context about the extraction
    return NextResponse.json({
      message: results.length > 0 
        ? 'Transcript processed successfully' 
        : 'No actionable tasks were identified in the conversation',
      taskCount: results.length,
      foundSummary: summaryText.length > 0,
      mentionsTasks: mentionsTasks,
      conversationLength: conversationText.split('\n').length,
      results
    }, { status: 200 });
    
  } catch (error) {
    console.error("General error processing transcript:", error);
    return NextResponse.json(
      { error: 'Server error processing transcript', message: error.message }, 
      { status: 500 }
    );
  }
}