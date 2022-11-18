import { GraphJSON } from 'behave-graph';
import { useCallback, useState } from 'react';
import { saveInteractiveWorldToIpfs } from './ipfs/ipfsInteractiveWorldSaver';

export const useSaveSceneToIpfs = ({
  modelFile,
  behaviorGraph,
}: {
  modelFile: File | undefined;
  behaviorGraph: GraphJSON;
}) => {
  const [cid, setCid] = useState<string>();
  const [saving, setSaving] = useState(false);
  const saveSceneToIpfs = useCallback(async () => {
    if (!modelFile) throw new Error('missing model file');
    setSaving(true);

    try {
      const { cid } = await saveInteractiveWorldToIpfs({ modelFile, behaviorGraph });

      setCid(cid);

      return cid;
    } finally {
      setSaving(false);
    }
  }, [modelFile, behaviorGraph]);

  return { cid, saveSceneToIpfs, saving };
};
