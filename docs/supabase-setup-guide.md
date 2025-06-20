# Supabase Authentication Setup Guide

This guide walks you through configuring your Supabase project for production-ready authentication.

## 🏗️ Step 1: Supabase Project Domain Configuration

### 1.1 Site URL Configuration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication > Settings**
4. Configure the following URLs:

**Site URL:**
```
https://yourdomain.com
```
*For development:*
```
http://localhost:3000
```

**Additional Redirect URLs:**
```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
http://localhost:3000/auth/verification
https://yourdomain.com/auth/verification
```

### 1.2 JWT Settings
- **JWT expiry:** 3600 (1 hour)
- **Refresh token rotation:** Enabled
- **Reuse interval:** 10 seconds

## 📧 Step 2: Email Template Configuration

### 2.1 Access Email Templates
1. In Supabase Dashboard → **Authentication > Email Templates**
2. Configure each template below:

### 2.2 Confirm Signup Template

**Subject:**
```
Welcome to Tourify - Confirm Your Email
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Tourify</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; }
        .logo { font-size: 32px; font-weight: 800; color: white; margin: 0; }
        .subtitle { color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .welcome { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0 0 16px 0; }
        .message { color: #cbd5e1; line-height: 1.6; margin: 0 0 32px 0; font-size: 16px; }
        .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4); transition: all 0.2s; }
        .button:hover { transform: translateY(-2px); box-shadow: 0 15px 35px -5px rgba(139, 92, 246, 0.6); }
        .footer { padding: 30px; text-align: center; border-top: 1px solid #334155; }
        .footer-text { color: #64748b; font-size: 14px; margin: 0; }
        .link { color: #8b5cf6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">🎵 Tourify</h1>
            <p class="subtitle">Connect. Create. Tour.</p>
        </div>
        <div class="content">
            <h2 class="welcome">Welcome to the Music Community!</h2>
            <p class="message">
                Thanks for joining Tourify! We're excited to have you as part of our creative community. 
                To get started, please confirm your email address by clicking the button below.
            </p>
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    Confirm Your Email
                </a>
            </div>
        </div>
        <div class="footer">
            <p class="footer-text">
                If you didn't create an account, you can safely ignore this email.<br>
                Need help? Contact us at <a href="mailto:support@tourify.com" class="link">support@tourify.com</a>
            </p>
        </div>
    </div>
</body>
</html>
```

### 2.3 Reset Password Template

**Subject:**
```
Reset Your Tourify Password
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Tourify</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 40px 30px; text-align: center; }
        .logo { font-size: 32px; font-weight: 800; color: white; margin: 0; }
        .subtitle { color: #fee2e2; margin: 8px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0 0 16px 0; }
        .message { color: #cbd5e1; line-height: 1.6; margin: 0 0 32px 0; font-size: 16px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4); }
        .footer { padding: 30px; text-align: center; border-top: 1px solid #334155; }
        .footer-text { color: #64748b; font-size: 14px; margin: 0; }
        .link { color: #ef4444; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">🔐 Tourify</h1>
            <p class="subtitle">Password Reset Request</p>
        </div>
        <div class="content">
            <h2 class="title">Reset Your Password</h2>
            <p class="message">
                We received a request to reset your password. If you made this request, 
                click the button below to create a new password. This link will expire in 1 hour.
            </p>
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    Reset Password
                </a>
            </div>
        </div>
        <div class="footer">
            <p class="footer-text">
                If you didn't request this, you can safely ignore this email.<br>
                For security questions, contact <a href="mailto:security@tourify.com" class="link">security@tourify.com</a>
            </p>
        </div>
    </div>
</body>
</html>
```

### 2.4 Magic Link Template

**Subject:**
```
Your Tourify Sign-In Link
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In to Tourify</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
        .logo { font-size: 32px; font-weight: 800; color: white; margin: 0; }
        .subtitle { color: #d1fae5; margin: 8px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0 0 16px 0; }
        .message { color: #cbd5e1; line-height: 1.6; margin: 0 0 32px 0; font-size: 16px; }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); }
        .footer { padding: 30px; text-align: center; border-top: 1px solid #334155; }
        .footer-text { color: #64748b; font-size: 14px; margin: 0; }
        .link { color: #10b981; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">✨ Tourify</h1>
            <p class="subtitle">Magic Sign-In Link</p>
        </div>
        <div class="content">
            <h2 class="title">Sign In Securely</h2>
            <p class="message">
                Click the button below to sign in to your Tourify account. 
                This link will expire in 5 minutes for your security.
            </p>
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    Sign In to Tourify
                </a>
            </div>
        </div>
        <div class="footer">
            <p class="footer-text">
                If you didn't request this link, you can safely ignore this email.<br>
                Questions? Reach out at <a href="mailto:support@tourify.com" class="link">support@tourify.com</a>
            </p>
        </div>
    </div>
</body>
</html>
```

## 📮 Step 3: SMTP Configuration

### 3.1 SMTP Settings (Recommended: Resend)

1. Sign up for [Resend](https://resend.com) (great for developers)
2. Get your API key
3. In Supabase Dashboard → **Settings > Auth**
4. Scroll to **SMTP Settings**
5. Configure:

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP Username: resend
SMTP Password: [Your Resend API Key]
Sender Email: noreply@yourdomain.com
Sender Name: Tourify
```

### 3.2 Alternative SMTP Providers

**SendGrid:**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
```

**Mailgun:**
```
Host: smtp.mailgun.org
Port: 587
Username: [Your Mailgun SMTP Username]
Password: [Your Mailgun SMTP Password]
```

## 🔒 Step 4: Security Settings

### 4.1 Rate Limiting
- **Email OTP requests:** 60 per hour
- **SMS OTP requests:** 20 per hour
- **Password reset requests:** 5 per hour

### 4.2 Session Configuration
- **JWT expiry:** 3600 seconds (1 hour)
- **Refresh token expiry:** 2592000 seconds (30 days)
- **Enable refresh token rotation:** Yes

### 4.3 Additional Security
- **Enable email confirmations:** Yes
- **Enable phone confirmations:** Optional
- **Secure email change:** Yes
- **Double confirm email changes:** Yes

## ✅ Step 5: Testing Checklist

After configuration, test these flows:

### 5.1 Sign Up Flow
- [ ] New user registration
- [ ] Email confirmation received
- [ ] Email confirmation link works
- [ ] Redirects to onboarding

### 5.2 Sign In Flow
- [ ] Existing user login
- [ ] Correct dashboard redirect
- [ ] Remember me functionality
- [ ] Auto-logout after JWT expiry

### 5.3 Password Reset Flow
- [ ] Request password reset
- [ ] Email received with reset link
- [ ] Reset link works correctly
- [ ] New password saves successfully

### 5.4 Protected Routes
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users can access protected pages
- [ ] Session persistence across browser tabs
- [ ] Proper logout functionality

## 🚨 Production Checklist

Before going live:

- [ ] Domain configured correctly
- [ ] SMTP working and tested
- [ ] All email templates customized
- [ ] Rate limiting configured
- [ ] Security settings enabled
- [ ] Database backups enabled
- [ ] SSL certificates active
- [ ] Error monitoring set up

## 📞 Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Verify environment variables
3. Test with development vs production URLs
4. Check email spam folders during testing

## 🔧 Advanced Configuration

For production environments, consider:
- Custom domain for emails
- Email analytics and tracking
- Advanced rate limiting
- IP allowlisting
- Webhook configurations
- Audit logging 