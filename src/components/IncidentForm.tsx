import React, { useState } from 'react';
import { validateIncidentNumber } from '../utils/validation';

const IncidentForm: React.FC = () => {
    const [incidentNumber, setIncidentNumber] = useState('');
    const [error, setError] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIncidentNumber(event.target.value);
        setError('');
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (validateIncidentNumber(incidentNumber)) {
            // Handle successful submission (e.g., send to Teams API)
            console.log('Incident number submitted:', incidentNumber);
        } else {
            setError('Invalid incident number format. Please use "INC" followed by 7 digits.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="incidentNumber">Incident Number:</label>
            <input
                type="text"
                id="incidentNumber"
                value={incidentNumber}
                onChange={handleChange}
                maxLength={10}
                required
            />
            <button type="submit">Submit</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};

export default IncidentForm;