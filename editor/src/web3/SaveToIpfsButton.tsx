import { GraphJSON } from 'behave-graph';
import clsx from 'clsx';
import { useEffect } from 'react';
import { convertURIToHTTPS } from '../hooks/ipfs/ipfsUrlUtils';
import { useSaveSceneToIpfs } from '../hooks/useSaveSceneToIpfs';

const SaveToIpfsButton = ({
  behaviorGraph,
  modelUrl,
  setCid,
}: {
  modelUrl: string;
  behaviorGraph: GraphJSON;
  setCid?: (cid: string | undefined) => void;
}) => {
  const { cid, saveSceneToIpfs, saving } = useSaveSceneToIpfs({
    modelUrl,
    behaviorGraph,
  });

  useEffect(() => {
    if (!setCid) return;
    setCid(cid);
  }, [cid, setCid]);

  const disabled = !!cid;

  let text: string;

  if (!cid) {
    if (!saving) {
      text = 'Save Interactive Scene to Ipfs';
    } else text = 'Saving to Ipfs';
  } else text = 'Saved to Ipfs';

  return (
    <>
      <button
        type="submit"
        className={clsx('w-full text-white font-medium rounded-lg text-sm sm:w-auto px-2 py-2.5 text-center ', {
          'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 ':
            !disabled,
          'bg-gray-500': disabled || saving,
        })}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          saveSceneToIpfs();
        }}
      >
        {text}
      </button>
      {cid && (
        <>
          <a href={convertURIToHTTPS(`ipfs://${cid}`)} className="underline absolute top-10 left-0 z-40">
            {`ipfs://${cid}`}{' '}
          </a>
        </>
      )}
    </>
  );
};
export default SaveToIpfsButton;
