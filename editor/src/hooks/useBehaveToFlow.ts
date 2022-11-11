import { GraphJSON } from 'behave-graph';
import { useMemo } from 'react';
import { useEdgesState, useNodesState } from 'reactflow';
import { behaveToFlow } from '../flowEditor/transformers/behaveToFlow';

export const useBehaveToFlow = (rawGraphJSON: GraphJSON) => {
  const [initialNodes, initialEdges] = useMemo(() => behaveToFlow(rawGraphJSON), [rawGraphJSON]);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
  };
};
