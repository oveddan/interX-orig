import { GraphJSON, NodeSpecJSON } from '@behave-graph/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEdgesState, useNodesState } from 'reactflow';
import { suspend } from 'suspend-react';

// import { examplePairs } from '../components/LoadModal';
import { behaveToFlow } from '../flowEditor/transformers/behaveToFlow';
import { flowToBehave } from '../flowEditor/transformers/flowToBehave';
import { autoLayout } from '../flowEditor/util/autoLayout';
import { hasPositionMetaData } from '../flowEditor/util/hasPositionMetaData';
import { publicUrl } from './useSaveAndLoad';

const useBehaveGraphFlow = ({
  initialGraphJsonUrl,
  specJson,
}: {
  initialGraphJsonUrl: string | undefined;
  specJson: NodeSpecJSON[] | undefined;
}) => {
  const keys = useMemo(() => [initialGraphJsonUrl], [initialGraphJsonUrl]);

  const initialGraphJson = suspend(async () => {
    if (!initialGraphJsonUrl) return;
    const fetched = (await (await fetch(publicUrl(`/examples/graphs/${initialGraphJsonUrl}`))).json()) as GraphJSON;

    return fetched;
  }, keys);

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
