import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDb from "@/utils/ConnectDb"; // Updated to use shared utility

// MongoDB setup
const dbName = 'healthAgent';
const collectionName = 'appointments';

async function connectToDatabase() {
  try {
    const db = await connectDb(); // Use shared connection utility
    return db.collection(collectionName);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: process.env.EMAIL_SERVER_PORT == 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

async function verifyTransporter() {
  try {
    await transporter.verify();
    console.log("Nodemailer (Schedule) transporter verified successfully.");
    return true;
  } catch (verifyError) {
    console.error("Nodemailer (Schedule) transporter verification failed:", verifyError);
    return false;
  }
}

export async function POST(req) {
  console.log("API Route /api/schedule-appointment hit");

  try {
    const body = await req.json();
    console.log("Received schedule request body:", body);

    const {
      doctorId,
      doctorName,
      doctorEmail,
      doctorSpeciality,
      appointmentDate,
      appointmentTime,
      patientName = 'A Patient', // Default if not provided
    } = body;

    // Basic validation
    if (!doctorId || !doctorName || !doctorEmail || !appointmentDate || !appointmentTime) {
      console.error("Missing required scheduling information");
      return NextResponse.json({ success: false, message: 'Missing required fields (doctorId, doctor, date, time).' }, { status: 400 });
    }

    // Verify transporter before proceeding
    const isVerified = await verifyTransporter();
    if (!isVerified) {
      return NextResponse.json({ success: false, message: 'Email server configuration error.' }, { status: 500 });
    }

    // Connect to MongoDB
    const appointmentsCollection = await connectToDatabase();

    // Check if the slot is already booked
    const existingAppointment = await appointmentsCollection.findOne({
      doctorEmail,
      appointmentDate,
      appointmentTime,
    });

    if (existingAppointment) {
      console.error("Appointment slot already booked");
      return NextResponse.json({ success: false, message: 'This slot is already booked. Please choose another slot.' }, { status: 400 });
    }

    // Ensure doctorId is stored as a string
    const newAppointment = {
      doctorId: String(doctorId), // Convert to string for consistent querying
      doctorName,
      doctorEmail,
      doctorSpeciality,
      appointmentDate,
      appointmentTime,
      patientName,
      createdAt: new Date(),
    };

    await appointmentsCollection.insertOne(newAppointment);
    console.log("Appointment saved to database:", newAppointment);

    // --- Email to Doctor ---
    const mailOptionsDoctor = {
      from: `"${patientName} via Health Agent" <${process.env.EMAIL_FROM}>`,
      to: doctorEmail,
      subject: `Appointment Request: ${patientName} - ${appointmentDate}`,
      text: `Dear Dr. ${doctorName.split(' ').pop()},\n\nA patient, ${patientName}, has requested an appointment.\n\nSpeciality: ${doctorSpeciality || 'N/A'}\nRequested Date: ${appointmentDate}\nRequested Time: ${appointmentTime}\n\nPlease contact the patient or use your scheduling system to confirm or propose an alternative.\n\nBest regards,\nHealth Agent System`,
      html: `<h4>Appointment Request</h4>
             <p>Dear Dr. ${doctorName.split(' ').pop()},</p>
             <p>A patient, <strong>${patientName}</strong>, has requested an appointment.</p>
             <ul>
               <li><strong>Speciality:</strong> ${doctorSpeciality || 'N/A'}</li>
               <li><strong>Requested Date:</strong> ${appointmentDate}</li>
               <li><strong>Requested Time:</strong> ${appointmentTime}</li>
             </ul>
             <p>Please contact the patient or use your scheduling system to confirm or propose an alternative.</p>
             <p>Best regards,<br/>Health Agent System</p>`,
    };

    console.log(`Attempting to send appointment request email to ${doctorEmail}...`);
    const infoDoctor = await transporter.sendMail(mailOptionsDoctor);
    console.log('Appointment request email sent to doctor:', infoDoctor.messageId);

    return NextResponse.json({ success: true, message: 'Appointment requested and saved!' });

  } catch (error) {
    console.error('Error in /api/schedule-appointment:', error);
    return NextResponse.json({ success: false, message: `Failed to request appointment: ${error.message}` }, { status: 500 });
  }
}

export async function GET(req) {
  console.log("API Route /api/schedule-appointment (GET) hit");

  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      console.error("Missing doctor ID in request");
      return NextResponse.json({ success: false, message: 'Missing doctor ID.' }, { status: 400 });
    }

    // Connect to MongoDB
    const appointmentsCollection = await connectToDatabase();

    // Fetch booked slots for the doctor
    const bookedSlots = await appointmentsCollection
      .find({ doctorId: String(doctorId) }) // Ensure doctorId is queried as a string
      .project({ _id: 0, appointmentDate: 1, appointmentTime: 1 })
      .toArray();

    console.log(`Booked slots for doctor ID ${doctorId}:`, bookedSlots);

    return NextResponse.json({ success: true, bookedSlots });

  } catch (error) {
    console.error('Error in /api/schedule-appointment (GET):', error);
    return NextResponse.json({ success: true, bookedSlots });

  } 
}