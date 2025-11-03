import { z } from 'zod';
import { StructuredTool } from '@langchain/core/tools';
import {CallbackManagerForToolRun} from '@langchain/core/callbacks/manager';
import { RunnableConfig } from '@langchain/core/runnables';
import PCCAPI from '../shared/api';

class PCCTool extends StructuredTool {
  PCCAPI: PCCAPI;
  method: string;
  name: string;
  description: string;
  schema: z.ZodObject<any, any, any, any>;

  constructor(
    PCCAPI: PCCAPI,
    method: string, 
    name: string,
    description: string,
    schema: z.ZodObject<any, any, any, any, {[x: string]: any}>
  ) {
    super();
    this.PCCAPI = PCCAPI;
    this.method = method;
    this.name = method;
    this.description = description;
    this.schema = schema;
  }

  _call(
    arg: z.output<typeof this.schema>,
    _runManager?: CallbackManagerForToolRun,
    _parentConfig?: RunnableConfig,
  ): Promise<any> {
    return this.PCCAPI.run(this.method, arg);
  }
}

export default PCCTool;