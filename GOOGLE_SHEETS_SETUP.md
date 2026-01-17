# Google Sheets Integration Setup Guide

This guide will help you connect the Fitness 15 Admin Dashboard to Google Sheets for storing member data.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Fitness 15 Members" (or any name you prefer)
4. The first sheet will automatically be named "Sheet1" - rename it to **"Members"** (or update the `SHEET_NAME` constant in the Google Apps Script code)

## Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions** > **Apps Script**
2. Delete any default code in the editor
3. Copy the entire code from `GOOGLE_APPS_SCRIPT_CODE.js`
4. Paste it into the Apps Script editor
5. Update the `SHEET_NAME` constant if your sheet has a different name (default is "Members")

## Step 3: Deploy as Web App

1. In the Apps Script editor, click **Deploy** > **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Fitness 15 Member Form Handler" (optional)
   - **Execute as**: Select **Me** (your email)
   - **Who has access**: Select **Anyone** (or "Anyone with Google account" for more security)
5. Click **Deploy**
6. You'll be prompted to authorize the script:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** > **Go to Fitness 15 (unsafe)** (this is safe, it's your own script)
   - Click **Allow** to grant permissions
7. Copy the **Web App URL** that appears (it will look like: `https://script.google.com/macros/s/...`)

## Step 4: Connect to Your React App

1. Open `gym-admin/src/components/AddMemberForm.jsx`
2. Find the line: `const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE";`
3. Replace `YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE` with the Web App URL you copied
4. Save the file

## Step 5: Test the Integration

1. Start your React development server
2. Click the **"Add Member"** button in the Quick Actions card
3. Fill out the form with test data:
   - Name: Test Member
   - Phone Number: +91 98765 43210
   - Membership Type: Premium
   - Duration: 3 Months
4. Click **Add Member**
5. Check your Google Sheet - you should see the new member added with all the details

## Troubleshooting

### Error: "Please configure the Google Script URL"
- Make sure you've replaced `YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE` with your actual Web App URL

### Error: "Failed to connect to Google Sheets"
- Check that your Web App is deployed and set to "Anyone" access
- Verify the URL is correct
- Make sure you've authorized the script

### Data not appearing in Google Sheets
- Check the sheet name matches the `SHEET_NAME` constant in the script
- Verify the script has the correct permissions
- Check the Apps Script execution log for errors (View > Execution log)

### CORS Errors
- The Google Apps Script handles CORS automatically when deployed as a Web App
- Make sure you're using the Web App URL, not the script editor URL

## Sheet Structure

The script will automatically create columns in this order:
1. **Timestamp** - When the member was added
2. **Name** - Member's full name
3. **Phone Number** - Contact number
4. **Membership Type** - Basic, Premium, VIP, Student, or Corporate
5. **Duration** - Membership duration (e.g., "3 Month(s)")
6. **Start Date** - Membership start date
7. **End Date** - Calculated end date based on duration
8. **Status** - Current status (defaults to "Active")

## Security Notes

- The Web App URL is public, but only authorized users can execute it
- Consider restricting access to "Anyone with Google account" for better security
- The script validates data before adding it to the sheet
- All submissions are timestamped for audit purposes

## Updating the Script

If you need to update the Google Apps Script:
1. Make your changes in the Apps Script editor
2. Go to **Deploy** > **Manage deployments**
3. Click the pencil icon (✏️) next to your deployment
4. Update the version to "New version"
5. Click **Deploy**
6. The Web App URL will remain the same - no need to update your React app



Deployment id AKfycbxiEXjqBHxRazG0tAV6wtegck8L5tTXWKDPihjsYJ-BrqtlP7wJytC20WWe6KcvBvicfA 

url : https://script.google.com/macros/s/AKfycbxiEXjqBHxRazG0tAV6wtegck8L5tTXWKDPihjsYJ-BrqtlP7wJytC20WWe6KcvBvicfA/exec