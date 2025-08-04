// token-exchange-server.js - Backend service for secure token exchange

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Azure AD configuration - KEEP THESE SECRET!
const AZURE_CONFIG = {
    clientId: 'YOUR_CLIENT_ID_HERE',
    clientSecret: 'YOUR_CLIENT_SECRET_HERE', 
    tenantId: 'YOUR_TENANT_ID_HERE',
    scope: 'https://graph.microsoft.com/.default'
};

// Exchange Teams token for Graph API access token
app.post('/api/exchange-token', async (req, res) => {
    try {
        const { teamsToken } = req.body;
        
        if (!teamsToken) {
            return res.status(400).json({ error: 'Teams token required' });
        }

        // Use On-Behalf-Of flow to get Graph API token
        const tokenUrl = `https://login.microsoftonline.com/${AZURE_CONFIG.tenantId}/oauth2/v2.0/token`;
        
        const params = new URLSearchParams({
            client_id: AZURE_CONFIG.clientId,
            client_secret: AZURE_CONFIG.clientSecret,
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: teamsToken,
            requested_token_use: 'on_behalf_of',
            scope: 'https://graph.microsoft.com/OnlineMeetings.ReadWrite https://graph.microsoft.com/User.Read https://graph.microsoft.com/Calendars.ReadWrite'
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const tokenData = await response.json();

        if (!response.ok) {
            console.error('Token exchange failed:', tokenData);
            return res.status(400).json({ error: 'Token exchange failed', details: tokenData });
        }

        res.json({
            accessToken: tokenData.access_token,
            expiresIn: tokenData.expires_in
        });

    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Alternative: Client credentials flow for app-only access
app.post('/api/app-token', async (req, res) => {
    try {
        const tokenUrl = `https://login.microsoftonline.com/${AZURE_CONFIG.tenantId}/oauth2/v2.0/token`;
        
        const params = new URLSearchParams({
            client_id: AZURE_CONFIG.clientId,
            client_secret: AZURE_CONFIG.clientSecret,
            scope: AZURE_CONFIG.scope,
            grant_type: 'client_credentials'
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const tokenData = await response.json();

        if (!response.ok) {
            return res.status(400).json({ error: 'Token request failed', details: tokenData });
        }

        res.json({
            accessToken: tokenData.access_token,
            expiresIn: tokenData.expires_in
        });

    } catch (error) {
        console.error('App token error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create meeting on behalf of user
app.post('/api/create-meeting', async (req, res) => {
    try {
        const { accessToken, subject, description } = req.body;

        const meetingPayload = {
            subject: subject,
            body: {
                contentType: 'HTML',
                content: description || 'Teams meeting created by ACTR'
            },
            start: {
                dateTime: new Date().toISOString(),
                timeZone: 'UTC'
            },
            end: {
                dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                timeZone: 'UTC'
            },
            isOnlineMeeting: true,
            onlineMeetingProvider: 'teamsForBusiness'
        };

        const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meetingPayload)
        });

        const meeting = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Meeting creation failed', details: meeting });
        }

        res.json({
            success: true,
            meetingId: meeting.id,
            joinUrl: meeting.onlineMeeting?.joinUrl,
            subject: meeting.subject
        });

    } catch (error) {
        console.error('Meeting creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Token exchange server running on port ${PORT}`);
    console.log('Configure your Azure AD app with these settings:');
    console.log('- Redirect URI: http://localhost:8000 (for development)');
    console.log('- API Permissions: OnlineMeetings.ReadWrite, User.Read, Calendars.ReadWrite');
});
