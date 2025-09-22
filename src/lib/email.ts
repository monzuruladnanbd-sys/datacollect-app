import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Create transporter based on environment
function createTransporter() {
  // For development/testing, you can use a service like Gmail or a test service
  // For production, use a proper email service like SendGrid, Mailgun, etc.
  
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
  };

  return nodemailer.createTransport(config);
}

// Email templates
const emailTemplates = {
  welcome: (name: string, email: string) => ({
    subject: 'Welcome to WB-S Data Collection System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to WB-S Data Collection System!</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your account has been successfully created with the following details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Role:</strong> Data Submitter</p>
          <p><strong>Account Status:</strong> Active</p>
        </div>
        <p>You can now log in to the system and start submitting data for review and approval.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If you have any questions or need assistance, please contact your system administrator.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px;">
          This is an automated message from the WB-S Data Collection System.
        </p>
      </div>
    `,
    text: `
Welcome to WB-S Data Collection System!

Dear ${name},

Your account has been successfully created with the following details:
- Email: ${email}
- Role: Data Submitter
- Account Status: Active

You can now log in to the system and start submitting data for review and approval.

Login at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login

If you have any questions or need assistance, please contact your system administrator.

This is an automated message from the WB-S Data Collection System.
    `
  }),
};

// Send welcome email
export async function sendWelcomeEmail(name: string, email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email configuration not found. Email would be sent to:', email);
      return { 
        success: true, 
        message: 'Email configuration not set up. Check console for simulation.' 
      };
    }

    const transporter = createTransporter();
    const template = emailTemplates.welcome(name, email);

    const mailOptions = {
      from: {
        name: 'WB-S Data Collection System',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@wb-s.com'
      },
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    
    return { 
      success: true, 
      message: 'Welcome email sent successfully!' 
    };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { 
      success: false, 
      message: 'Failed to send welcome email. Please check email configuration.' 
    };
  }
}

// Send notification email to admin about new user registration
export async function sendAdminNotification(userName: string, userEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Admin notification email would be sent about new user:', userEmail);
      return { success: true, message: 'Admin notification simulated.' };
    }

    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    const mailOptions = {
      from: {
        name: 'WB-S Data Collection System',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@wb-s.com'
      },
      to: adminEmail,
      subject: 'New User Registration - WB-S System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">New User Registration</h2>
          <p>A new user has registered in the WB-S Data Collection System:</p>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Role:</strong> Data Submitter</p>
            <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Please review the new user account and take any necessary actions.</p>
        </div>
      `,
      text: `
New User Registration - WB-S System

A new user has registered:
- Name: ${userName}
- Email: ${userEmail}
- Role: Data Submitter
- Registration Time: ${new Date().toLocaleString()}

Please review the new user account and take any necessary actions.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification sent successfully:', info.messageId);
    
    return { 
      success: true, 
      message: 'Admin notification sent successfully!' 
    };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { 
      success: false, 
      message: 'Failed to send admin notification.' 
    };
  }
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { 
        success: false, 
        message: 'Email configuration missing. Please set EMAIL_USER and EMAIL_PASS environment variables.' 
      };
    }

    const transporter = createTransporter();
    await transporter.verify();
    
    return { 
      success: true, 
      message: 'Email configuration verified successfully!' 
    };
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return { 
      success: false, 
      message: 'Email configuration verification failed. Please check your settings.' 
    };
  }
}
