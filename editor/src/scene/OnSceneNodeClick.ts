import { Graph, Socket, Engine, Assert } from 'behave-graph';
import { EventNode } from 'behave-graph/dist/lib/Nodes/EventNode';
import { NodeDescription } from 'behave-graph/dist/lib/Nodes/Registry/NodeDescription';
import { IScene, ISmartContractActions } from '../abstractions';

// very 3D specific.
export class OnSceneNodeClick extends EventNode {
  public static Description = (scene: IScene, smartContractActions: ISmartContractActions | undefined) =>
    new NodeDescription(
      'scene/nodeClick',
      'Event',
      'On Node Click',
      (description, graph) => new OnSceneNodeClick(description, graph, scene, smartContractActions)
    );

  constructor(
    description: NodeDescription,
    graph: Graph,
    private readonly scene: IScene,
    private smartContractActions: ISmartContractActions | undefined
  ) {
    super(
      description,
      graph,
      [
        new Socket('string', 'jsonPath'),
        new Socket('boolean', 'tokenGated'),
        new Socket('string', 'tokenGatedAddress'),
      ],
      [new Socket('flow', 'flow'), new Socket('flow', 'secondFlow'), new Socket('integer', 'count')]
    );
  }

  private clickCount = 0;
  private jsonPath: string | undefined;

  private sendNodeClickedData = (engine: Engine, count: number) => {
    engine.commitToNewFiber(this, 'flow');
    engine.commitToNewFiber(this, 'secondFlow');
    this.writeOutput('count', count);
  };

  private handleNodeClick: (() => void) | undefined = undefined;
  private handleSmartContractTriggered: ((count: number) => void) | undefined = undefined;

  init(engine: Engine) {
    const jsonPath = this.readInput('jsonPath') as string;
    console.log({ jsonPath });
    if (!jsonPath) return;
    Assert.mustBeTrue(this.handleNodeClick === undefined);

    this.jsonPath = jsonPath;

    const smartContractAction = this.smartContractActions;

    this.clickCount = 0;

    this.handleNodeClick = () => {
      if (!smartContractAction) {
        this.clickCount++;
        this.sendNodeClickedData(engine, this.clickCount);
      } else {
        smartContractAction.invoke(this.id);
      }
    };

    const scene = this.scene;
    scene.addOnClickedListener(jsonPath, this.handleNodeClick);

    this.handleSmartContractTriggered = (count: number) => {
      this.sendNodeClickedData(engine, count);
    };

    if (smartContractAction) {
      smartContractAction.registerTriggerHandler(this.id, this.handleSmartContractTriggered);
    }
  }

  dispose(engine: Engine) {
    Assert.mustBeTrue(this.handleNodeClick !== undefined);
    Assert.mustBeTrue(this.jsonPath !== undefined);

    if (!this.jsonPath || !this.handleNodeClick) return;
    this.scene.removeOnClickedListener(this.jsonPath, this.handleNodeClick);

    if (!this.handleNodeClick) return;
    this.smartContractActions?.unRegisterTriggerHandler(this.jsonPath, this.handleNodeClick);
  }
}
