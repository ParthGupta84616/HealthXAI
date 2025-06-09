import React, { useState, useRef, useEffect } from 'react';
// Removed ScheduleModal import

// Import Shadcn components
import { Button } from "@/components/ui/button"; // Assuming shadcn button path
import { Input } from "@/components/ui/input";   // Assuming shadcn input path
import { Label } from "@/components/ui/label";   // Assuming shadcn label path
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Assuming shadcn popover path

// Sample Doctor Data (replace with actual data source/prop)
const doctors = [
  {
    id: 1,
    name: 'Dr. Evelyn Reed',
    speciality: 'Cardiology',
    avatarUrl: '/doctor1.jpeg', // Placeholder image URL
    email: 'work.sanskarjain@gmail.com', // For sending report
  },
  {
    id: 2,
    name: 'Dr. Marcus Chen',
    speciality: 'Neurology',
    avatarUrl: '/doctor2.jpeg', // Placeholder image URL
    email: 'marcus.chen@example.com',
  },
  {
    id: 3,
    name: 'Dr. Anya Sharma',
    speciality: 'Pediatrics',
    avatarUrl: '/doctor3.jpeg', // Placeholder image URL
    email: 'anya.sharma@example.com',
  },

];

const generateTimeSlots = (start, end, interval) => {
  const slots = [];
  let current = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  while (current <= endTime) {
    slots.push(current.toTimeString().slice(0, 5)); // Format as HH:mm
    current.setMinutes(current.getMinutes() + interval);
  }

  return slots;
};

const timeSlots = generateTimeSlots("11:00", "19:00", 30); // Generate 30-minute slots from 11:00 AM to 7:00 PM

