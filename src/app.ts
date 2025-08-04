import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/IncidentForm';
import { initializeTeams } from './services/teamsService';

const startApp = async () => {
    await initializeTeams();
    ReactDOM.render(<App />, document.getElementById('root'));
};

startApp();