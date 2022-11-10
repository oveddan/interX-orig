import { Graph, Socket, Engine, Assert } from '@behave-graph/core';
import { EventNode, NodeDescription } from '@behave-graph/core';
import { ISmartContractActions } from '../../abstractions';
import { actionNameParamName } from './TokenGatedActionInvoker';

const smartActionInvokedTypeName = 'smartContract/actionInvoked';

export class OnSmartActionInvoked extends EventNode {
  public static Description = (smartContractActions: ISmartContractActions) =>
    new NodeDescription(
      smartActionInvokedTypeName,
      'Event',
      'On Smart Contract Action Invoked',
      (description, graph) => new OnSmartActionInvoked(description, graph, smartContractActions)
    );

  constructor(
    description: NodeDescription,
    graph: Graph,
    private readonly smartContractActions: ISmartContractActions
  ) {
    super(
      description,
      graph,
      [new Socket('string', actionNameParamName)],
      [new Socket('flow', 'flow'), new Socket('integer', 'count')]
    );
  }

  private jsonPath: string | undefined;

  private sendData = (engine: Engine, count: bigint) => {
    engine.commitToNewFiber(this, 'flow');
    this.writeOutput('count', count);
  };

  private handleActionInvoked: ((count: bigint) => void) | undefined = undefined;

  private getTriggeredActionName() {
    const triggerdActionName = this.readInput(actionNameParamName) as string;
    Assert.mustBeTrue(triggerdActionName !== undefined);

    return triggerdActionName;
  }

  init(engine: Engine) {
    const triggeredNodeId = this.getTriggeredActionName();
    console.log({ nodeId: triggeredNodeId });
    if (!triggeredNodeId) return;
    Assert.mustBeTrue(this.handleActionInvoked === undefined);

    this.jsonPath = triggeredNodeId;

    this.handleActionInvoked = (count: bigint) => {
      this.sendData(engine, count);
    };

    const smartContractActions = this.smartContractActions;
    smartContractActions.registerTriggerHandler(triggeredNodeId, this.handleActionInvoked);
  }

  dispose(engine: Engine) {
    Assert.mustBeTrue(this.handleActionInvoked !== undefined);
    Assert.mustBeTrue(this.jsonPath !== undefined);

    if (!this.jsonPath || !this.handleActionInvoked) return;

    const triggeredNodeId = this.getTriggeredActionName();
    this.smartContractActions.unRegisterTriggerHandler(triggeredNodeId, this.handleActionInvoked);
  }
}
