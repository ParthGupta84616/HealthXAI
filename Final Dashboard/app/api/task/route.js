import Task from "@/models/Task"
import connectDb from "@/utils/ConnectDb"
// ✅ CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// ✅ OPTIONS request handler (for CORS preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ✅ POST request handler
export const POST = async (req) => {
  try {
    const { hour, purpose, done } = await req.json(); // expecting flat object
    await connectDb();
    const task = await Task.create({ hour, purpose, done });

    return new Response(JSON.stringify(task), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Task create karne me error", error }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};

// ✅ Fetch All Tasks
export const GET = async () => {
  try {
    await connectDb()
    const tasks = await Task.find()
    return new Response(JSON.stringify(tasks), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: "Tasks laane me error", error }), { status: 500 })
  }
}
