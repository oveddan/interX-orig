# interX

This respository is created as a fork from Ben Houston's [behave-graph](https://github.com/bhouston/behave-graph), and incorporates code from [behave-flow](https://github.com/beeglebug/behave-flow) for the user interface. It takes the existing functionality, and enables a scene to be edited side by side with the node-based editor, and allows the scene graphs to be stores on IPFS and evm compatible blockchains.

This was made for the [EthGlobal EthSf hackathon](https://sf.ethglobal.com/)

## Organization

This repo is organized into the following workspaces:

- /contracts contains the smart contract
- /editor is the behavior-graph editor and minting tool, built in react, react three fiber and using the behave-flow code.
- /framework contains the forked code from behave-graph which acts as the execution engine for the behavior graph

## Useful code

- [Behavior Graph smart contract](/contracts/BehaviorGraph.sol), with token gated actions
- [Behavior Graph smart contract unit tests](/test/BehaviorGraph.ts)
- [Scene Modification code from the Behavior Graph](/editor/src/scene/useSceneModifier.ts)
- [Hook to mint the behavior graph and actions into the smart contract](/editor/src/hooks/useInteractiveWorldMinter.ts)

## Developer Setup

Install all dependencies:

    yarn install

To start the editor:

    yarn dev

To run the unit tests for the smart contracts

    yarn test
