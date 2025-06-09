import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
// Remove Writable and formidable imports if no longer needed elsewhere
// import { Writable } from 'stream';
// import formidable from 'formidable';

// Remove the config export, bodyParser is handled differently or not needed with formData()
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// Remove the parseForm helper function
// const parseForm = ...

export async function POST(req) {
  console.log("API Route /api/send-report hit");

  try {
    // Use req.formData() to parse the multipart/form-data
    const formData = await req.formData();
    console.log("FormData received");

    // Extract fields and file from FormData
    const doctorEmail = formData.get('doctorEmail');
    const doctorName = formData.get('doctorName');
    const patientName = formData.get('patientName') || 'Patient'; // Get optional patient name
    const reportFile = formData.get('reportFile'); // This will be a File object

    console.log("Extracted data:", { doctorEmail, doctorName, patientName, reportFile });


    if (!doctorEmail || !doctorName) {
      console.error("Missing doctor email or name");
      return NextResponse.json({ success: false, message: 'Missing doctor email or name.' }, { status: 400 });
    }
    // Check if reportFile exists and is a File object
    if (!reportFile || typeof reportFile === 'string' || !reportFile.name) {
      console.error("Missing or invalid report file");
      return NextResponse.json({ success: false, message: 'Report file is missing or invalid.' }, { status: 400 });
    }

    console.log(`Sending report to ${doctorName} (${doctorEmail})`);
    console.log("File details:", { name: reportFile.name, type: reportFile.type, size: reportFile.size });

    // --- Read file content into a buffer ---
    // Nodemailer needs the file content, often as a buffer
    const fileBuffer = Buffer.from(await reportFile.arrayBuffer());

    // --- Nodemailer Setup ---
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: process.env.EMAIL_SERVER_PORT == 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Verify transporter connection
    try {
        await transporter.verify();
        console.log("Nodemailer transporter verified successfully.");
    } catch (verifyError) {
        console.error("Nodemailer transporter verification failed:", verifyError);
        return NextResponse.json({ success: false, message: 'Email server configuration error.' }, { status: 500 });
    }

    // --- Email Options ---
    const mailOptions = {
      from: `"${patientName} via Health Agent" <${process.env.EMAIL_FROM}>`,
      to: doctorEmail,
      subject: `Consultation Report for ${patientName}`,
      text: `Dear Dr. ${doctorName.split(' ').pop()},\n\nPlease find the consultation report attached for ${patientName}.\n\nBest regards,\nHealth Agent`,
      html: `<p>Dear Dr. ${doctorName.split(' ').pop()},</p><p>Please find the consultation report attached for ${patientName}.</p><p>Best regards,<br/>Health Agent</p>`,
      attachments: [
        {
          filename: reportFile.name, // Use the actual filename
          content: fileBuffer,      // Attach the file content buffer
          contentType: reportFile.type || 'application/octet-stream', // Use the actual content type
        },
      ],
    };

    // --- Send Mail ---
    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({ success: true, message: 'Report sent successfully!' });

  } catch (error) {
    console.error('Error in /api/send-report:', error);
    // Handle potential errors during formData parsing or file reading
    return NextResponse.json({ success: false, message: `Failed to process request: ${error.message}` }, { status: 500 });
  }
}