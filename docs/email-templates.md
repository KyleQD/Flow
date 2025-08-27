# 🎨 Tourify Email Templates

## Email Template Configuration Guide

### How to Update Supabase Email Templates

1. **Go to Supabase Dashboard** → **Authentication** → **Email Templates**
2. **Click on the template you want to edit**
3. **Replace the content with the templates below**
4. **Save the changes**

---

## 📧 Confirm Signup Email Template

**Subject:** `Welcome to Tourify! Confirm your email address`

**HTML Content:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Tourify</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .logo-icon {
            color: white;
            font-size: 24px;
        }
        h1 {
            color: #1e293b;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #64748b;
            font-size: 16px;
            margin: 0;
        }
        .content {
            margin-bottom: 40px;
        }
        .welcome-text {
            font-size: 18px;
            color: #334155;
            margin-bottom: 20px;
        }
        .description {
            color: #64748b;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .features {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 30px 0;
        }
        .features h3 {
            color: #1e293b;
            margin: 0 0 16px 0;
            font-size: 18px;
        }
        .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .feature-list li {
            padding: 8px 0;
            color: #64748b;
            position: relative;
            padding-left: 24px;
        }
        .feature-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            color: #94a3b8;
            font-size: 14px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #64748b;
            text-decoration: none;
        }
        .social-links a:hover {
            color: #8b5cf6;
        }
        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }
            h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="logo-icon">🎵</span>
            </div>
            <h1>Welcome to Tourify!</h1>
            <p class="subtitle">Connect. Create. Tour.</p>
        </div>

        <div class="content">
            <p class="welcome-text">Hi there! 👋</p>
            
            <p class="description">
                Thank you for joining Tourify! We're excited to have you as part of our community of artists, venues, and music professionals.
            </p>

            <p class="description">
                To get started, please confirm your email address by clicking the button below:
            </p>

            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Confirm Email Address
                </a>
            </div>

            <div class="features">
                <h3>What you can do with Tourify:</h3>
                <ul class="feature-list">
                    <li>Create and manage your artist or venue profile</li>
                    <li>Discover and book amazing venues and artists</li>
                    <li>Connect with industry professionals</li>
                    <li>Manage tours and events seamlessly</li>
                    <li>Access powerful analytics and insights</li>
                </ul>
            </div>

            <p class="description">
                If you didn't create an account with Tourify, you can safely ignore this email.
            </p>
        </div>

        <div class="footer">
            <p>© 2024 Tourify. All rights reserved.</p>
            <div class="social-links">
                <a href="https://twitter.com/tourify">Twitter</a>
                <a href="https://instagram.com/tourify">Instagram</a>
                <a href="https://linkedin.com/company/tourify">LinkedIn</a>
            </div>
            <p>
                Questions? Contact us at <a href="mailto:support@tourify.live" style="color: #8b5cf6;">support@tourify.live</a>
            </p>
        </div>
    </div>
</body>
</html>
```

**Text Content:**
```
Welcome to Tourify! 🎵

Hi there! 👋

Thank you for joining Tourify! We're excited to have you as part of our community of artists, venues, and music professionals.

To get started, please confirm your email address by clicking the link below:

{{ .ConfirmationURL }}

What you can do with Tourify:
✓ Create and manage your artist or venue profile
✓ Discover and book amazing venues and artists
✓ Connect with industry professionals
✓ Manage tours and events seamlessly
✓ Access powerful analytics and insights

If you didn't create an account with Tourify, you can safely ignore this email.

© 2024 Tourify. All rights reserved.
Questions? Contact us at support@tourify.live
```

---

## 🔑 Magic Link Email Template

**Subject:** `Sign in to Tourify`

**HTML Content:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to Tourify</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .logo-icon {
            color: white;
            font-size: 24px;
        }
        h1 {
            color: #1e293b;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #64748b;
            font-size: 16px;
            margin: 0;
        }
        .content {
            margin-bottom: 40px;
        }
        .welcome-text {
            font-size: 18px;
            color: #334155;
            margin-bottom: 20px;
        }
        .description {
            color: #64748b;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #92400e;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            color: #94a3b8;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="logo-icon">🎵</span>
            </div>
            <h1>Sign in to Tourify</h1>
            <p class="subtitle">Connect. Create. Tour.</p>
        </div>

        <div class="content">
            <p class="welcome-text">Hi there! 👋</p>
            
            <p class="description">
                You requested a magic link to sign in to your Tourify account. Click the button below to securely sign in:
            </p>

            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Sign in to Tourify
                </a>
            </div>

            <div class="security-note">
                <strong>🔒 Security Note:</strong> This link will expire in 1 hour and can only be used once. If you didn't request this link, please ignore this email.
            </div>

            <p class="description">
                If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #8b5cf6; font-family: monospace; font-size: 14px;">
                {{ .ConfirmationURL }}
            </p>
        </div>

        <div class="footer">
            <p>© 2024 Tourify. All rights reserved.</p>
            <p>
                Questions? Contact us at <a href="mailto:support@tourify.live" style="color: #8b5cf6;">support@tourify.live</a>
            </p>
        </div>
    </div>
</body>
</html>
```

---

## 🔄 Reset Password Email Template

**Subject:** `Reset your Tourify password`

