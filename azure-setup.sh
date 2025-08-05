# Azure AD App Setup for ACTR Teams App
# Run these commands in Azure CLI or use the Azure Portal

# 1. Create the Azure AD App Registration
az ad app create \
  --display-name "ACTR Teams Meeting Creator" \
  --web-redirect-uris "https://yourtenant.sharepoint.com/sites/_layouts/15/TeamsLogon.aspx?SPFX=true&dest={url}" \
  --required-resource-accesses '[
    {
      "resourceAppId": "00000003-0000-0000-c000-000000000000",
      "resourceAccess": [
        {
          "id": "0c7dd1e8-6076-4c79-b0d8-9c0d42e5ed50",
          "type": "Scope"
        },
        {
          "id": "e1fe6dd8-ba31-4d61-89e7-88639da4683d",
          "type": "Scope"
        },
        {
          "id": "64a6cdd6-aab1-4aaf-94b8-3cc8405e90d0",
          "type": "Scope"
        }
      ]
    }
  ]'

# Note: The IDs above are for:
# - 0c7dd1e8-6076-4c79-b0d8-9c0d42e5ed50: OnlineMeetings.ReadWrite
# - e1fe6dd8-ba31-4d61-89e7-88639da4683d: User.Read
# - 64a6cdd6-aab1-4aaf-94b8-3cc8405e90d0: email

# 2. Get the App ID and create a client secret
# (You'll need to do this in the Azure Portal)
