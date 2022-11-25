import { NodeSpecJSON } from '@behave-graph/core';
import { useEffect, useState } from 'react';
import { Node, NodeTypes, OnConnectStartParams } from 'reactflow';

import { NodePickerFilters } from '../components/NodePicker';
import getCustomNodeTypes from '../util/getCustomNodeTypes';
import { getNodePickerFilters } from '../util/getPickerFilters';

const useFlowConfigFromRegistry = ({
  nodes,
  lastConnectStart,
  specJson
}: {
  nodes: Node<any>[];
  lastConnectStart: OnConnectStartParams | undefined;
  specJson: NodeSpecJSON[];
}) => {
  const [filters, setFilters] = useState<NodePickerFilters | undefined>();

  const [customNodeTypes, setCustomNodeTypes] = useState<NodeTypes>();

  useEffect(() => {
    if (!specJson) return;
    const filters = getNodePickerFilters(nodes, lastConnectStart, specJson);

    setFilters(filters);
  }, [lastConnectStart, nodes, specJson]);

  useEffect(() => {
    if (!specJson) return;
    const customNodeTypes = getCustomNodeTypes(specJson);

    setCustomNodeTypes(customNodeTypes);
  }, [specJson]);

  return { filters, customNodeTypes, specJson };
};

export default useFlowConfigFromRegistry;
