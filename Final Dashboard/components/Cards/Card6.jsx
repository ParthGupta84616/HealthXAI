import React, { useState, useRef, useEffect } from 'react';
// Removed ScheduleModal import

// Import Shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample Doctor Data with availability included
const doctors = [
  {
    id: 1,
    name: 'Dr. Evelyn Reed',
    speciality: 'Cardiology',
    avatarUrl: '/doctor1.jpeg',
    email: 'work.sanskarjain@gmail.com',
    availability: {
      // Map of days with available time slots
      'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Tuesday': ['10:00', '11:00', '14:00', '15:00', '16:00'],
      'Wednesday': ['09:00', '10:00', '11:00', '14:00'],
      'Thursday': ['11:00', '14:00', '15:00', '16:00'],
      'Friday': ['09:00', '10:00', '11:00', '14:00', '15:00']
    }
  },
  {
    id: 2,
    name: 'Dr. Marcus Chen',
    speciality: 'Neurology',
    avatarUrl: '/doctor2.jpeg',
    email: 'samarthshukla150604@gmail.com',
    availability: {
      'Monday': ['11:00', '13:00', '14:00', '16:00'],
      'Tuesday': ['09:00', '10:00', '13:00', '15:00'],
      'Wednesday': ['09:00', '11:00', '13:00', '16:00'],
      'Thursday': ['10:00', '14:00', '15:00'],
      'Friday': ['09:00', '11:00', '14:00', '16:00']
    }
  },
  {
    id: 3,
    name: 'Dr. Anya Sharma',
    speciality: 'Pediatrics',
    avatarUrl: '/doctor3.jpeg',
    email: 'anya.sharma@example.com',
    availability: {
      'Monday': ['09:00', '10:00', '14:00', '15:00'],
      'Tuesday': ['10:00', '11:00', '15:00', '16:00'],
      'Wednesday': ['09:00', '11:00', '14:00', '16:00'],
      'Thursday': ['10:00', '11:00', '15:00'],
      'Friday': ['09:00', '10:00', '14:00', '15:00']
    }
  },
  
];

