# PCC Agent Toolkit

The PCC Agent Toolkit enables popular agent frameworks including Vercel's AI SDK and Model Context Protocol (MCP) to integrate with PCC APIs through function calling. It includes support for TypeScript and is built on top of PCC APIs and the PCC SDKs.


## Available tools

The PCC Agent toolkit provides the following tools:


## Available tools

The PCC Agent toolkit provides the following tools:

**Healthcare Data Management**

- `get_patient_data`: Get patient data from PCC
- `get_activated_vendor_apps`: Get activated vendor apps from PCC

## TypeScript

### Installation

You don't need this source code unless you want to modify the package. If you just
want to use the package run:

```sh
npm install @PCC/agent-toolkit
```

#### Requirements

- Node 18+

### Usage

The library needs to be configured with your account's client id and secret which is available in your [PCC Developer Dashboard](https://developer.PCC.com/dashboard/). Use `configuration` to add context as well as to specify which actions should be allowed. 


```typescript
import { PCCAgentToolkit } from '@PCC/agent-toolkit/ai-sdk';
const PCCToolkit = new PCCAgentToolkit({
  clientId: process.env.PCC_CLIENT_ID,
  clientSecret: process.env.PCC_CLIENT_SECRET,
  configuration: {
    actions: {
      invoices: {
        create: true,
        list: true,
        send: true,
        sendReminder: true,
        cancel: true,
        generateQRC: true,
      },
      products: { create: true, list: true, update: true },
      subscriptionPlans: { create: true, list: true, show: true },
      shipment: { create: true, show: true, cancel: true },
      orders: { create: true, get: true },
      disputes: { list: true, get: true },
    },
  },
});
```

## AI-SDK

### Initializing the Workflows

```typescript
import { PCCWorkflows, ALL_TOOLS_ENABLED } from '@PCC/agent-toolkit/ai-sdk';
const PCCWorkflows = new PCCWorkflows({
  clientId: process.env.PCC_CLIENT_ID,
  clientSecret: process.env.PCC_CLIENT_SECRET,
  configuration: {
    actions: ALL_TOOLS_ENABLED,
  },
});
```

### Using the toolkit

```typescript
const llm: LanguageModelV1 = getModel(); // The model to be used with ai-sdk
const { text: response } = await generateText({
  model: llm,
  tools: PCCToolkit.getTools(),
  maxSteps: 10,
  prompt: `Create an order for $50 for custom handcrafted item and get the payment link.`,
});

```

## PCC Model Context Protocol

