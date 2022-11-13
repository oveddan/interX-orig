import { Graph, Socket, Engine, Assert } from 'behave-graph';
import { EventNode } from 'behave-graph/dist/lib/Nodes/EventNode';
import { NodeDescription } from 'behave-graph/dist/lib/Nodes/Registry/NodeDescription';
import { IScene } from '../../abstractions';

// very 3D specific.
export class OnSceneNodeClick extends EventNode {
  public static Description = (scene: IScene) =>
    new NodeDescription(
      'scene/nodeClick',
      'Event',
      'On Node Click',
      (description, graph) => new OnSceneNodeClick(description, graph, scene)
    );

  constructor(description: NodeDescription, graph: Graph, private readonly scene: IScene) {
    super(
      description,
      graph,
      [new Socket('string', 'jsonPath')],
      [new Socket('flow', 'flow'), new Socket('flow', 'secondFlow')]
    );
  }

  private jsonPath: string | undefined;

  private sendNodeClickedData = (engine: Engine) => {
    engine.commitToNewFiber(this, 'flow');
    engine.commitToNewFiber(this, 'secondFlow');
  };

  private handleNodeClick: (() => void) | undefined = undefined;

  init(engine: Engine) {
    const jsonPath = this.readInput('jsonPath') as string;
    console.log({ jsonPath });
    if (!jsonPath) return;
    Assert.mustBeTrue(this.handleNodeClick === undefined);

    this.jsonPath = jsonPath;

    this.handleNodeClick = () => {
      this.sendNodeClickedData(engine);
    };

    const scene = this.scene;
    scene.addOnClickedListener(jsonPath, this.handleNodeClick);
  }

  dispose(engine: Engine) {
    Assert.mustBeTrue(this.handleNodeClick !== undefined);
    Assert.mustBeTrue(this.jsonPath !== undefined);

    if (!this.jsonPath || !this.handleNodeClick) return;
    this.scene.removeOnClickedListener(this.jsonPath, this.handleNodeClick);
  }
}
