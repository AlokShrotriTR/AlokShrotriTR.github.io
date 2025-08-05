# Testing ACTR in Microsoft 365 Developer Program - Step by Step Guide

## Overview
This guide shows you how to test your ACTR app in a real Microsoft Teams environment using your M365 Developer Program tenant.

## Prerequisites
- Microsoft 365 Developer Program subscription (free)
- Access to your developer tenant
- Azure AD admin rights in your tenant

## Step 1: Set Up Azure AD App Registration

### 1.1 Access Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your M365 developer account
3. Ensure you're in your developer tenant (check top-right corner)

### 1.2 Create App Registration
1. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
2. Fill out the form:
   - **Name**: `ACTR Teams Meeting Creator`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: 
     - Type: `Single-page application (SPA)`
     - URI: `https://AlokShrotriTR.github.io` (your GitHub Pages domain)

### 1.3 Configure API Permissions
1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `OnlineMeetings.ReadWrite` - Create and manage online meetings
   - `Calendars.ReadWrite` - Create calendar events with meetings
   - `User.Read` - Read user profile
   - `email` - Read user email address

4. Click **Grant admin consent for [Your Tenant]**

### 1.4 Create Client Secret
1. Go to **Certificates & secrets** → **New client secret**
2. Description: `ACTR Backend Secret`
3. Expires: `24 months`
4. **COPY THE SECRET VALUE** (you won't see it again!)

### 1.5 Get Your IDs
From the **Overview** tab, copy:
- **Application (client) ID**
- **Directory (tenant) ID**

## Step 2: Update Your Configuration

### 2.1 Update Your index.html
Replace the TEAMS_CONFIG in your index.html:

```javascript
const TEAMS_CONFIG = {
    clientId: 'YOUR_CLIENT_ID_FROM_AZURE', // Paste your actual client ID
    tenantId: 'YOUR_TENANT_ID_FROM_AZURE', // Paste your actual tenant ID
    redirectUri: 'https://AlokShrotriTR.github.io/auth/callback',
    useRealTeams: true // Enable real Teams integration
};
```

### 2.2 Update Your Manifest
Update your manifest.json with the new Azure app details:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
  "manifestVersion": "1.16",
  "version": "1.0.1",
  "id": "798f74c2-280d-42ee-bf89-b4714a0088d3",
  "packageName": "com.example.actr",
  "developer": {
    "name": "Your Name",
    "websiteUrl": "https://AlokShrotriTR.github.io",
    "privacyUrl": "https://AlokShrotriTR.github.io/privacy",
    "termsOfUseUrl": "https://AlokShrotriTR.github.io/terms"
  },
  "name": {
    "short": "ACTR",
    "full": "Advanced Call Tracking & Response"
  },
  "description": {
    "short": "Incident tracking with Teams meeting creation",
    "full": "ACTR creates Teams meetings automatically for ServiceNow incidents with real-time incident lookup and meeting scheduling"
  },
  "icons": {
    "outline": "outline.png",
    "color": "color.png"
  },
  "accentColor": "#0078D7",
  "staticTabs": [
    {
      "entityId": "incidentForm",
      "name": "ACTR",
      "contentUrl": "https://AlokShrotriTR.github.io/index.html",
      "websiteUrl": "https://AlokShrotriTR.github.io/index.html",
      "scopes": ["personal"]
    }
  ],
  "permissions": ["identity", "messageTeamMembers"],
  "webApplicationInfo": {
    "id": "YOUR_CLIENT_ID_FROM_AZURE",
    "resource": "https://graph.microsoft.com"
  },
  "validDomains": [
    "AlokShrotriTR.github.io",
    "graph.microsoft.com", 
    "login.microsoftonline.com"
  ]
}
```

## Step 3: Deploy to GitHub Pages

### 3.1 Push Your Updates
1. Commit your updated index.html with the new TEAMS_CONFIG
2. Push to your GitHub repository
3. Ensure GitHub Pages is serving from the main branch

### 3.2 Test Your Deployment
1. Go to `https://AlokShrotriTR.github.io/index.html`
2. Test the incident lookup functionality
3. Verify the page loads correctly

## Step 4: Create Teams App Package

### 4.1 Prepare the Package
1. Create a folder called `ACTRTeamsApp`
2. Copy these files into it:
   - `manifest.json` (updated with your Azure app ID)
   - `color.png` (192x192 pixels)
   - `outline.png` (32x32 pixels, white outline on transparent background)

