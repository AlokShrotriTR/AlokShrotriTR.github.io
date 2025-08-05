# Azure Deployment Guide for ACTR Proxy Server

This guide will help you deploy the ACTR proxy server to Azure App Service so it's accessible from MS Teams.

## Prerequisites

1. Azure subscription
2. Azure CLI installed (`az --version` to check)
3. Git installed

## Option 1: Deploy using Azure CLI (Recommended)

### Step 1: Login to Azure
```bash
az login
```

### Step 2: Create Resource Group
```bash
az group create --name actr-rg --location "East US"
```

### Step 3: Create App Service Plan
```bash
az appservice plan create --name actr-plan --resource-group actr-rg --sku F1 --is-linux
```

### Step 4: Create Web App
```bash
az webapp create --resource-group actr-rg --plan actr-plan --name actr-proxy-server --runtime "NODE|18-lts"
```

### Step 5: Configure App Settings
```bash
az webapp config appsettings set --resource-group actr-rg --name actr-proxy-server --settings \
  SERVICENOW_INSTANCE="https://dev279775.service-now.com" \
  SERVICENOW_USERNAME="admin" \
  SERVICENOW_PASSWORD="your-password-here" \
  NODE_TLS_REJECT_UNAUTHORIZED="0"
```

### Step 6: Deploy Code
```bash
# From your project directory
git init
git add proxy-server.js proxy-package.json
git commit -m "Initial proxy server deployment"

# Configure deployment
az webapp deployment source config-local-git --name actr-proxy-server --resource-group actr-rg

# Get deployment URL
az webapp deployment list-publishing-credentials --name actr-proxy-server --resource-group actr-rg --query scmUri --output tsv

# Deploy (replace <deployment-url> with the URL from above)
git remote add azure <deployment-url>
git push azure main
```

## Option 2: Deploy using Azure Portal

### Step 1: Create Web App
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Web App"
4. Click "Create"
5. Fill in:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new "actr-rg"
   - **Name**: actr-proxy-server (must be globally unique)
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Pricing plan**: F1 (Free tier)

### Step 2: Configure Application Settings
1. Go to your Web App in Azure Portal
2. Navigate to "Configuration" > "Application settings"
3. Add these settings:
   - `SERVICENOW_INSTANCE`: `https://dev279775.service-now.com`
   - `SERVICENOW_USERNAME`: `admin`
   - `SERVICENOW_PASSWORD`: `your-password-here`
   - `NODE_TLS_REJECT_UNAUTHORIZED`: `0`

### Step 3: Deploy Code
1. Go to "Deployment Center"
2. Choose "Local Git" as source
3. Copy the Git clone URL
4. In your local terminal:
   ```bash
   # Rename proxy-package.json to package.json for deployment
   cp proxy-package.json package.json
   
   git init
   git add proxy-server.js package.json
   git commit -m "Initial deployment"
   git remote add azure <your-git-clone-url>
   git push azure main
   ```

## Option 3: Alternative - Use Your Organization's Cloud Platform

If you have access to other cloud platforms:

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create actr-proxy-server

# Set environment variables
heroku config:set SERVICENOW_INSTANCE="https://dev279775.service-now.com"
heroku config:set SERVICENOW_USERNAME="admin"
heroku config:set SERVICENOW_PASSWORD="your-password"
heroku config:set NODE_TLS_REJECT_UNAUTHORIZED="0"

# Deploy
cp proxy-package.json package.json
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### AWS (if available)
- Use AWS Elastic Beanstalk
- Deploy as Node.js application
- Set environment variables in EB console

## After Deployment

### Step 1: Test the Deployment
Visit: `https://your-app-name.azurewebsites.net/health`

You should see: `{"status":"OK","timestamp":"..."}`

### Step 2: Update Teams App Configuration
The proxy URL in your `index.html` is already configured for Azure:
```javascript
proxyUrl: 'https://actr-proxy-server.azurewebsites.net/api/incident'
```

If you used a different app name, update it accordingly.

### Step 3: Update GitHub Pages
Commit and push your updated `index.html` to GitHub to deploy to GitHub Pages.

## Troubleshooting

### Check Logs
```bash
az webapp log tail --name actr-proxy-server --resource-group actr-rg
```

### Common Issues
1. **App name already taken**: Choose a different unique name
2. **Free tier limitations**: F1 tier sleeps after 20 minutes of inactivity
3. **CORS errors**: Ensure CORS is properly configured in proxy-server.js
4. **SSL issues**: NODE_TLS_REJECT_UNAUTHORIZED=0 should handle self-signed certs

### Test Endpoints
- Health check: `https://your-app.azurewebsites.net/health`
- Incident lookup: `https://your-app.azurewebsites.net/api/incident/INC1234567`

## Security Notes

1. **Environment Variables**: Never commit passwords to Git
2. **HTTPS Only**: Azure App Service uses HTTPS by default
3. **Access Control**: Consider adding IP restrictions if needed
4. **SSL**: In production, properly configure SSL certificates

## Cost Considerations

- **F1 (Free) tier**: Limited to 60 CPU minutes/day, sleeps after inactivity
- **B1 (Basic) tier**: ~$13/month, always-on, better for production
- **Upgrade if needed**: `az appservice plan update --name actr-plan --resource-group actr-rg --sku B1`
