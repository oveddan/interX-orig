import { NodeSpecJSON } from 'behave-graph';
import { NodeTypes } from 'reactflow';
import { IScene } from '../../abstractions';
import { Node } from '../components/Node';

const getCustomNodeTypes = (allSpecs: NodeSpecJSON[], scene: IScene) => {
  return allSpecs.reduce((nodes, node) => {
    nodes[node.type] = (props) => (
      <Node spec={node} allSpecs={allSpecs} {...props} getProperties={scene.getProperties} />
    );
    return nodes;
  }, {} as NodeTypes);
};

export default getCustomNodeTypes;
