import { NodeSpecJSON, Registry, writeNodeSpecsToJSON } from '@behave-graph/core';

let nodeSpecJSON: NodeSpecJSON[] | undefined = undefined;

export const getNodeSpecJSON = (registry: Registry): NodeSpecJSON[] => {
  if (nodeSpecJSON === undefined) {
    nodeSpecJSON = writeNodeSpecsToJSON(registry);
  }
  return nodeSpecJSON;
};
