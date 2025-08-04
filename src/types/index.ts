export type IncidentNumber = `INC${string}`; 

export interface Incident {
    number: IncidentNumber;
    description?: string;
    status?: 'open' | 'closed' | 'in-progress';
}