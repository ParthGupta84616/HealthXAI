import User from '@/models/userModel';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendMail = async ({ email, emailType, userId }: { email: string, emailType: string, userId: string }) => {
  try {
    const hashedToken = await bcrypt.hash(userId.toString(), 10);

    if (emailType === 'VERIFY') {
      await User.findByIdAndUpdate(
        userId, {
          $set: {
            verificationToken: hashedToken,
            verificationTokenExpire: Date.now() + 3600000
          },
        }
      );
    } else if (emailType === 'RESET') {
      await User.findByIdAndUpdate(
        userId, {
          $set: {
            resetPasswordToken: hashedToken,
            resetPasswordTokenExpire: Date.now() + 3600000
          },
        }
      );
    }

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: emailType === 'VERIFY' ? 'Verify your email' : 'Reset your password',
      html: emailType === 'VERIFY' ? `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to verify your email or copy and paste the link below in your browser<br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}</p>` :
        `<p>Click <a href="${process.env.DOMAIN}/resetpassword?token=${hashedToken}">here</a> to reset your password or copy and paste the link below in your browser<br> ${process.env.DOMAIN}/resetpassword?token=${hashedToken}</p>`
    };

    return await transport.sendMail(mailOptions);

  } catch (error: any) {
    throw new Error(error.message);
  }
};