**HTML Content:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Tourify</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .logo-icon {
            color: white;
            font-size: 24px;
        }
        h1 {
            color: #1e293b;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #64748b;
            font-size: 16px;
            margin: 0;
        }
        .content {
            margin-bottom: 40px;
        }
        .welcome-text {
            font-size: 18px;
            color: #334155;
            margin-bottom: 20px;
        }
        .description {
            color: #64748b;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #92400e;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            color: #94a3b8;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="logo-icon">🎵</span>
            </div>
            <h1>Reset Your Password</h1>
            <p class="subtitle">Connect. Create. Tour.</p>
        </div>

        <div class="content">
            <p class="welcome-text">Hi there! 👋</p>
            
            <p class="description">
                We received a request to reset the password for your Tourify account. Click the button below to create a new password:
            </p>

            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Reset Password
                </a>
            </div>

            <div class="security-note">
                <strong>🔒 Security Note:</strong> This link will expire in 1 hour and can only be used once. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>

            <p class="description">
                If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #8b5cf6; font-family: monospace; font-size: 14px;">
                {{ .ConfirmationURL }}
            </p>
        </div>

        <div class="footer">
            <p>© 2024 Tourify. All rights reserved.</p>
            <p>
                Questions? Contact us at <a href="mailto:support@tourify.live" style="color: #8b5cf6;">support@tourify.live</a>
            </p>
        </div>
    </div>
</body>
</html>
```

---

## 📧 Invite User Email Template

**Subject:** `You're invited to join Tourify!`

**HTML Content:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to Tourify</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .logo-icon {
            color: white;
            font-size: 24px;
        }
        h1 {
            color: #1e293b;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #64748b;
            font-size: 16px;
            margin: 0;
        }
        .content {
            margin-bottom: 40px;
        }
        .welcome-text {
            font-size: 18px;
            color: #334155;
            margin-bottom: 20px;
        }
        .description {
            color: #64748b;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .features {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 30px 0;
        }
        .features h3 {
            color: #1e293b;
            margin: 0 0 16px 0;
            font-size: 18px;
        }
        .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .feature-list li {
            padding: 8px 0;
            color: #64748b;
            position: relative;
            padding-left: 24px;
        }
        .feature-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            color: #94a3b8;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="logo-icon">🎵</span>
            </div>
            <h1>You're Invited!</h1>
            <p class="subtitle">Connect. Create. Tour.</p>
        </div>

        <div class="content">
            <p class="welcome-text">Hi there! 👋</p>
            
            <p class="description">
                You've been invited to join Tourify! We're excited to have you as part of our community of artists, venues, and music professionals.
            </p>

            <p class="description">
                Click the button below to accept your invitation and create your account:
            </p>

            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Accept Invitation
                </a>
            </div>

            <div class="features">
                <h3>What you can do with Tourify:</h3>
                <ul class="feature-list">
                    <li>Create and manage your artist or venue profile</li>
                    <li>Discover and book amazing venues and artists</li>
                    <li>Connect with industry professionals</li>
                    <li>Manage tours and events seamlessly</li>
                    <li>Access powerful analytics and insights</li>
                </ul>
            </div>

            <p class="description">
                If you didn't expect this invitation, you can safely ignore this email.
            </p>
        </div>

        <div class="footer">
            <p>© 2024 Tourify. All rights reserved.</p>
            <p>
                Questions? Contact us at <a href="mailto:support@tourify.live" style="color: #8b5cf6;">support@tourify.live</a>
            </p>
        </div>
    </div>
</body>
</html>
```

---

## 🔧 Additional Configuration

### SMTP Settings (Optional)

If you want to use a custom email provider instead of Supabase's default:

1. **Go to Authentication → Settings**
2. **Scroll to "SMTP Settings"**
3. **Configure your SMTP provider:**
   - **Host:** Your SMTP server
   - **Port:** Usually 587 or 465
   - **Username:** Your email username
   - **Password:** Your email password
   - **Sender Name:** "Tourify"
   - **Sender Email:** "noreply@tourify.live"

### Email Verification Settings

1. **Go to Authentication → Settings**
2. **Configure:**
   - **Enable email confirmations:** ✅ Enabled
   - **Secure email change:** ✅ Enabled
   - **Double confirm changes:** ✅ Enabled

### Rate Limiting

1. **Go to Authentication → Settings**
2. **Configure rate limiting:**
   - **Email rate limit:** 5 per hour (adjust as needed)
   - **SMS rate limit:** 5 per hour (if using SMS)

---

## 🎯 Benefits of Custom Email Templates

✅ **Brand Consistency** - Matches your Tourify branding
✅ **Professional Appearance** - Looks more trustworthy
✅ **Better User Experience** - Clear, welcoming messaging
✅ **Reduced Spam Complaints** - Professional emails are less likely to be marked as spam
✅ **Higher Engagement** - Users are more likely to click through

---

## 📝 Template Variables

Supabase provides these variables you can use in templates:

- `{{ .ConfirmationURL }}` - The confirmation/reset link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - The confirmation token
- `{{ .TokenHash }}` - Hashed version of the token
- `{{ .RedirectTo }}` - Redirect URL after confirmation

---

## 🚀 Next Steps

1. **Copy the HTML templates** above
2. **Go to Supabase Dashboard** → **Authentication** → **Email Templates**
3. **Update each template** with the Tourify-branded content
4. **Test the emails** by creating a new account
5. **Monitor email delivery** in the Supabase logs

The templates are designed to be responsive, professional, and on-brand with your Tourify platform!
