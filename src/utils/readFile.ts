import RNFetchBlob from 'react-native-blob-util';
import {decode as atob} from 'base-64';


export const readFile = async (path: string, base64: boolean = false): Promise<Uint8Array> => {
  const filePath = RNFetchBlob.fs.asset(path);
  const data = await RNFetchBlob.fs.readFile(filePath, 'base64');
  if (base64) {
    return data;
  }
  const byteCharacters = atob(data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Uint8Array(byteNumbers);
};
