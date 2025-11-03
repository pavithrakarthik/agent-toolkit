import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { Configuration, isToolAllowed } from '../shared/configuration';
import PCCAPI from '../shared/api';
import tools from '../shared/tools';
import { version } from '../../package.json';


const SOURCE = 'MCP';

class PCCAgentToolkit extends McpServer {
  private _pcc: PCCAPI;

  constructor({
    accessToken,
    configuration,
  }: {
    accessToken: string;
    configuration: Configuration;
  }) {
    super({
      name: 'PCC',
      version: version,
    });

    this._pcc = new PCCAPI(accessToken, { ...configuration.context, source: SOURCE });

    const context = configuration.context || {};
    const filteredTools = tools(context).filter((tool) =>
      isToolAllowed(tool, configuration)
    );

    filteredTools.forEach((tool) => {
      const regTool = this.tool(
        tool.method,
        tool.description,
        tool.parameters.shape,
        async (arg: any, _extra: RequestHandlerExtra<any, any>) => {
          const result = await this._pcc.run(tool.method, arg);
          return {
            content: [
              {
                type: 'text' as const,
                text: String(result),
              },
            ],
          };
        }
      );
    });
  }
}

export default PCCAgentToolkit;