const Card3 = () => {
  const [selectedDoctorForReport, setSelectedDoctorForReport] = useState(null);
  const fileInputRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [schedulingDoctorId, setSchedulingDoctorId] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(null);

  const fetchBookedSlots = async (doctorId, selectedDate) => {
    try {
      const response = await fetch(`/api/schedule-appointment?doctorId=${doctorId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to fetch booked slots.`);
      }

      console.log(`Booked slots for doctor ID ${doctorId}:`, result.bookedSlots);

      // Filter booked slots for the selected date
      const bookedForDate = result.bookedSlots
        .filter((slot) => slot.appointmentDate === selectedDate)
        .map((slot) => slot.appointmentTime);

      setBookedSlots(bookedForDate);
      setAvailableSlots(timeSlots.filter((slot) => !bookedForDate.includes(slot)));
    } catch (error) {
      console.error(`Error fetching booked slots for doctor ID ${doctorId}:`, error);
      setBookedSlots([]);
      setAvailableSlots(timeSlots); // Fallback to all slots if fetch fails
    }
  };

  const handleDateChange = (doctorId, selectedDate) => {
    if (selectedDate) {
      fetchBookedSlots(doctorId, selectedDate); // Fetch booked slots for the selected date
    } else {
      setAvailableSlots(timeSlots); // Reset to all slots if no date is selected
    }
  };

  const handleSendReportClick = (doctor) => {
    setSendError(null);
    setSendSuccess(null);
    setSelectedDoctorForReport(doctor);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedDoctorForReport) {
      console.log('No file selected or doctor not specified for report.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedDoctorForReport(null);
      return;
    }

    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);

    console.log(`Uploading report "${file.name}" to send to ${selectedDoctorForReport.name} (${selectedDoctorForReport.email})...`);

    const formData = new FormData();
    formData.append('reportFile', file);
    formData.append('doctorEmail', selectedDoctorForReport.email);
    formData.append('doctorName', selectedDoctorForReport.name);

    try {
      const response = await fetch('/api/send-report', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.statusText}`);
      }

      console.log('API Response:', result);
      setSendSuccess(result.message || 'Report sent successfully!');
    } catch (error) {
      console.error('Failed to send report via API:', error);
      setSendError(`Failed to send report: ${error.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsSending(false);
    }
  };

  const handleScheduleButtonClick = (doctorId) => {
    setScheduleSuccess(null);
    setScheduleError(null);
    setSchedulingDoctorId(doctorId);
    setAvailableSlots(timeSlots); // Reset slots when opening
  };

  const handleScheduleSubmit = async (event, doctor) => {
    event.preventDefault();
    const form = event.target;
    const date = form.elements['appointment-date'].value;
    const time = form.elements['appointment-time'].value;

    setIsScheduling(true);
    setScheduleError(null);
    setScheduleSuccess(null);

    console.log(`Requesting appointment with ${doctor.name} for ${date} at ${time}...`);

    try {
      const response = await fetch('/api/schedule-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorEmail: doctor.email,
          doctorSpeciality: doctor.speciality,
          appointmentDate: date,
          appointmentTime: time,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.statusText}`);
      }

      console.log('API Response (Schedule):', result);
      setScheduleSuccess(result.message || 'Appointment requested successfully!');
    } catch (error) {
      console.error('Failed to schedule appointment via API:', error);
      setScheduleError(`Failed: ${error.message}`);
    } finally {
      setIsScheduling(false);
    }
  };

  const cardHeight = "h-auto";

  return (
    <div
      className={`${cardHeight} flex flex-col rounded-2xl backdrop-blur-sm bg-transparent p-6 border border-gray-200 border-opacity-40 w-full`}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-2 flex-shrink-0">
        Available Doctors
      </h2>

      <div className="h-6 mb-2 flex-shrink-0">
        {!isScheduling && isSending && <p className="text-sm text-blue-600 animate-pulse">Sending report...</p>}
        {!isScheduling && sendSuccess && <p className="text-sm text-green-600">{sendSuccess}</p>}
        {!isScheduling && sendError && <p className="text-sm text-red-600">{sendError}</p>}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.txt,.md"
      />

      <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="flex items-center justify-between p-3 bg-transparent rounded-xl border border-gray-300 border-opacity-30"
          >
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

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendReportClick(doctor)}
                title={`Send AI report to ${doctor.name}`}
                className="bg-white bg-opacity-50 border-gray-300 hover:bg-opacity-70"
                disabled={isSending}
              >
                {isSending && selectedDoctorForReport?.id === doctor.id ? 'Sending...' : 'Send Report'}
              </Button>

              <Popover
                onOpenChange={(open) => {
                  if (!open) {
                    setScheduleSuccess(null);
                    setScheduleError(null);
                    setSchedulingDoctorId(null);
                  } else {
                    handleScheduleButtonClick(doctor.id);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    title={`Schedule appointment with ${doctor.name}`}
                    className="text-green-800 border-green-400 bg-white bg-opacity-50 hover:bg-green-50 hover:bg-opacity-70"
                    disabled={isScheduling}
                  >
                    Schedule
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <form onSubmit={(e) => handleScheduleSubmit(e, doctor)}>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Schedule Appointment</h4>
                        <p className="text-sm text-muted-foreground">
                          Request a time with {doctor.name} ({doctor.speciality}).
                        </p>
                      </div>
                      <div className="h-5">
                        {isScheduling && schedulingDoctorId === doctor.id && <p className="text-xs text-blue-600 animate-pulse">Requesting...</p>}
                        {scheduleSuccess && schedulingDoctorId === doctor.id && <p className="text-xs text-green-600">{scheduleSuccess}</p>}
                        {scheduleError && schedulingDoctorId === doctor.id && <p className="text-xs text-red-600">{scheduleError}</p>}
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor={`appointment-date-${doctor.id}`}>Date</Label>
                          <Input
                            id={`appointment-date-${doctor.id}`}
                            name="appointment-date"
                            type="date"
                            required
                            className="col-span-2 h-8"
                            disabled={isScheduling}
                            onChange={(e) => handleDateChange(doctor.id, e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor={`appointment-time-${doctor.id}`}>Time</Label>
                          <select
                            id={`appointment-time-${doctor.id}`}
                            name="appointment-time"
                            required
                            className="col-span-2 h-8 border border-gray-300 rounded-md"
                            disabled={isScheduling || availableSlots.length === 0}
                          >
                            <option value="" disabled selected>
                              {availableSlots.length > 0 ? 'Select a time' : 'No slots available'}
                            </option>
                            {availableSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Button type="submit" size="sm" disabled={isScheduling || availableSlots.length === 0}>
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