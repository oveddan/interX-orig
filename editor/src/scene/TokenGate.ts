import { FlowNode, NodeDescription, Socket, Graph, Engine } from 'behave-graph';
import { Fiber } from 'behave-graph/dist/lib/Execution/Fiber';
import { ISmartContractActions } from '../abstractions';

export class TokenGate extends FlowNode {
  public static Description = (smartContractActions: ISmartContractActions | undefined) =>
    new NodeDescription(
      'flow/tokenGate',
      'Flow',
      'TokenGate',
      (description, graph) => new TokenGate(description, graph, smartContractActions)
    );

  constructor(
    description: NodeDescription,
    graph: Graph,
    private smartContractActions: ISmartContractActions | undefined
  ) {
    super(
      description,
      graph,
      [new Socket('flow', 'flow'), new Socket('string', 'tokenGatedAddress')],
      [new Socket('flow', 'flow'), new Socket('integer', 'count')]
    );
  }

  private isInitialized = false;
  private triggerCount = 0;

  private sendTriggeredData = (engine: Engine, count: number) => {
    engine.commitToNewFiber(this, 'flow');
    this.writeOutput('count', count);
  };

  private handleSmartContractTriggered: ((count: number) => void) | undefined = undefined;

  init(engine: Engine) {
    const smartContractAction = this.smartContractActions;
    if (!smartContractAction) return;

    this.handleSmartContractTriggered = (count: number) => {
      this.sendTriggeredData(engine, count);
    };

    if (smartContractAction) {
      smartContractAction.registerTriggerHandler(this.id, this.handleSmartContractTriggered);
    }
  }

  dispose(engine: Engine) {
    const smartContractAction = this.smartContractActions;
    if (!smartContractAction) return;

    if (smartContractAction && this.handleSmartContractTriggered) {
      smartContractAction.unRegisterTriggerHandler(this.id, this.handleSmartContractTriggered);
    }
  }

  triggered(fiber: Fiber) {
    if (!this.isInitialized) {
      this.isInitialized = true;
    }

    const smartContractAction = this.smartContractActions;

    if (smartContractAction) {
      smartContractAction?.invoke(this.id);
    } else {
      this.triggerCount++;
      this.sendTriggeredData(fiber.engine, this.triggerCount);
    }
  }
}
