# ACTR - Real Microsoft Teams Integration Setup Guide

This guide walks you through setting up real Microsoft Teams integration for the ACTR app.

## Prerequisites
- Microsoft 365 tenant with Teams
- Azure Active Directory admin access
- Node.js development environment

## Step 1: Azure AD App Registration

### 1.1 Create App Registration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Fill out the form:
   - **Name**: `ACTR Teams Meeting Creator`
   - **Supported account types**: `Accounts in this organizational directory only (Single tenant)`
   - **Redirect URI**: 
     - Type: `Single-page application (SPA)`
     - URI: `http://localhost:8000` (for development)

### 1.2 Configure API Permissions
1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `OnlineMeetings.ReadWrite` - Create and manage online meetings
   - `Calendars.ReadWrite` - Create calendar events with meetings
   - `User.Read` - Read user profile

4. Click **Grant admin consent** for your organization

### 1.3 Get Application Details
1. Go to **Overview** tab and copy:
   - **Application (client) ID**
   - **Directory (tenant) ID**

2. Go to **Certificates & secrets** → **New client secret**
   - Description: `ACTR Backend Secret`
   - Expires: `24 months`
   - Copy the **Value** (you won't see it again!)

## Step 2: Configure Your Application

### 2.1 Update Teams Configuration
Edit `index.html` and update the `TEAMS_CONFIG` object:

```javascript
const TEAMS_CONFIG = {
    clientId: 'YOUR_ACTUAL_CLIENT_ID_HERE', // From Azure AD
    tenantId: 'YOUR_ACTUAL_TENANT_ID_HERE', // From Azure AD
    redirectUri: window.location.origin + '/auth/callback',
    useRealTeams: true // Enable real Teams integration
};
```

### 2.2 Update Backend Configuration
Edit `token-exchange-server.js` and update the `AZURE_CONFIG`:

```javascript
const AZURE_CONFIG = {
    clientId: 'YOUR_ACTUAL_CLIENT_ID_HERE',
    clientSecret: 'YOUR_ACTUAL_CLIENT_SECRET_HERE', 
    tenantId: 'YOUR_ACTUAL_TENANT_ID_HERE',
    scope: 'https://graph.microsoft.com/.default'
};
```

## Step 3: Teams App Manifest

### 3.1 Update manifest.json
Update your Teams app manifest to include the new permissions:

```json
{
    "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
    "manifestVersion": "1.16",
    "version": "1.0.0",
    "id": "YOUR_APP_ID_HERE",
    "packageName": "com.yourcompany.actr",
    "developer": {
        "name": "Your Company",
        "websiteUrl": "https://yourcompany.com",
        "privacyUrl": "https://yourcompany.com/privacy",
        "termsOfUseUrl": "https://yourcompany.com/terms"
    },
    "icons": {
        "color": "color.png",
        "outline": "outline.png"
    },
    "name": {
        "short": "ACTR",
        "full": "Advanced Call Tracking & Response"
    },
    "description": {
        "short": "Incident tracking with Teams meeting creation",
        "full": "Create Teams meetings automatically for ServiceNow incidents"
    },
    "accentColor": "#FFFFFF",
    "staticTabs": [
        {
            "entityId": "index",
            "name": "ACTR",
            "contentUrl": "https://yourdomain.com/index.html",
            "websiteUrl": "https://yourdomain.com",
            "scopes": ["personal"]
        }
    ],
    "permissions": ["identity", "messageTeamMembers"],
    "webApplicationInfo": {
        "id": "YOUR_AZURE_CLIENT_ID_HERE",
        "resource": "https://graph.microsoft.com"
    },
    "validDomains": [
        "yourdomain.com",
        "graph.microsoft.com",
        "login.microsoftonline.com"
    ]
}
```

## Step 4: Deployment

### 4.1 Development Setup
1. Start the token exchange server:
```bash
node token-exchange-server.js
```

2. Start the proxy server:
```bash
node proxy-server.js
```

3. Start the web server:
```bash
npx http-server . -p 8000
```

### 4.2 Production Deployment
1. Deploy your app to a public HTTPS domain
2. Update redirect URIs in Azure AD to match your domain
3. Update `TEAMS_CONFIG.redirectUri` to your production URL
4. Upload the Teams app package to your organization's app catalog

## Step 5: Testing

### 5.1 In Teams Desktop/Web
1. Install your app in Teams
2. Open the ACTR tab
3. Enter an incident number
4. Verify real Teams meeting creation

### 5.2 Meeting Creation Flow
1. **Lookup incident** → Shows incident details
2. **Confirm incident** → Triggers authentication if needed
3. **Create meeting** → Uses Graph API to create real meeting
4. **Update ServiceNow** → Adds meeting link to incident notes
5. **Join meeting** → Opens real Teams meeting

## Step 6: Advanced Features

### 6.1 Add Meeting Attendees
Modify the meeting creation to include relevant team members:

```javascript
// In teams-integration.js, update createMeeting method
const meetingPayload = {
    // ... existing payload
    attendees: [
        {
            emailAddress: {
                address: "user@yourcompany.com",
                name: "Team Member"
            },
            type: "required"
        }
    ]
};
```

### 6.2 Recurring Meetings
For incidents that need regular check-ins:

```javascript
const meetingPayload = {
    // ... existing payload
    recurrence: {
        pattern: {
            type: "weekly",
            interval: 1,
            daysOfWeek: ["monday", "wednesday", "friday"]
        },
        range: {
            type: "endDate",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
    }
};
```

### 6.3 Meeting Recordings
Enable automatic recording:

```javascript
const meetingPayload = {
    // ... existing payload
    allowRecording: true,
    recordAutomatically: true
};
```

## Troubleshooting

### Common Issues:

1. **Authentication Fails**
   - Verify client ID and tenant ID are correct
   - Check redirect URI matches exactly
   - Ensure admin consent is granted

2. **Permission Errors**
   - Verify API permissions are granted
   - Check user has necessary Teams license
   - Ensure app permissions include required scopes

3. **Meeting Creation Fails**
   - Check Graph API permissions
   - Verify access token is valid
   - Test Graph API calls directly

### Debug Tips:
- Enable browser console logging
- Test Graph API calls with [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
- Use Azure AD sign-in logs to troubleshoot authentication

## Security Best Practices

1. **Never expose client secrets in frontend code**
2. **Use HTTPS in production**
3. **Implement token refresh logic**
4. **Validate all user inputs**
5. **Use least-privilege principle for permissions**

## Next Steps

1. Set up continuous deployment
2. Add error logging and monitoring
3. Implement user feedback collection
4. Add meeting analytics and reporting
5. Integrate with additional ServiceNow workflows

---

Need help? Check the [Microsoft Graph documentation](https://docs.microsoft.com/en-us/graph/) or [Teams development docs](https://docs.microsoft.com/en-us/microsoftteams/platform/).
