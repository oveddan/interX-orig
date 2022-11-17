import { GraphJSON } from 'behave-graph';
import { FC, useState, useEffect, useCallback, useMemo, CSSProperties } from 'react';
import { useReactFlow } from 'reactflow';
import { Modal } from './Modal';
import { useDropzone } from 'react-dropzone';

import { emptyGraphJson, fetchModelFile, publicUrl, SaveAndLoadParams } from '../../hooks/useSaveAndLoad';
import ModelPreview from '../../scene/ModelPreview';

const modelFiles = {
  courtyard: 'CourtYard.glb',
  pressButtonToStartElevator: 'PressButtonToStartElevator.gltf',
  suzanne: 'SpinningSuzanne.gltf',
};

const graphFiles = {
  animatedBuildingColor: 'animatedBuildingColor.json',
  clickButtonToAnimate: 'ClickButtonToAnimate.json',
  spinningSuzanne: 'SpinningSuzanne.json',
  tokenGatedClick: 'TokenGatedClick.json',
};

export const examplePairs: [string, string][] = [
  [modelFiles.pressButtonToStartElevator, graphFiles.clickButtonToAnimate],
  [modelFiles.courtyard, graphFiles.animatedBuildingColor],
  [modelFiles.suzanne, graphFiles.spinningSuzanne],
  [modelFiles.suzanne, graphFiles.tokenGatedClick],
];
// const examples = {
//   // clickToAnimate: ClickToAnimate as unknown as GraphJSON,
//   // spinningModel: SpinningModel as unknown as GraphJSON,
// } as Record<string, GraphJSON>;

export type LoadModalProps = {
  open?: boolean;
  onClose: () => void;
} & Pick<SaveAndLoadParams, 'handleSetModelAndBehaviorGraph'>;

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

const useDropZoneStyle = ({
  isFocused,
  isDragAccept,
  isDragReject,
}: {
  isFocused: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
}) => {
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  ) as CSSProperties;

  return style;
};

export const LoadModal: FC<LoadModalProps> = ({ open = false, onClose, handleSetModelAndBehaviorGraph }) => {
  const [behaviorGraphString, setBehaviorGraphString] = useState<string>();

  const [uploadedModelFile, setUploadedModelFile] = useState<File>();

  const instance = useReactFlow();

  useEffect(() => {
    // if reopening - clear the state
    if (open) {
      setUploadedModelFile(undefined);
      setBehaviorGraphString(undefined);
    }
  }, [open]);

  const handleLoad = useCallback(() => {
    console.log('loading');
    if (!uploadedModelFile) return;
    const graph = behaviorGraphString ? (JSON.parse(behaviorGraphString) as GraphJSON) : emptyGraphJson();

    handleSetModelAndBehaviorGraph({
      graph,
      modelFile: uploadedModelFile,
    });

    // TODO better way to call fit vew after edges render
    setTimeout(() => {
      instance.fitView();
    }, 100);

    handleClose();
  }, [handleSetModelAndBehaviorGraph, behaviorGraphString, uploadedModelFile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploadedModelFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'model/glb': ['.glb', '.gltf'],
    },
  });

  const style = useDropZoneStyle({
    isDragAccept,
    isDragReject,
    isFocused,
  });

  const handleClose = () => {
    setBehaviorGraphString(undefined);
    setSelectedExample('');
    onClose();
  };

  const exampleFileOptions = useMemo(
    () =>
      examplePairs.map(([modelFile, behaviorFile], i) => ({
        index: i,
        text: `Model: ${modelFile} / Behavior: ${behaviorFile}`,
        modelFile,
        behaviorFile,
      })),
    []
  );

  const [selectedExample, setSelectedExample] = useState('');

  useEffect(() => {
    if (selectedExample !== '') {
      const value = +selectedExample;

      const { modelFile, behaviorFile } = exampleFileOptions[value];

      const modelFileUrl = publicUrl(`/examples/models/${modelFile}`);
      const jsonFileUrl = publicUrl(`/examples/graphs/${behaviorFile}`);

      (async () => {
        const fetched = await (await fetch(jsonFileUrl)).json();

        const asJsonString = JSON.stringify(fetched, null, 2);
        setBehaviorGraphString(asJsonString);
      })();

      (async () => {
        setUploadedModelFile(await fetchModelFile(modelFileUrl, modelFile));
      })();
    }
  }, [selectedExample, exampleFileOptions]);

  return (
    <Modal
      title="Load Model and Behave Graph"
      actions={[
        { label: 'Cancel', onClick: handleClose },
        { label: 'Load', onClick: handleLoad },
      ]}
      open={open}
      onClose={onClose}
      width="4/5"
    >
      <div className="grid grid-cols-2 w-full h-32">
        {!uploadedModelFile && (
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
            {<p>Drag 'n' drop a gltf or glb model file here, or click to select a file</p>}
          </div>
        )}
        {uploadedModelFile && (
          <div>
            <ModelPreview file={uploadedModelFile} />
          </div>
        )}
        <textarea
          autoFocus
          className="border border-gray-300 p-2 align-top"
          placeholder="Paste Behave Graph JSON here"
          value={behaviorGraphString}
          onChange={(e) => setBehaviorGraphString(e.currentTarget.value)}
        ></textarea>
      </div>
      <div className="p-4 text-center text-gray-800">or</div>
      <select
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full p-3"
        onChange={(e) => setSelectedExample(e.target.value)}
        value={selectedExample}
      >
        <option disabled value="">
          Select an example
        </option>
        {exampleFileOptions.map(({ index, text }) => (
          <option key={index} value={index}>
            {text}
          </option>
        ))}
      </select>
    </Modal>
  );
};
