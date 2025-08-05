const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Disable SSL certificate verification for development
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// ServiceNow configuration from environment variables or defaults
const SERVICENOW_CONFIG = {
    instance: process.env.SERVICENOW_INSTANCE || 'https://dev279775.service-now.com',
    username: process.env.SERVICENOW_USERNAME || 'admin',
    password: process.env.SERVICENOW_PASSWORD || 'x{?Gktp(@n>932KeG)w{0Ix{eJnEFW{_cN)*[-Fvd)3>y&vu^14Ljp4E_Y@uI=+b}z7oTRh>hIB8Ef2u2w}=)lxNHE'
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Proxy endpoint for ServiceNow - GET incident
app.get('/api/incident/:number', async (req, res) => {
    try {
        const incidentNumber = req.params.number;
        
        console.log(`Fetching incident: ${incidentNumber}`);
        
        const url = `${SERVICENOW_CONFIG.instance}/api/now/table/incident?sysparm_query=number=${incidentNumber}&sysparm_fields=short_description,number,state,sys_id`;
        const credentials = Buffer.from(`${SERVICENOW_CONFIG.username}:${SERVICENOW_CONFIG.password}`).toString('base64');
        
        const response = await fetch(url, {
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
        res.json(data);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Proxy endpoint for ServiceNow - UPDATE incident
app.put('/api/incident/:sys_id', async (req, res) => {
    try {
        const sys_id = req.params.sys_id;
        const updateData = req.body;
        
        // ServiceNow configuration
        const SERVICENOW_CONFIG = {
            instance: 'https://dev279775.service-now.com',
            username: 'admin',
            password: 'x{?Gktp(@n>932KeG)w{0Ix{eJnEFW{_cN)*[-Fvd)3>y&vu^14Ljp4E_Y@uI=+b}z7oTRh>hIB8Ef2u2w}=)lxNHE'
        };
        
        const url = `${SERVICENOW_CONFIG.instance}/api/now/table/incident/${sys_id}`;
        const credentials = Buffer.from(`${SERVICENOW_CONFIG.username}:${SERVICENOW_CONFIG.password}`).toString('base64');
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