### 4.2 Create ZIP Package
1. Select all three files in the folder
2. Create a ZIP file called `ACTR.zip`
3. Ensure the files are at the root level of the ZIP (not in a subfolder)

## Step 5: Sideload App in Teams

### 5.1 Enable Sideloading
1. Go to [Microsoft Teams Admin Center](https://admin.teams.microsoft.com)
2. Navigate to **Teams apps** → **Setup policies**
3. Select the **Global (Org-wide default)** policy
4. Enable **Upload custom apps**
5. Save the changes

### 5.2 Sideload the App
1. Open Microsoft Teams (web or desktop)
2. In the left sidebar, click **Apps**
3. Click **Upload a custom app** → **Upload for [Your Organization]**
4. Select your `ACTR.zip` file
5. Click **Add** to install the app

## Step 6: Test in Teams

### 6.1 Open Your App
1. In Teams, go to **Apps** → **Built for [Your Organization]**
2. Find and click on **ACTR**
3. Click **Add** to add it as a personal app

### 6.2 Test the Full Workflow
1. **Enter an incident number** (e.g., INC0009001)
2. **Click Lookup** → Should show incident details
3. **Click "Yes, Create Meeting"** → Should trigger authentication
4. **Complete authentication** → Sign in with your M365 developer account
5. **Verify meeting creation** → Should create a real Teams meeting
6. **Check ServiceNow** → Should see meeting link in incident notes

### 6.3 Expected Behavior
- ✅ **Authentication popup** appears for first use
- ✅ **Real Teams meeting** gets created
- ✅ **Meeting link** is added to ServiceNow incident
- ✅ **"Join Meeting Now"** opens actual Teams meeting

## Step 7: Advanced Testing

### 7.1 Test Meeting Features
1. Click **"Join Meeting Now"** → Should open Teams meeting
2. Verify meeting details in Outlook calendar
3. Check meeting appears in Teams calendar

### 7.2 Test with Different Users
1. Add app to different users in your tenant
2. Test meeting creation from different accounts
3. Verify permissions work correctly

### 7.3 Test Error Scenarios
1. Test with invalid incident numbers
2. Test when ServiceNow is unavailable
3. Test authentication failures

## Step 8: Monitor and Debug

### 8.1 Check Azure AD Logs
1. Go to Azure AD → **Sign-in logs**
2. Filter by your application
3. Check for successful authentications

### 8.2 Check Microsoft Graph Activity
1. Use [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Test API calls manually with your token
3. Verify permissions are working

### 8.3 Browser Developer Tools
1. Open F12 developer tools in Teams
2. Check Console for JavaScript errors
3. Monitor Network tab for API calls

## Troubleshooting Common Issues

### Authentication Issues
- **Problem**: "AADSTS50011: The reply URL specified in the request does not match"
- **Solution**: Ensure redirect URI in Azure AD matches exactly: `https://AlokShrotriTR.github.io/auth/callback`

### Permission Issues
- **Problem**: "Insufficient privileges to complete the operation"
- **Solution**: Grant admin consent for all permissions in Azure AD

### Meeting Creation Fails
- **Problem**: Meeting creation returns 403/401 errors
- **Solution**: Verify OnlineMeetings.ReadWrite permission is granted and consented

### App Won't Load in Teams
- **Problem**: Teams shows "There was a problem reaching this app"
- **Solution**: Check GitHub Pages is serving HTTPS and manifest.json is valid

## Next Steps After Successful Testing

1. **Collect user feedback** from your developer tenant users
2. **Optimize performance** based on real usage
3. **Add more features** like recurring meetings or attendee management
4. **Prepare for production deployment** to your main tenant
5. **Submit to Teams App Store** if desired

## Additional Resources

- [Microsoft Teams Developer Documentation](https://docs.microsoft.com/en-us/microsoftteams/platform/)
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)
- [Teams App Validation Checklist](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/appsource/prepare/teams-store-validation-guidelines)

---

**Need Help?** 
- Check Azure AD sign-in logs for authentication issues
- Use Graph Explorer to test API calls
- Enable browser developer tools to see JavaScript errors
- Test manifest.json validity at https://dev.teams.microsoft.com/appvalidation.html
