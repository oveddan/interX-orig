import { GraphJSON } from 'behave-graph';
import { FC, useState, useEffect, useCallback, useMemo, CSSProperties } from 'react';
import { useReactFlow } from 'reactflow';
import { Modal } from './Modal';
import { useDropzone } from 'react-dropzone';

// import ClickToAnimate from '../../exampleGraphs/ClickToAnimate.json';
// import SpinningModel from '../../exampleGraphs/SpinningSuzanne.json';
import { dataUrlFromFile, emptyGraphJson, SaveAndLoadParams } from '../../hooks/useSaveAndLoad';
import ModelPreview from '../../scene/ModelPreview';

const examples = {
  // clickToAnimate: ClickToAnimate as unknown as GraphJSON,
  // spinningModel: SpinningModel as unknown as GraphJSON,
} as Record<string, GraphJSON>;

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
  const [value, setValue] = useState<string>();
  const [selected, setSelected] = useState('');

  const [uploadedModelFile, setUploadedModelFile] = useState<File>();

  const instance = useReactFlow();

  useEffect(() => {
    // if reopening - clear the state
    if (open) {
      setUploadedModelFile(undefined);
      setValue(undefined);
    }
  }, [open]);

  const handleLoad = useCallback(() => {
    if (!uploadedModelFile) return;
    const graph = value ? (JSON.parse(value) as GraphJSON) : emptyGraphJson();

    (async () => {
      const modelUrl = await dataUrlFromFile(uploadedModelFile);

      handleSetModelAndBehaviorGraph({
        graph,
        modelFile: {
          fileContents: modelUrl as string,
          fileType: 'uploaded',
          fileUrl: undefined,
        },
      });

      // TODO better way to call fit vew after edges render
      setTimeout(() => {
        instance.fitView();
      }, 100);

      handleClose();
    })();
  }, [handleSetModelAndBehaviorGraph, value, uploadedModelFile]);

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
    setValue(undefined);
    setSelected('');
    onClose();
  };

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
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
        ></textarea>
      </div>
      <div className="p-4 text-center text-gray-800">or</div>
      <select
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full p-3"
        onChange={(e) => setSelected(e.target.value)}
        value={selected}
        disabled={!uploadedModelFile}
      >
        <option disabled value="">
          Select an example
        </option>
        <option value="spinningModel">Spinning Mdoel</option>
        <option value="clickToAnimate">Click to Animate</option>
      </select>
    </Modal>
  );
};
