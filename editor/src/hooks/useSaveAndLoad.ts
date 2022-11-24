import { useState, useCallback, useEffect } from 'react';
import { GraphJSON } from '@behave-graph/core';
import { behaveToFlow } from '../flowEditor/transformers/behaveToFlow';
import { hasPositionMetaData } from '../flowEditor/util/hasPositionMetaData';
import { autoLayout } from '../flowEditor/util/autoLayout';
import { useNodesState, useEdgesState } from 'reactflow';
import { examplePairs } from '../flowEditor/components/LoadModal';

function readFileContents(file: File) {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();

    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () => console.log('file reading has failed');
    reader.onload = () => {
      // Do whatever you want with the file contents
      const binaryStr = reader.result;

      if (!binaryStr) reject('no binary string');
      else resolve(binaryStr);
    };
    reader.readAsArrayBuffer(file);
  });
}

export const dataUrlFromFile = async (file: File) => {
  const fileContents = await readFileContents(file);
  if (fileContents) {
    if (typeof fileContents === 'string') {
      return fileContents;
    } else {
      const blobUrl = URL.createObjectURL(new Blob([fileContents]));

      return blobUrl;
    }
  }
};

export const publicUrl = (path: string) => new URL(path, import.meta.url).href;

export const emptyGraphJson = (): GraphJSON => ({});

export type ModelFile =
  | {
      fileUrl: string;
      fileType: 'url';
      fileContents: undefined;
    }
  | {
      fileUrl: undefined;
      fileType: 'uploaded';
      fileContents: string;
    };

export const fetchModelFile = async (url: string, fileName: string) => {
  const blob = await (await fetch(url)).blob();

  const file = new File([blob], fileName);

  return file;
};

const useSaveAndLoad = () => {
  const [graphJson, setGraphJson] = useState<GraphJSON>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [modelFile, setModelFile] = useState<{
    file: File;
    dataUri: string;
  }>();

  const handleGraphJsonLoaded = useCallback((graphJson: GraphJSON) => {
    if (!graphJson) return;

    const [nodes, edges] = behaveToFlow(graphJson);

    if (hasPositionMetaData(graphJson) === false) {
      autoLayout(nodes, edges);
    }

    setNodes(nodes);
    setEdges(edges);
    setGraphJson(graphJson);
  }, []);

  const handleSetModelAndBehaviorGraph = useCallback(
    async ({ modelFile, graph }: { modelFile: File; graph: GraphJSON }) => {
      const modelFileDataUrl = (await dataUrlFromFile(modelFile)) as string;

      setModelFile({
        dataUri: modelFileDataUrl,
        file: modelFile,
      });
      handleGraphJsonLoaded(graph);
    },
    []
  );

  useEffect(() => {
    const [defaultModelFile, defaultGraphFile] = examplePairs[0];
    const modelFileUrl = publicUrl(`/examples/models/${defaultModelFile}`);
    const jsonFileUrl = publicUrl(`/examples/graphs/${defaultGraphFile}`);

    (async () => {
      const modelFile = await fetchModelFile(modelFileUrl, defaultModelFile);
      const fetched = await (await fetch(jsonFileUrl)).json();

      handleSetModelAndBehaviorGraph({ modelFile, graph: fetched as GraphJSON });
    })();
  }, [handleSetModelAndBehaviorGraph]);

  return {
    handleSetModelAndBehaviorGraph,
    setModelFile,
    nodes,
    edges,
    onEdgesChange,
    onNodesChange,
    modelFile,
    graphJson,
    setGraphJson,
  };
};

export default useSaveAndLoad;

export type SaveAndLoadParams = ReturnType<typeof useSaveAndLoad>;
