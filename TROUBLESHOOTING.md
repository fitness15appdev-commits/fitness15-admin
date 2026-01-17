# Troubleshooting: Sheet Not Updating

If your Google Sheet is not updating when you submit the form, follow these steps:

## 1. Verify Script Deployment

1. Go to your Google Apps Script project
2. Click **Deploy** > **Manage deployments**
3. Make sure you have a deployment active
4. If you updated the script code, you MUST create a new deployment:
   - Click the pencil icon (✏️) next to your deployment
   - Select **New version**
   - Click **Deploy**
   - **Important**: The Web App URL will remain the same, but the new version will be active

## 2. Check Script Permissions

1. In Google Apps Script, go to **Run** > **testAddMember** (or any function)
2. If prompted, authorize the script
3. Grant all requested permissions

## 3. Verify Sheet Name

1. Open your Google Sheet
2. Check the name of the sheet tab (should be "Members" by default)
3. If different, update the `SHEET_NAME` constant in the script:
   ```javascript
   const SHEET_NAME = "YourSheetName"; // Update this
   ```
4. Redeploy the script after making changes

## 4. Test the Script Directly

1. In Google Apps Script editor, go to **Run** > **testAddMember**
2. Check the execution log (View > Execution log)
3. If there are errors, fix them and redeploy

## 5. Check the Web App URL

Make sure the Web App URL in your React components matches the deployed URL:
- AddMemberForm.jsx: Line 60
- ExtendMembershipForm.jsx: Line 51

## 6. Verify Deployment Settings

Your Web App deployment should have:
- **Execute as**: Me (your email)
- **Who has access**: Anyone (or "Anyone with Google account")

## 7. Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Submit the form
4. Look for any error messages
5. Check Network tab to see if the request is being sent

## 8. Manual Test

Test the script URL directly in your browser:
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=addMember&name=Test&number=1234567890&membershipType=Basic&duration=1
```

You should see a JSON response or be redirected. If you see an error, check the script.

## Common Issues

### Issue: "Script function not found"
- **Solution**: Make sure `doGet` function exists in your script

### Issue: "Permission denied"
- **Solution**: Re-authorize the script and grant all permissions

### Issue: "Sheet not found"
- **Solution**: Check the sheet name matches `SHEET_NAME` constant

### Issue: Data not saving
- **Solution**: 
  1. Redeploy the script (create new version)
  2. Make sure you're using the correct Web App URL
  3. Check execution logs for errors

## Still Not Working?

1. Check the Google Apps Script execution log for errors
2. Verify the script has write permissions to the sheet
3. Try creating a new deployment from scratch
4. Make sure the sheet is not protected or read-only

