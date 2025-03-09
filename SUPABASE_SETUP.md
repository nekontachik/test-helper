# Supabase Setup Guide

This guide will help you set up Supabase for authentication in this project.

## Step 1: Create a Supabase Account

1. Go to [Supabase](https://supabase.com/) and sign up for an account if you don't have one already.
2. Once logged in, click on "New Project" to create a new project.

## Step 2: Create a New Project

1. Give your project a name.
2. Set a secure database password (save this for future reference).
3. Choose a region closest to your users.
4. Click "Create new project".

## Step 3: Get Your API Keys

1. Once your project is created, go to the project dashboard.
2. In the left sidebar, click on "Project Settings" (the gear icon).
3. Click on "API" in the settings menu.
4. You'll see two important values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 4: Update Your Environment Variables

1. Open the `.env.local` file in your project.
2. Replace the placeholder values with your actual Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to "Authentication" in the left sidebar.
2. Under "Providers", enable "Email" authentication.
3. Configure your email provider settings:
   - You can use the default settings for development.
   - For production, you might want to set up a custom SMTP server.

## Step 6: Test Your Authentication

1. Run your application with `npm run dev`.
2. Try to sign up with a test email.
3. Check your Supabase dashboard under "Authentication" > "Users" to see if the user was created.

## Additional Configuration (Optional)

### Custom Email Templates

1. In the Supabase dashboard, go to "Authentication" > "Email Templates".
2. Customize the email templates for:
   - Confirmation emails
   - Magic link emails
   - Reset password emails

### Social Providers

1. In the Supabase dashboard, go to "Authentication" > "Providers".
2. Enable and configure any social providers you want to use (Google, GitHub, etc.).
3. Follow the provider-specific instructions to set up OAuth credentials.

### Security Settings

1. In the Supabase dashboard, go to "Authentication" > "Settings".
2. Configure security settings like:
   - Session duration
   - Rate limiting
   - Email confirmation requirements

## Troubleshooting

- If you're having issues with authentication, check the browser console for errors.
- Verify that your environment variables are correctly set.
- Make sure your Supabase project is on the free tier or has billing enabled if you're exceeding free tier limits.
- Check the Supabase logs in the dashboard under "Database" > "Logs" for any backend errors. 