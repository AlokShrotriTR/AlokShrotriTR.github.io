import { TeamsInfo } from 'botbuilder';

export const sendIncidentNotification = async (incidentNumber: string, userId: string) => {
    const message = `Incident reported: ${incidentNumber}`;
    await TeamsInfo.sendMessage(userId, message);
};

export const getIncidentDetails = async (incidentNumber: string) => {
    // Placeholder for fetching incident details from an API or database
    return {
        incidentNumber,
        status: 'Open',
        description: 'Incident description goes here.',
    };
};