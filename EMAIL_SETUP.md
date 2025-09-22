# Email Configuration Setup

Your application now supports sending welcome emails to new users! Here's how to configure it:

## Quick Setup

1. **Create `.env.local` file** in your project root (if it doesn't exist)

2. **Add email configuration** to `.env.local`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@yourdomain.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Gmail Setup (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `EMAIL_PASS` (not your regular password)

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Custom SMTP
Check your email provider's SMTP settings.

## Testing Without Email (Development)

If you don't set up email configuration, the system will:
- Log email content to console
- Still show "registration successful" 
- Work normally but without actual emails

## Features Added

✅ **Welcome Email** - Sent to new users after registration
✅ **Admin Notification** - Notifies admin about new user registrations  
✅ **Professional Templates** - HTML and text email templates
✅ **Error Handling** - Graceful fallback if email fails
✅ **Environment Configuration** - Easy setup via environment variables

## After Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test registration** - Register a new user and check:
   - User's email inbox for welcome message
   - Admin email for notification
   - Console logs for any errors

## Troubleshooting

- **"Invalid login"** - Check app password, not regular password
- **"Connection timeout"** - Check EMAIL_HOST and EMAIL_PORT
- **"Authentication failed"** - Verify EMAIL_USER and EMAIL_PASS
- **No email received** - Check spam folder, verify email address

The registration will still work even if email fails - users just won't receive the welcome email.
