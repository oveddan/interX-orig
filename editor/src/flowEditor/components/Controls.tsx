import { useState } from 'react';
import { ClearModal } from './ClearModal';
import { HelpModal } from './HelpModal';
import { faDownload, faPlay, faPause, faQuestion, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { LoadModal } from './LoadModal';
import { SaveModal } from './SaveModal';
import { Controls, ControlButton } from 'reactflow';
import { NodeSpecJSON } from 'behave-graph';
import { SaveAndLoadParams } from '../../hooks/useSaveAndLoad';

// const ControlButton = ({ children, title, onClick }: { title: string; children: JSX.Element; onClick: () => void }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className="text-gray-700 border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 dark:border-gray-500 dark:text-gray-500 dark:hover:text-white dark:focus:ring-gray-800'"
//   >
//     {children}
//   </button>
// );

const CustomControls = ({
  toggleRun,
  specJson,
  running,
  handleSetModelAndBehaviorGraph,
  additionalControls = null,
  rootNode,
}: {
  toggleRun: () => void;
  specJson: NodeSpecJSON[];
  running: boolean;
  additionalControls?: JSX.Element | null;
  rootNode: HTMLElement | null;
} & Pick<SaveAndLoadParams, 'handleSetModelAndBehaviorGraph'>) => {
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  return (
    <>
      <Controls className="bg-white">
        <ControlButton title="Help" onClick={() => setHelpModalOpen(true)} className="align-middle">
          <FontAwesomeIcon icon={faQuestion} />
        </ControlButton>
        <ControlButton title="Load" onClick={() => setLoadModalOpen(true)}>
          <FontAwesomeIcon icon={faUpload} />
        </ControlButton>
        <ControlButton title="Save" onClick={() => setSaveModalOpen(true)}>
          <FontAwesomeIcon icon={faDownload} />
        </ControlButton>
        <ControlButton title="Clear" onClick={() => setClearModalOpen(true)}>
          <FontAwesomeIcon icon={faTrash} />
        </ControlButton>
        <ControlButton title="Run" onClick={() => toggleRun()}>
          <FontAwesomeIcon icon={running ? faPause : faPlay} />
        </ControlButton>
        {additionalControls}
      </Controls>
      {rootNode && (
        <>
          <LoadModal
            open={loadModalOpen}
            onClose={() => setLoadModalOpen(false)}
            handleSetModelAndBehaviorGraph={handleSetModelAndBehaviorGraph}
            container={rootNode}
          />
          <SaveModal open={saveModalOpen} onClose={() => setSaveModalOpen(false)} specJson={specJson} />
          <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
          <ClearModal open={clearModalOpen} onClose={() => setClearModalOpen(false)} />
        </>
      )}
    </>
  );
};

export default CustomControls;
