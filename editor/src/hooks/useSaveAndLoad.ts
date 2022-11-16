import { useState, useCallback, useEffect } from 'react';
import { modelOptions } from '../nav/Nav';
import { useGLTF } from '@react-three/drei';
import { GraphJSON } from 'behave-graph';
import { behaveToFlow } from '../flowEditor/transformers/behaveToFlow';
import { hasPositionMetaData } from '../flowEditor/util/hasPositionMetaData';
import { autoLayout } from '../flowEditor/util/autoLayout';
import { useNodesState, useEdgesState } from 'reactflow';

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

const publicImageUrl = (path: string) => new URL(path, import.meta.url).href;

const defaultModelUrl = () => publicImageUrl(`/examples/models/${modelOptions[0]}`);

export const emptyGraphJson = (): GraphJSON => ({});

type ModelFile =
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

const useSaveAndLoad = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [modelFile, setModelFile] = useState<ModelFile>({
    fileUrl: defaultModelUrl(),
    fileType: 'url',
    fileContents: undefined,
  });

  const handleLoadBehaviorGraphJson = useCallback((graph: GraphJSON) => {
    const [nodes, edges] = behaveToFlow(graph);

    if (hasPositionMetaData(graph) === false) {
      autoLayout(nodes, edges);
    }

    setNodes(nodes);
    setEdges(edges);
  }, []);

  const handleSetModelAndBehaviorGraph = useCallback(
    ({ modelFile, graph }: { modelFile: ModelFile; graph: GraphJSON }) => {
      setModelFile(modelFile);
      handleLoadBehaviorGraphJson(graph);
    },
    []
  );

  const handleLoadBehaviorGraph = useCallback(
    (newValue: string) => {
      const graph = JSON.parse(newValue) as GraphJSON;

      handleLoadBehaviorGraphJson(graph);
    },
    [handleLoadBehaviorGraphJson]
  );

  useEffect(() => {
    const defaultGraph = publicImageUrl('/examples/graphs/ClickButtonToAnimate.json');
    (async () => {
      const fetched = await (await fetch(defaultGraph)).json();
      handleLoadBehaviorGraphJson(fetched as GraphJSON);
    })();
  }, [handleLoadBehaviorGraph]);

  const fileUrlToUse = modelFile.fileUrl || (modelFile.fileContents as string);

  const gltf = useGLTF(fileUrlToUse);

  return {
    gltf,
    handleSetModelAndBehaviorGraph,
    handleLoadBehaviorGraph,
    setModelFile,
    modelFileUrl: modelFile.fileUrl,
    nodes,
    edges,
    onEdgesChange,
    onNodesChange,
  };
};

export default useSaveAndLoad;

export type SaveAndLoadParams = ReturnType<typeof useSaveAndLoad>;
