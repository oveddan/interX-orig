export interface ISmartContractActions {
  invoke: (id: string) => void;
  registerTriggerHandler: (id: string, cb: (count: bigint) => void) => void;
  unRegisterTriggerHandler: (id: string, cb: (count: bigint) => void) => void;
}

export type ResourceProperties = { names: string[]; properties: string[] };
export type Properties = {
  [resource: string]: ResourceProperties;
};

export interface IScene {
  getProperties: () => Properties;
  getProperty(jsonPath: string, valueTypeName: string): any;
  setProperty(jsonPath: string, valueTypeName: string, value: any): void;
  addOnClickedListener(jsonPath: string, callback: (jsonPath: string) => void): void;
  removeOnClickedListener(jsonPath: string, callback: (jsonPath: string) => void): void;
}
