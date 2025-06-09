import React from 'react';

const ScheduleModal = ({ doctor, isOpen, onClose }) => {
  if (!isOpen || !doctor) return null;

  const handleSchedule = (event) => {
    event.preventDefault();
    // Add logic here to handle the scheduling form submission
    // e.g., collect date/time, send to an API
    console.log(`Scheduling appointment with ${doctor.name}...`);
    alert(`Scheduling appointment with ${doctor.name} (implementation pending).`);
    onClose(); // Close modal after scheduling attempt
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Schedule with {doctor.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <p className="text-gray-600 mb-4">Speciality: {doctor.speciality}</p>
        
        {/* Simple Scheduling Form Placeholder */}
        <form onSubmit={handleSchedule}>
          <div className="mb-4">
            <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
            <input 
              type="date" 
              id="appointment-date" 
              name="appointment-date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
            <input 
              type="time" 
              id="appointment-time" 
              name="appointment-time"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
          <div className="flex justify-end space-x-3">
             <button
               type="button"
               onClick={onClose}
               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
             >
               Cancel
             </button>
             <button
               type="submit"
               className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
             >
               Request Appointment
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;