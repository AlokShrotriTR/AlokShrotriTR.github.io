import { validateIncidentNumber, IncidentResponse } from '../utils/validation';

export const sendIncidentNotification = async (incidentNumber: string, userId: string) => {
    const message = `Incident reported: ${incidentNumber}`;
    // Teams notification logic here
    console.log(`Sending notification to ${userId}: ${message}`);
};

export const getIncidentFromServiceNow = async (incidentNumber: string): Promise<IncidentResponse> => {
    if (!validateIncidentNumber(incidentNumber)) {
        return { title: '', success: false, error: 'Invalid incident number format' };
    }

    try {
        // ServiceNow REST API endpoint - Replace with your actual instance
        const serviceNowUrl = 'https://your-instance.service-now.com/api/now/table/incident';
        
        // You'll need to replace these with actual credentials or use OAuth
        const username = process.env.SERVICENOW_USERNAME || 'your-username';
        const password = process.env.SERVICENOW_PASSWORD || 'your-password';
        const credentials = btoa(`${username}:${password}`);
        
        const response = await fetch(`${serviceNowUrl}?sysparm_query=number=${incidentNumber}&sysparm_fields=short_description,number,state,priority,assigned_to`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.result.length > 0) {
            const incident = data.result[0];
            return {
                title: incident.short_description || 'No title available',
                success: true,
                state: incident.state,
                number: incident.number
            };
        } else {
            return {
                title: '',
                success: false,
                error: 'Incident not found'
            };
        }
    } catch (error) {
        console.error('Error fetching incident from ServiceNow:', error);
        return {
            title: '',
            success: false,
            error: `Failed to fetch incident: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};