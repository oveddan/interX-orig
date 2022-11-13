import { GraphJSON } from 'behave-graph';
import { useCallback, useState } from 'react';
import { saveInteractiveWorldToIpfs } from './ipfs/ipfsInteractiveWorldSaver';

export const useSaveSceneToIpfs = ({ modelUrl, behaviorGraph }: { modelUrl: string; behaviorGraph: GraphJSON }) => {
  const [cid, setCid] = useState<string>();
  const [saving, setSaving] = useState(false);
  const saveSceneToIpfs = useCallback(async () => {
    setSaving(true);

    try {
      const { cid } = await saveInteractiveWorldToIpfs({ modelUrl, behaviorGraph });

      setCid(cid);
    } finally {
      setSaving(false);
    }
  }, [modelUrl, behaviorGraph]);

  return { cid, saveSceneToIpfs, saving };
};
