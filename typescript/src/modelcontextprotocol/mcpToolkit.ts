

import { Configuration, isToolAllowed } from '../shared/configuration';
import PCCAPI from '../shared/api';
import tools,  {Tool} from '../shared/tools';

const SOURCE = 'Remote MCP';

class PCCMCPToolkit {
  private _pcc: PCCAPI;
  private readonly filteredTools: Tool[] = [];

  constructor({
    accessToken,
    configuration,
  }: {
    accessToken: string;
    configuration: Configuration;
  }) {
 
    this._pcc = new PCCAPI(accessToken, { ...configuration.context, source: SOURCE });
    const context = configuration.context || {};
    this.filteredTools = tools(context).filter((tool) =>
      isToolAllowed(tool, configuration)
    );
  }

  public getTools(): Tool[] {
    return this.filteredTools;
  }

  public getPCCAPIService(): PCCAPI {
    return this._pcc;
  }
}

export default PCCMCPToolkit;

