import Task from "@/models/Task"
import connectDb from "@/utils/ConnectDb"

// ✅ Update Task Status
export const PATCH = async (req, { params }) => {
  try {
    const { id } = params
    const { done } = await req.json()
    await connectDb()

    const task = await Task.findByIdAndUpdate(id, { done }, { new: true })

    if (!task) {
      return new Response(JSON.stringify({ message: "Task not found" }), { status: 404 })
    }

    return new Response(JSON.stringify(task), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error updating task", error }), { status: 500 })
  }
}
