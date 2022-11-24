import { GraphJSON, NodeSpecJSON } from '@behave-graph/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEdgesState, useNodesState } from 'reactflow';
import { suspend } from 'suspend-react';
import { behaveToFlow } from '../flowEditor/transformers/behaveToFlow';
import { flowToBehave } from '../flowEditor/transformers/flowToBehave';
import { autoLayout } from '../flowEditor/util/autoLayout';
import { hasPositionMetaData } from '../flowEditor/util/hasPositionMetaData';
import { publicUrl } from './useSaveAndLoad';

export const exampleBehaveGraphFileUrl = (fileName: string) => publicUrl(`/examples/graphs/${fileName}`);
export const fetchBehaviorGraphJson = async (url: string) => (await (await fetch(url)).json()) as GraphJSON;

const useBehaveGraphFlow = ({
  initialGraphJsonUrl,
  specJson,
}: {
  initialGraphJsonUrl: string | undefined;
  specJson: NodeSpecJSON[] | undefined;
}) => {
  const initialGraphJson = suspend(async () => {
    if (!initialGraphJsonUrl) return;
    return await fetchBehaviorGraphJson(initialGraphJsonUrl);
  }, [initialGraphJsonUrl]);

  const [graphJson, setStoredGraphJson] = useState<GraphJSON | undefined>(initialGraphJson);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const setGraphJson = useCallback((graphJson: GraphJSON) => {
    if (!graphJson) return;

    const [nodes, edges] = behaveToFlow(graphJson);

    if (hasPositionMetaData(graphJson) === false) {
      autoLayout(nodes, edges);
    }

    setNodes(nodes);
    setEdges(edges);
    setStoredGraphJson(graphJson);
  }, []);

  useEffect(() => {
    if (!specJson) return;
    // when nodes and edges are updated, update the graph json with the flow to behave behavior
    const graphJson = flowToBehave({ nodes, edges, nodeSpecJSON: specJson });
    setStoredGraphJson(graphJson);
  }, [nodes, edges, specJson]);

  return {
    nodes,
    edges,
    onEdgesChange,
    onNodesChange,
    setGraphJson,
    graphJson,
  };
};

export default useBehaveGraphFlow;
