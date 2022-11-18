import { GraphJSON } from 'behave-graph';
import { CIDString } from 'web3.storage';
import { makeWeb3StorageClient } from './web3Storage';

// source: https://stackoverflow.com/questions/12168909/blob-from-dataurl
async function dataURItoBlob(dataURI: string) {
  return await (await fetch(dataURI)).blob();
}

export const createFileFromUrl = async (dataUri: string, fileName: string) => {
  const blob = await dataURItoBlob(dataUri);

  const file = new File([blob], fileName);

  return file;
};

export const createJsonFileFromObject = (object: Object, fileName: string) => {
  const fileContents = JSON.stringify(object);

  const blob = new Blob([fileContents], { type: 'application/json' });

  const file = new File([blob], fileName);

  return file;
};

export const modelFileName = 'model.gltf';
export const behaviorGraphFileName = 'behavior-graph.json';

const toFileInIpfsFolder = (cid: CIDString, file: File | undefined) => {
  if (!file) return undefined;

  return `ipfs://${cid}/${file.name}`;
};

export const saveInteractiveWorldToIpfs = async ({
  modelFile,
  behaviorGraph,
}: {
  modelFile: File;
  behaviorGraph: GraphJSON;
}) => {
  const behaviorGraphFile = createJsonFileFromObject(behaviorGraph, behaviorGraphFileName);

  const client = makeWeb3StorageClient();

  const renamedFile = new File([modelFile], modelFileName);

  const cid = await client.put([renamedFile, behaviorGraphFile]);

  const modelFileUrl = toFileInIpfsFolder(cid, modelFile) as string;
  const behaviorGraphUrl = toFileInIpfsFolder(cid, behaviorGraphFile) as string;

  return {
    cid,
    modelFileUrl,
    behaviorGraphUrl,
  };
};