The PCC [Model Context Protocol](https://modelcontextprotocol.com/) server allows you to integrate with PCC APIs through function calling. This protocol supports various tools to interact with different PCC services.

### Running MCP Inspector

To run the PCC MCP server using npx, use the following command:

```bash
npx -y @PCC/mcp --tools=all PCC_ACCESS_TOKEN="YOUR_ACCESS_TOKEN" PCC_ENVIRONMENT="SANDBOX"
```

Replace `YOUR_ACCESS_TOKEN` with active access token generated using these steps: [PCC access token](#generating-an-access-token). Alternatively, you could set the PCC_ACCESS_TOKEN in your environment variables.

### Custom MCP Server
You can set up your own MCP server. For example:

```typescript
import { PCCAgentToolkit } from “@PCC/agent-toolkit/modelcontextprotocol";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const orderSummary = await PCCWorkflows.generateOrder(
  llm,
  transactionInfo,
  merchantInfo,
);

const server = new PCCAgentToolkit({
  accessToken: process.env.PCC_ACCESS_TOKEN
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PCC MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
```

### Usage with MCP host (Claude Desktop/Cline/Cursor/Github Co-Pilot)

This guide explains how to integrate the PCC connector with Claude Desktop.

## Prerequisites
- Claude Desktop application installed
- installing Node.js locally

## Installation Steps

### 1. Install Node.js

Node.js is required for the PCC connector to function:

1. Visit the [Node.js official website](https://nodejs.org/), download and install it.
2. Requirements: Node 18+

### 2. Configure PCC Connector with MCP host (Claude desktop / Cursor / Cline)
We will show the integration with Claude desktop. You can use your favorite MCP host.
1. Open Claude Desktop
2. Navigate to Settings
3. Find the Developer or Advanced settings section
4. Locate the external tools or connectors configuration area
5. Add the following PCC connector configuration to this ~/Claude/claude_desktop_config.json:

```json
{
   "mcpServers": {
     "PCC": {
       "command": "npx",
       "args": [
         "-y",
         "@PCC/mcp",
         "--tools=all"
       ],
       "env": {
         "PCC_ACCESS_TOKEN": "YOUR_PCC_ACCESS_TOKEN",
         "PCC_ENVIRONMENT": "SANDBOX"
       }
     }
   }
}
```
Make sure to replace `YOUR_PCC_ACCESS_TOKEN` with your actual PCC Access Token. Alternatively, you could set the PCC_ACCESS_TOKEN as an environment variable. You can also pass it as an argument using --access-token in "args"
Set `PCC_ENVIRONMENT` value as either `SANDBOX` for stage testing and `PRODUCTION` for production environment.

6. Save your configuration changes

### 3. Test the Integration

1. Quit and restart Claude Desktop to apply changes
2. Test the connection by asking Claude to perform a PCC-related task
   - Example: \"List my PCC invoices\"

## Environment Variables

The following environment variables can be used:

- `PCC_ACCESS_TOKEN`: Your PCC Access Token
- `PCC_ENVIRONMENT`: Set to `SANDBOX` for sandbox mode, `PRODUCTION` for production (defaults to `SANDBOX` mode)


This guide explains how to generate an access token for PCC API integration, including how to find your client ID and client secret.



## Prerequisites

- PCC Developer account (for Sandbox)
- PCC Business account (for production)

## Finding Your Client ID and Client Secret

1. **Create a PCC Developer Account**:
   - Go to [PCC Developer Dashboard](https://developer.PCC.com/dashboard/)
   - Sign up or log in with your PCC credentials

2. **Access Your Credentials**:
   - In the Developer Dashboard, click on **Apps & Credentials** in the menu
   - Switch between **Sandbox** and **Live** modes depending on your needs
   
3. **Create or View an App**:
   - To create a new app, click **Create App**
   - Give your app a name and select a Business account to associate with it
   - For existing apps, click on the app name to view details

4. **Retrieve Credentials**:
   - Once your app is created or selected, you'll see a screen with your:
     - **Client ID**: A public identifier for your app
     - **Client Secret**: A private key (shown after clicking \"Show\")
   - Save these credentials securely as they are required for generating access tokens

## Generating an Access Token
### Using cURL

```bash
curl -v https://api-m.sandbox.PCC.com/v1/oauth2/token \\
  -H \"Accept: application/json\" \\
  -H \"Accept-Language: en_US\" \\
  -u \"CLIENT_ID:CLIENT_SECRET\" \\
  -d \"grant_type=client_credentials\"
```

Replace `CLIENT_ID` and `CLIENT_SECRET` with your actual credentials. For production, use `https://api-m.PCC.com` instead of the sandbox URL.


### Using Postman

1. Create a new request to `https://api-m.sandbox.PCC.com/v1/oauth2/token`
2. Set method to **POST**
3. Under **Authorization**, select **Basic Auth** and enter your Client ID and Client Secret
4. Under **Body**, select **x-www-form-urlencoded** and add a key `grant_type` with value `client_credentials`
5. Send the request

### Response

A successful response will look like:

```json
{
  "scope": "...",
  "access_token": "Your Access Token",
  "token_type": "Bearer",
  "app_id": "APP-80W284485P519543T",
  "expires_in": 32400,
  "nonce": "..."
}
```

Copy the `access_token` value for use in your Claude Desktop integration.

## Token Details

- **Sandbox Tokens**: Valid for 3-8 hours
- **Production Tokens**: Valid for 8 hours
- It's recommended to implement token refresh logic before expiration

## Using the Token with Claude Desktop

Once you have your access token, update the `PCC_ACCESS_TOKEN` value in your Claude Desktop connector configuration:

```json
{
  "env": {
    "PCC_ACCESS_TOKEN": "YOUR_NEW_ACCESS_TOKEN",
    "PCC_ENVIRONMENT": "SANDBOX"
  }
}
```

## Best Practices

1. Store client ID and client secret securely
2. Implement token refresh logic to handle token expiration
3. Use environment-specific tokens (sandbox for testing, production for real transactions)
4. Avoid hardcoding tokens in application code

## Disclaimer
*AI-generated content may be inaccurate or incomplete. Users are responsible for independently verifying any information before relying on it. PCC makes no guarantees regarding output accuracy and is not liable for any decisions, actions, or consequences resulting from its use.*

