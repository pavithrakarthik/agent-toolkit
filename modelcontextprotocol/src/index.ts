#!/usr/bin/env node

import {PCCAgentToolkit} from '@fusionforce/agent-toolkit/mcp';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {green, red, yellow} from 'colors';

type ToolkitConfig = {
  actions: {
    [product: string]: {[action: string]: boolean};
  };
  context?: {
    account: string;
  };
};

type Options = {
  tools?: string[];
  accessToken?: string;
  sandbox?: boolean;
  pccAccount?: string;
};

const ACCEPTED_ARGS = ['access-token', 'tools', 'pcc-environment'];
const ACCEPTED_TOOLS = [
  'get_activated_vendor_apps',
  'get_patient_data'
];

export function parseArgs(args: string[]): Options {
  const options: Options = {};

  args.forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');

      if (key == 'tools') {
        options.tools = value.split(',');
      } else if (key == 'access-token') {
        options.accessToken = value;
      } else if (key == 'pcc-environment') {
        options.sandbox = value.toLowerCase() != 'production';
      } else {
        throw new Error(
          `Invalid argument: ${key}. Accepted arguments are: ${ACCEPTED_ARGS.join(
            ', '
          )}`
        );
      }
    }
  });

  // Check if required tools arguments is present
  if (!options.tools) {
    throw new Error('The --tools arguments must be provided.');
  }

  // Validate tools against accepted enum values
  options.tools.forEach((tool: string) => {
    if (tool == 'all') {
      return;
    }
    if (!ACCEPTED_TOOLS.includes(tool.trim())) {
      throw new Error(
        `Invalid tool: ${tool}. Accepted tools are: ${ACCEPTED_TOOLS.join(
          ', '
        )}`
      );
    }
  });

  // Check if client credentials are either provided in args or set in environment variables
  const accessToken = options.accessToken || process.env.PCC_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      'PCC Access Token not provided. Please either pass it as an argument --access-token=$access_token_val or set the PCC_ACCESS_TOKEN environment variable.'
    );
  }
  options.accessToken = accessToken;

  // Set sandbox mode (default to true if not specified)
  if (options.sandbox === undefined) {
    const sandboxEnv = process.env.PCC_ENVIRONMENT;
    options.sandbox = sandboxEnv
      ? sandboxEnv.toLowerCase() != 'production'
      : true;
  }

  return options;
}

function handleError(error: any) {
  console.error(red('\n🚨  Error initializing PCC MCP server:\n'));
  console.error(yellow(`   ${error.message}\n`));
}

export async function main() {
  const options = parseArgs(process.argv.slice(2));

  // Create the PCCAgentToolkit instance
  const selectedTools = options.tools!;
  const configuration: ToolkitConfig = {actions: {}};

  if (selectedTools.includes('all')) {
    ACCEPTED_TOOLS.forEach((tool) => {
      const [product, action] = tool.split('.');
      configuration.actions[product] = {
        ...configuration.actions[product],
        [action]: true,
      };
    });
  } else {
    selectedTools.forEach((tool: any) => {
      const [product, action] = tool.split('.');
      configuration.actions[product] = {
        ...configuration.actions[product],
        [action]: true,
      };
    });
  }

  // Append PCC account to configuration if provided
  if (options.pccAccount) {
    configuration.context = {account: options.pccAccount};
  }

  // Create context for the PCC API
  interface PCCContext {
    accessToken: string;
    sandbox: boolean | undefined;
    merchant_id?: string;
  }

  const context: PCCContext = {
    accessToken: options.accessToken!,
    sandbox: options.sandbox,
  };

  // Add PCC account to context if provided
  if (options.pccAccount) {
    context.merchant_id = options.pccAccount;
  }

  const server = new PCCAgentToolkit({
    accessToken: options.accessToken!,
    configuration: {
      ...configuration,
      context: context,
    },
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // We use console.error instead of console.log since console.log will output to stdio, which will confuse the MCP server
  console.error(green('✅ PCC MCP Server running on stdio'));
  console.error(green(`   Mode: ${options.sandbox ? 'Sandbox' : 'Production'}`));
}

if (require.main === module) {
  main().catch((error) => {
    handleError(error);
  });
}
