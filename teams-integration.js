// teams-integration.js - Real Microsoft Teams Integration

class TeamsIntegration {
    constructor(config) {
        this.clientId = config.clientId;
        this.tenantId = config.tenantId;
        this.redirectUri = config.redirectUri;
        this.accessToken = null;
    }

    // Initialize Microsoft Teams SDK and authenticate
    async initialize() {
        try {
            await microsoftTeams.app.initialize();
            console.log('Teams SDK initialized');
            
            // Get Teams context
            const context = await microsoftTeams.app.getContext();
            console.log('Teams context:', context);
            
            // Authenticate user
            await this.authenticate();
            return true;
        } catch (error) {
            console.error('Teams initialization failed:', error);
            return false;
        }
    }

    // Authenticate using Teams SSO or popup
    async authenticate() {
        try {
            // Option 1: Teams SSO (recommended)
            const authToken = await microsoftTeams.authentication.getAuthToken();
            console.log('Got auth token from Teams');
            
            // Exchange for Graph API token
            this.accessToken = await this.exchangeTokenForGraphAccess(authToken);
            
        } catch (error) {
            console.log('SSO failed, falling back to popup auth');
            
            // Option 2: Popup authentication
            const authResult = await microsoftTeams.authentication.authenticate({
                url: this.getAuthUrl(),
                width: 600,
                height: 535
            });
            
            this.accessToken = authResult.accessToken;
        }
    }

    // Get authentication URL for popup
    getAuthUrl() {
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'token',
            redirect_uri: this.redirectUri,
            scope: 'https://graph.microsoft.com/OnlineMeetings.ReadWrite https://graph.microsoft.com/User.Read',
            response_mode: 'fragment',
            state: Date.now().toString()
        });
        
        return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?${params}`;
    }

    // Exchange Teams token for Graph API access
    async exchangeTokenForGraphAccess(teamsToken) {
        // This would typically be done through your backend
        // to keep client secrets secure
        try {
            const response = await fetch('/api/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ teamsToken })
            });
            
            const data = await response.json();
            return data.accessToken;
        } catch (error) {
            console.error('Token exchange failed:', error);
            throw error;
        }
    }

    // Create a real Teams meeting using Graph API
    async createMeeting(meetingDetails) {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        const meetingPayload = {
            subject: meetingDetails.subject,
            body: {
                contentType: 'HTML',
                content: meetingDetails.description || 'Teams meeting created by ACTR'
            },
            start: {
                dateTime: new Date().toISOString(),
                timeZone: 'UTC'
            },
            end: {
                dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
                timeZone: 'UTC'
            },
            isOnlineMeeting: true,
            onlineMeetingProvider: 'teamsForBusiness'
        };

        try {
            // Create calendar event with Teams meeting
            const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(meetingPayload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const meeting = await response.json();
            
            return {
                success: true,
                meetingId: meeting.id,
                joinUrl: meeting.onlineMeeting.joinUrl,
                meetingUrl: meeting.onlineMeeting.joinUrl,
                subject: meeting.subject,
                startTime: meeting.start.dateTime,
                endTime: meeting.end.dateTime,
                organizer: meeting.organizer.emailAddress.address
            };

        } catch (error) {
            console.error('Failed to create Teams meeting:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Alternative: Create online meeting directly (simpler)
    async createOnlineMeeting(subject) {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        const meetingPayload = {
            subject: subject,
            startDateTime: new Date().toISOString(),
            endDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        };

        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(meetingPayload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const meeting = await response.json();
            
            return {
                success: true,
                meetingId: meeting.id,
                joinUrl: meeting.joinWebUrl,
                meetingUrl: meeting.joinWebUrl,
                subject: meeting.subject,
                conferenceId: meeting.videoTeleconferenceId
            };

        } catch (error) {
            console.error('Failed to create online meeting:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export for use in main application
window.TeamsIntegration = TeamsIntegration;
