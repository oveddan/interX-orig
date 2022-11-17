import { Suspense, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import FlowEditor from './flowEditor/FlowEditorApp';
import { useSceneModificationEngine } from './hooks/behaviorFlow';
import Scene from './scene/Scene';
// import rawGraphJSON from './exampleGraphs/TokenGatedClick.json';
import { GraphJSON } from 'behave-graph';
import '@rainbow-me/rainbowkit/styles.css';
import { flowToBehave } from './flowEditor/transformers/flowToBehave';
import useTokenContractAddress from './web3/useTokenContractAddressAndAbi';
import useLoadSceneAndRegistry from './hooks/useLoadSceneAndRegistry';
import useMockSmartContractActions from './onChainWorld/useMockSmartContractActions';
import SplitPane from 'react-split-pane';
import './styles/resizer.css';
import { VscSplitVertical, VscSplitHorizontal } from 'react-icons/vsc';
import clsx from 'clsx';
import Controls from './flowEditor/components/Controls';
import useSaveAndLoad from './hooks/useSaveAndLoad';

type splitDirection = 'vertical' | 'horizontal';

const TogglePaneButton = ({
  splitDirection,
  buttonSplitDirection,
  setSplitDirection,
  children,
}: TogglePangeButtonProps & {
  buttonSplitDirection: splitDirection;
  children: JSX.Element[];
}) => {
  const active = buttonSplitDirection === splitDirection;
  return (
    <button
      type="button"
      className={clsx('font-medium text-sm p-2 text-center inline-flex items-center mr-2', {
        'text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800':
          active,
        'text-gray-700 border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 dark:border-gray-500 dark:text-gray-500 dark:hover:text-white dark:focus:ring-gray-800':
          !active,
      })}
      onClick={() => setSplitDirection(buttonSplitDirection)}
    >
      {children}
    </button>
  );
};

type TogglePangeButtonProps = {
  splitDirection: 'vertical' | 'horizontal';
  setSplitDirection: (dir: splitDirection) => void;
};

const TogglePaneButtons = (props: TogglePangeButtonProps) => (
  <>
    <TogglePaneButton {...props} buttonSplitDirection="vertical">
      <VscSplitHorizontal />
      <span className="sr-only">Split Vertical</span>
    </TogglePaneButton>

    <TogglePaneButton {...props} buttonSplitDirection="horizontal">
      <VscSplitVertical />
      <span className="sr-only">Split Horizontal</span>
    </TogglePaneButton>
  </>
);

function EditorAndScene() {
  const smartContractActions = useMockSmartContractActions();
  const saveAndLoadProps = useSaveAndLoad();

  const { nodes, edges, gltf, onNodesChange, onEdgesChange } = saveAndLoadProps;

  const { sceneJson, scene, animations, sceneOnClickListeners, registry, specJson, lifecyleEmitter } =
    useLoadSceneAndRegistry({
      gltf,
      smartContractActions,
    });

  const [run, setRun] = useState(false);

  const [graphJson, setGraphJson] = useState<GraphJSON>();

  useEffect(() => {
    if (!specJson) return;
    const graphJson = flowToBehave({ nodes, edges, nodeSpecJSON: specJson });
    setGraphJson(graphJson);
  }, [nodes, edges, specJson]);

  useSceneModificationEngine({
    graphJson,
    registry,
    eventEmitter: lifecyleEmitter,
    run,
  });

  const toggleRun = useCallback(() => {
    setRun((existing) => !existing);
  }, []);

  const contractAddress = useTokenContractAddress();

  const rightRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>();

  const handleSplitResized = useCallback(() => {
    if (rightRef.current) {
      const boundingRect = rightRef.current.getBoundingClientRect();
      setDimensions({
        height: boundingRect.height,
        width: boundingRect.width,
      });
    }
  }, []);

  const [splitDirection, setSplitDirection] = useState<splitDirection>('vertical');

  useEffect(() => {
    handleSplitResized();
  }, [handleSplitResized, splitDirection]);

  const controls = specJson && (
    <Controls toggleRun={toggleRun} specJson={specJson} running={run} {...saveAndLoadProps} />
  );

  return (
    <div className="h-full w-full">
      <div
        className={clsx('absolute right-2 z-50', {
          'top-14': splitDirection === 'horizontal',
          'top-2': splitDirection === 'vertical',
        })}
      >
        <TogglePaneButtons setSplitDirection={setSplitDirection} splitDirection={splitDirection} />
      </div>
      {/* @ts-ignore */}
      <SplitPane split={splitDirection} defaultSize={800} onChange={handleSplitResized}>
        <div className="w-full h-full">
          {controls && scene && (
            <FlowEditor
              nodes={nodes}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              specJson={specJson}
              scene={scene}
              controls={controls}
            />
          )}
        </div>
        {/* <div className="row-span-1">
            <Nav
              contractAddress={contractAddress}
              graphJson={graphJson}
              modelUrl={modelUrl}
              setModelUrl={setModelUrl}
            />
          </div> */}
        <div className="w-full h-full overflow-hidden" ref={rightRef}>
          {dimensions && (
            <div style={{ ...dimensions }} className="absolute z-40">
              <Scene
                scene={sceneJson}
                onClickListeners={sceneOnClickListeners}
                animationsState={animations}
                {...dimensions}
              />
            </div>
          )}
        </div>
      </SplitPane>
    </div>
  );
}

function EditorAndSceneWrapper() {
  return (
    <Suspense fallback={null}>
      <EditorAndScene />
    </Suspense>
  );
}

export default EditorAndSceneWrapper;