const Card3 = () => {
    const [selectedDoctorForReport, setSelectedDoctorForReport] = useState(null);
    const fileInputRef = useRef(null);
    // Report Sending State
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState(null);
    const [sendSuccess, setSendSuccess] = useState(null);
    // Appointment Scheduling State
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleError, setScheduleError] = useState(null);
    const [scheduleSuccess, setScheduleSuccess] = useState(null);
    const [schedulingDoctorId, setSchedulingDoctorId] = useState(null);
    // Selected date and available time slots
    const [selectedDate, setSelectedDate] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    
    // Helper function to get available time slots for a given date and doctor
    const getAvailableTimeSlots = (date, doctor) => {
      if (!date || !doctor) return [];
      
      // Convert date string to Date object
      const dateObj = new Date(date);
      
      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const dayIndex = dateObj.getDay();
      
      // Map day index to day name
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[dayIndex];
      
      // Return available slots for that day (or empty array if none)
      return doctor.availability[dayName] || [];
    };
    
    // Update available time slots when date changes
    const handleDateChange = (e, doctor) => {
      const date = e.target.value;
      setSelectedDate(date);
      setSelectedTimeSlot('');
      
      // Get available slots for selected date
      const slots = getAvailableTimeSlots(date, doctor);
      setAvailableTimeSlots(slots);
    };

  // --- Handlers ---

  const handleSendReportClick = (doctor) => {
    // Clear previous messages when initiating a new send
    setSendError(null);
    setSendSuccess(null);
    setSelectedDoctorForReport(doctor);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedDoctorForReport) {
      console.log('No file selected or doctor not specified for report.');
      if(fileInputRef.current) fileInputRef.current.value = '';
      setSelectedDoctorForReport(null);
      return;
    }

    setIsSending(true); // Set sending state
    setSendError(null); // Clear previous errors
    setSendSuccess(null); // Clear previous success message

    console.log(`Uploading report "${file.name}" to send to ${selectedDoctorForReport.name} (${selectedDoctorForReport.email})...`);

    // --- Call the API Route ---
    const formData = new FormData();
    formData.append('reportFile', file); // Key must match API route (files.reportFile)
    formData.append('doctorEmail', selectedDoctorForReport.email);
    formData.append('doctorName', selectedDoctorForReport.name);
    // Add other data if needed, e.g., patient name
    // formData.append('patientName', 'Current User');

    try {
      const response = await fetch('/api/send-report', { // Your API endpoint
        method: 'POST',
        body: formData,
        // Headers are automatically set for FormData by fetch
      });

      const result = await response.json(); // Always parse JSON response

      if (!response.ok) {
         // Throw an error with the message from the API response
        throw new Error(result.message || `API Error: ${response.statusText}`);
      }

      console.log('API Response:', result);
      setSendSuccess(result.message || 'Report sent successfully!');

    } catch (error) {
      console.error('Failed to send report via API:', error);
      setSendError(`Failed to send report: ${error.message}`);
    } finally {
         // Reset file input value and state regardless of success/failure
         if(fileInputRef.current) fileInputRef.current.value = '';
         // Keep selectedDoctorForReport briefly to show 'Sending...' on the correct button
         // Clear it after a short delay or rely on the user clicking again
         // setSelectedDoctorForReport(null); // Decide when to clear this
         setIsSending(false); // Clear sending state
    }
    // --- End API Call ---
  };


  const handleScheduleSubmit = async (event, doctor) => {
    event.preventDefault();
    const form = event.target;
    const date = selectedDate;
    const time = selectedTimeSlot;
    
    // Validate that a time slot is selected
    if (!time) {
      setScheduleError("Please select an available time slot");
      return;
    }

    setIsScheduling(true);
    setScheduleError(null);
    setScheduleSuccess(null);
    setSchedulingDoctorId(doctor.id); // Track which popover is active

    console.log(`Requesting appointment with ${doctor.name} for ${date} at ${time}...`);

    try {
      const response = await fetch('/api/schedule-appointmentroute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorName: doctor.name,
          doctorEmail: doctor.email, // Send doctor's email to backend
          doctorSpeciality: doctor.speciality,
          appointmentDate: date,
          appointmentTime: time,
          // Add patient details if available/needed
          // patientName: 'Current User',
          // patientEmail: 'user@example.com' // For sending confirmation to user
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.statusText}`);
      }

      console.log('API Response (Schedule):', result);
      setScheduleSuccess(result.message || 'Appointment requested successfully!');
      // Reset form values after successful scheduling
      setSelectedDate('');
      setSelectedTimeSlot('');
      setAvailableTimeSlots([]);

    } catch (error) {
      console.error('Failed to schedule appointment via API:', error);
      setScheduleError(`Failed: ${error.message}`);
    } finally {
      setIsScheduling(false);
    }
  };


  // --- Render ---
  const cardHeight = "h-[500px]"; // Example fixed height

  return (
    <div
      className={`${cardHeight} flex flex-col rounded-2xl backdrop-blur-sm bg-transparent p-6 border border-gray-200 border-opacity-40 w-full`}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-2 flex-shrink-0"> {/* Reduced margin bottom */}
        Available Doctors
      </h2>

      {/* Display Sending/Success/Error Messages */}
      <div className="h-6 mb-2 flex-shrink-0">
        {/* Prioritize showing schedule messages if scheduling just happened */}
        {!isScheduling && isSending && <p className="text-sm text-blue-600 animate-pulse">Sending report...</p>}
        {!isScheduling && sendSuccess && <p className="text-sm text-green-600">{sendSuccess}</p>}
        {!isScheduling && sendError && <p className="text-sm text-red-600">{sendError}</p>}
        {/* Schedule messages could be shown here or inside the popover */}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.txt,.md"
      />

      {/* List of Doctors */}
      <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="flex items-center justify-between p-3 bg-transparent rounded-xl border border-gray-300 border-opacity-30"
          >
            {/* Left Side */}
            <div className="flex items-center space-x-3">
              <img
                src={doctor.avatarUrl}
                alt={`Avatar of ${doctor.name}`}
                className="h-12 w-12 rounded-full object-cover border border-gray-300"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{doctor.name}</p>
                <p className="text-xs text-gray-500">{doctor.speciality}</p>
              </div>
            </div>

            {/* Right Side: Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendReportClick(doctor)}
                title={`Send AI report to ${doctor.name}`}
                className="bg-white bg-opacity-50 border-gray-300 hover:bg-opacity-70"
                disabled={isSending} // Disable button while sending
              >
                {/* Show sending indicator only for the selected doctor */}
                {isSending && selectedDoctorForReport?.id === doctor.id ? 'Sending...' : 'Send Report'}
              </Button>

              {/* Schedule Popover */}
              <Popover onOpenChange={(open) => {
                  // Clear schedule messages and selected values when popover closes
                  if (!open) {
                      setScheduleSuccess(null);
                      setScheduleError(null);
                      setSchedulingDoctorId(null);
                      setSelectedDate('');
                      setSelectedTimeSlot('');
                      setAvailableTimeSlots([]);
                  }
              }}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    title={`Schedule appointment with ${doctor.name}`}
                    className="text-green-800 border-green-400 bg-white bg-opacity-50 hover:bg-green-50 hover:bg-opacity-70"
                    disabled={isSending || isScheduling} // Disable if sending or scheduling
                  >
                    Schedule
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  {/* Popover Content - Scheduling Form */}
                  <form onSubmit={(e) => handleScheduleSubmit(e, doctor)}> {/* Pass full doctor object */}
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Schedule Appointment</h4>
                        <p className="text-sm text-muted-foreground">
                          Request a time with {doctor.name} ({doctor.speciality}).
                        </p>
                      </div>
                      {/* Display Scheduling Feedback Inside Popover */}
                      <div className="h-5"> {/* Space for feedback */}
                        {isScheduling && schedulingDoctorId === doctor.id && <p className="text-xs text-blue-600 animate-pulse">Requesting...</p>}
                        {scheduleSuccess && schedulingDoctorId === doctor.id && <p className="text-xs text-green-600">{scheduleSuccess}</p>}
                        {scheduleError && schedulingDoctorId === doctor.id && <p className="text-xs text-red-600">{scheduleError}</p>}
                      </div>
                      <div className="grid gap-2">
                        {/* Date Input */}
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor={`appointment-date-${doctor.id}`}>Date</Label>
                          <Input
                            id={`appointment-date-${doctor.id}`}
                            name="appointment-date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e, doctor)}
                            required
                            className="col-span-2 h-8"
                            disabled={isScheduling} // Disable form during request
                            min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                          />
                        </div>
                        
                        {/* Time Slot Selection - Only visible when date is selected */}
                        {selectedDate && (
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor={`appointment-time-${doctor.id}`}>Time Slot</Label>
                            <div className="col-span-2">
                              {availableTimeSlots.length > 0 ? (
                                <Select 
                                  value={selectedTimeSlot} 
                                  onValueChange={setSelectedTimeSlot}
                                  disabled={isScheduling}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select a time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableTimeSlots.map((slot) => (
                                      <SelectItem key={slot} value={slot}>
                                        {slot}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <p className="text-xs text-amber-600">
                                  No available slots on this date
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        size="sm" 
                        disabled={isScheduling || !selectedDate || !selectedTimeSlot || availableTimeSlots.length === 0}
                      >
                        {isScheduling && schedulingDoctorId === doctor.id ? 'Requesting...' : 'Request Appointment'}
                      </Button>
                    </div>
                  </form>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Card3;