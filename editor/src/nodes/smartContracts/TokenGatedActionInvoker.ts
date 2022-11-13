import { FlowNode, NodeDescription, Socket, Graph, Engine, Assert } from 'behave-graph';
import { Fiber } from 'behave-graph/dist/lib/Execution/Fiber';
import { ISmartContractActions } from '../../abstractions';

export const smartContractInvokedActionName = 'smartContract/invokeTokenGatedAction';
export const actionNameParamName = 'actionName';
export const tokenGatedParamName = 'tokenGated';
export const togenGatedAddressParamName = 'tokenGatedAddress';

export class TokenGatedActionInvoker extends FlowNode {
  public static Description = (smartContractActions: ISmartContractActions) =>
    new NodeDescription(
      smartContractInvokedActionName,
      'Flow',
      'Invoke Smart Contract Action',
      (description, graph) => new TokenGatedActionInvoker(description, graph, smartContractActions)
    );

  constructor(description: NodeDescription, graph: Graph, private smartContractActions: ISmartContractActions) {
    super(
      description,
      graph,
      [
        new Socket('flow', 'flow'),
        new Socket('string', actionNameParamName),
        new Socket('boolean', tokenGatedParamName),
        new Socket('string', togenGatedAddressParamName),
      ],
      []
    );
  }

  private isInitialized = false;

  triggered(fiber: Fiber) {
    if (!this.isInitialized) {
      this.isInitialized = true;
    }

    const smartContractAction = this.smartContractActions;

    if (smartContractAction) {
      const actionName = this.readInput(actionNameParamName) as string;

      Assert.mustBeTrue(actionName !== undefined);
      smartContractAction.invoke(actionName);
    }
  }
}
