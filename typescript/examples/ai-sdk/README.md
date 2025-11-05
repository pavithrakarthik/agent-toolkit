# PCC Agent Toolkit - AI SDK UI Example

A web-based user interface for testing PCC Agent Toolkit workflows with the Vercel AI SDK.

## Features

### 🏥 **Patient Data Workflow**
- Multi-step workflow to retrieve patient data
- Orchestrates org info → facility info → patient data retrieval
- Real-time step-by-step logging

### 🔌 **Vendor Apps Workflow**  
- Retrieve activated vendor applications for organizations
- Streamlined workflow with detailed logging

### ⚙️ **Custom Tools**
- Direct access to individual PCC tools
- AI automatically selects appropriate tools based on requests

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.sample` to `.env` and fill in your credentials:

```
OPENAI_API_KEY=your_azure_openai_api_key
PCC_CLIENT_ID=your_pcc_client_id  
PCC_CLIENT_SECRET=your_pcc_client_secret
```

## Running the UI

### Start the web server:
```bash
npm run ui
# or
npm run server
```

### Access the interface:
Open your browser to: **http://localhost:3000**

## Usage

### Original CLI Example:
```bash
npm run dev
# or
npx ts-node index.ts
```

### Web UI Features:
- **Patient Data Tab**: Multi-step workflow with detailed logging
- **Vendor Apps Tab**: Streamlined vendor app retrieval  
- **Custom Tools Tab**: Direct tool access with AI selection

---

**🚀 Ready to explore PCC healthcare data with AI-powered workflows!**
