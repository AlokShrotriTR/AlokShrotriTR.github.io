# Corporate Network Solutions for ACTR Proxy Server

## Option 1: Internal Server Deployment

If your organization has internal servers that can be accessed from Teams:

### Step 1: Deploy to Internal Server
1. Copy `proxy-server.js` and `proxy-package.json` to your internal server
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start server: `npm start`
5. Ensure firewall allows access from Teams

### Step 2: Update Proxy URL
```javascript
proxyUrl: 'https://your-internal-server.company.com:3001/api/incident'
```

## Option 2: Reverse Proxy Configuration

If you have Apache/Nginx on a public server:

### Nginx Configuration
```nginx
server {
    listen 443 ssl;
    server_name actr-proxy.yourcompany.com;
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }
}
```

### Apache Configuration
```apache
<VirtualHost *:443>
    ServerName actr-proxy.yourcompany.com
    
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
    
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type"
</VirtualHost>
```

## Option 3: Corporate VPN/Firewall Configuration

### Firewall Rules
Allow inbound traffic to port 3001 from Teams IP ranges:
- Microsoft 365 IP ranges: https://docs.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges

### VPN Configuration
If using corporate VPN, ensure:
1. Proxy server is accessible through VPN
2. Teams can reach the VPN endpoint
3. Proper routing is configured

## Option 4: API Gateway

If your organization uses API gateways (Azure API Management, AWS API Gateway, etc.):

### Azure API Management
1. Import the proxy server as a backend
2. Configure CORS policies
3. Set up authentication if needed
4. Use the API Management URL in your Teams app

### Configuration Example
```javascript
proxyUrl: 'https://your-apim.azure-api.net/actr/api/incident'
```
