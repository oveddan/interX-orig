# interX

Turn your static 3d spaces into on-chain interactive, and gamified experiences. This gives world builders a node-based interface and protocol to create an interoperable behavior graph for a virtual world.

![ClickToAnimateWithButton](https://user-images.githubusercontent.com/891755/202081868-2c602aee-cabd-49cd-8b81-459071e17749.gif)


This respository import's Ben Houston's [behave-graph](https://github.com/bhouston/behave-graph) lib, and incorporates code from [behave-flow](https://github.com/beeglebug/behave-flow) for the user interface. It takes the existing functionality, and adds the following improvements:

- adds a side by side view of the behave-flow editor, with the nodes on the left, and scene on the right, with changes propagating in real-time to the scene on the right
- Whenever there is a jsonPath as a param, query the scene for possible values, and generate dynamic dropdowns
- Integrates a smart contract that acts as a decentralized database that can securely and transparently enforce rules, gate actions and be a source of synchronized state for the scene.

This was made for the [EthGlobal Eth Sanfrancisco hackathon](https://sf.ethglobal.com/), and won Polygon's Best Metaverse or Gaming prize and SKALE's Best Metaverse, Gaming, or NFTs prize.

The Eth Sanfrancisco project page can be found [here](https://ethglobal.com/events/ethsanfrancisco2022/home)

## Organization

This repo is organized into the following workspaces:

- [/contracts](/contracts/) contains the smart contract
- [/editor](/editor/) is the behavior-graph editor and minting tool, built in react, react three fiber and using the behave-flow code.

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
