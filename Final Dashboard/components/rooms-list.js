"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { CalendarDays, CheckCircle } from "lucide-react";

export default function RoomSchedule() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [tasks, setTasks] = useState([]);

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Fetch tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/task");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  const handleHourClick = (hour) => {
    setSelectedHour(hour);
    setOpenModal(true);
  };

  const handleSave = async () => {
    const newTask = { hour: selectedHour, purpose, done: false };
    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error("Failed to save task");
      const savedTask = await response.json();
      setTasks([...tasks, savedTask]);
      setOpenModal(false);
      setPurpose("");
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const toggleTaskStatus = async (id) => {
    try {
      const task = tasks.find((t) => t._id === id);
      const updatedDoneStatus = !task.done;

      const response = await fetch(`/api/task/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: updatedDoneStatus }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#D3DAE8] to-[#EDE7D4] rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg text-gray-900">Room Schedule</h2>
        <button
          onClick={() => setOpenCalendar(!openCalendar)}
          className="flex items-center gap-2 bg-[#0B1325]  text-gray-300 font-medium py-2 px-4 rounded-xl"
        >
          <CalendarDays className="w-5 h-5" />
          Open Calendar
        </button>
      </div>

      <div className="border border-gray-700 rounded-xl p-4 bg-transparent">
        {openCalendar ? (
          <div className="grid grid-cols-6 gap-2">
            {hours.map((hour) => (
              <button
                key={hour}
                onClick={() => handleHourClick(hour)}
                className="py-2 text-sm text-gray-800 bg-[#EDE7D4] rounded-lg border hover:bg-amber-50 transition"
              >
                {hour}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Click "Open Calendar" to schedule a task.
          </p>
        )}

        {tasks.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2 text-gray-800">Scheduled Tasks</h3>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTaskStatus(task._id)}
                    className="w-5 h-5 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <span
                    className={task.done ? "line-through text-gray-500" : ""}
                  >
                    {task.hour} — {task.purpose}
                  </span>
                  {task.done && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-sm rounded-xl bg-[#8C8F99] p-6">
            <Dialog.Title className="text-lg font-semibold mb-2">
              Set Task for {selectedHour}
            </Dialog.Title>
            <input
              type="text"
              placeholder="What's the purpose?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-slate-900"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-950"
              >
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
