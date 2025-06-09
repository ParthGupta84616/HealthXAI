import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// --- Nodemailer Transporter Setup (reuse or define here) ---
// It's often better to put this in a shared utility file
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
      doctorName,
      doctorEmail,
      doctorSpeciality,
      appointmentDate,
      appointmentTime,
      patientName = 'A Patient', // Default if not provided
      // patientEmail // Add if you want to send confirmation to patient
    } = body;

    // Basic validation
    if (!doctorName || !doctorEmail || !appointmentDate || !appointmentTime) {
      console.error("Missing required scheduling information");
      return NextResponse.json({ success: false, message: 'Missing required fields (doctor, date, time).' }, { status: 400 });
    }

    // Verify transporter before proceeding
    const isVerified = await verifyTransporter();
    if (!isVerified) {
         return NextResponse.json({ success: false, message: 'Email server configuration error.' }, { status: 500 });
    }

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

    // --- (Optional) Email to Patient ---
    // let mailOptionsPatient;
    // if (patientEmail) {
    //   mailOptionsPatient = {
    //     from: `"Health Agent System" <${process.env.EMAIL_FROM}>`,
    //     to: patientEmail,
    //     subject: `Appointment Request Sent to Dr. ${doctorName}`,
    //     text: `Dear ${patientName},\n\nYour appointment request for Dr. ${doctorName} (${doctorSpeciality || 'N/A'}) on ${appointmentDate} at ${appointmentTime} has been sent.\n\nThe doctor's office will contact you regarding confirmation.\n\nBest regards,\nHealth Agent System`,
    //     html: `<h4>Appointment Request Sent</h4>
    //            <p>Dear ${patientName},</p>
    //            <p>Your appointment request for <strong>Dr. ${doctorName}</strong> (${doctorSpeciality || 'N/A'}) on <strong>${appointmentDate}</strong> at <strong>${appointmentTime}</strong> has been sent.</p>
    //            <p>The doctor's office will contact you regarding confirmation.</p>
    //            <p>Best regards,<br/>Health Agent System</p>`,
    //   };
    // }

    // --- Send Mail(s) ---
    console.log(`Attempting to send appointment request email to ${doctorEmail}...`);
    const infoDoctor = await transporter.sendMail(mailOptionsDoctor);
    console.log('Appointment request email sent to doctor:', infoDoctor.messageId);

    // if (mailOptionsPatient) {
    //   console.log(`Attempting to send confirmation email to ${patientEmail}...`);
    //   const infoPatient = await transporter.sendMail(mailOptionsPatient);
    //   console.log('Appointment confirmation email sent to patient:', infoPatient.messageId);
    // }

    return NextResponse.json({ success: true, message: 'Appointment requested!' });

  } catch (error) {
    console.error('Error in /api/schedule-appointment:', error);
    return NextResponse.json({ success: false, message: `Failed to request appointment: ${error.message}` }, { status: 500 });
  }
}