import { BasisEncoder, BasisFile, KTX2File, initializeBasis } from '@callstack/react-native-basis-universal';
import { readFile } from '../utils/readFile';
import { NUM_ITERATIONS } from '../config';

function dumpKTX2FileDesc(ktx2File: KTX2File) {
  console.log('Width: ' + ktx2File.getWidth());
  console.log('Height: ' + ktx2File.getHeight());
  console.log('IsHDR: ' + ktx2File.isHDR());
  console.log('Faces: ' + ktx2File.getFaces());
  console.log('Layers: ' + ktx2File.getLayers());
  console.log('Levels: ' + ktx2File.getLevels());
  console.log('isUASTC: ' + ktx2File.isUASTC());
  console.log('isETC1S: ' + ktx2File.isETC1S());
  console.log('Format: ' + ktx2File.getFormat());
  console.log('Has alpha: ' + ktx2File.getHasAlpha());
  console.log('Total Keys: ' + ktx2File.getTotalKeys());
  console.log('DFD Size: ' + ktx2File.getDFDSize());
  console.log('DFD Color Model: ' + ktx2File.getDFDColorModel());
  console.log('DFD Color Primaries: ' + ktx2File.getDFDColorPrimaries());
  console.log('DFD Transfer Function: ' + ktx2File.getDFDTransferFunc());
  console.log('DFD Flags: ' + ktx2File.getDFDFlags());
  console.log('DFD Total Samples: ' + ktx2File.getDFDTotalSamples());
  console.log('DFD Channel0: ' + ktx2File.getDFDChannelID0());
  console.log('DFD Channel1: ' + ktx2File.getDFDChannelID1());
  console.log('Is Video: ' + ktx2File.isVideo());

  var dfdSize = ktx2File.getDFDSize();
  var dvdData = new Uint8Array(dfdSize); ktx2File.getDFD(dvdData);
  console.log('DFD bytes:' + dvdData.toString());
  console.log('--');

  console.log('--');
  console.log('Image level information:');
  let level_index;
  for (level_index = 0; level_index < ktx2File.getLevels(); level_index++) {
    var layer_index;
    for (
    layer_index = 0;
    layer_index < Math.max(1, ktx2File.getLayers());
    layer_index++
  ) {
      var face_index;
      for (face_index = 0; face_index < ktx2File.getFaces(); face_index++) {
        var imageLevelInfo = ktx2File.getImageLevelInfo(
          level_index,
          layer_index,
          face_index
        );

        if (!imageLevelInfo) {
          continue;
        }

        console.log(
          'level: ' +
            level_index +
            ' layer: ' +
            layer_index +
            ' face: ' +
            face_index
        );

        console.log('orig_width: ' + imageLevelInfo.origWidth);
        console.log('orig_height: ' + imageLevelInfo.origHeight);
        console.log('width: ' + imageLevelInfo.width);
        console.log('height: ' + imageLevelInfo.height);
        console.log('numBlocksX: ' + imageLevelInfo.numBlocksX);
        console.log('numBlocksY: ' + imageLevelInfo.numBlocksY);
        console.log('totalBlocks: ' + imageLevelInfo.totalBlocks);
        console.log('alphaFlag: ' + imageLevelInfo.alphaFlag);
        console.log('iframeFlag: ' + imageLevelInfo.iframeFlag);

        console.log('--');
      }
    }
  }
}

export const basisTranscoding = async (): Promise<void> => {
  const image = await readFile('desk.basis');
  initializeBasis();

  const basisFile = new BasisFile(new Uint8Array(image));

  const width = basisFile.getImageWidth(0, 0);
  const height = basisFile.getImageHeight(0, 0);
  const images = basisFile.getNumImages();
  const levels = basisFile.getNumLevels(0);
  const has_alpha = basisFile.getHasAlpha();
  const is_hdr = basisFile.isHDR();
  console.log({
    width,
    height,
    images,
    levels,
    has_alpha,
    is_hdr,
  });

  if (!basisFile.startTranscoding()) {
    console.log('startTranscoding failed');
    console.warn('startTranscoding failed');
    basisFile.close();
    basisFile.delete();
    return;
  }

  const format = 22; // cTFBC6H
  const dstSize = basisFile.getImageTranscodedSizeInBytes(0, 0, format);
  const dst = new Uint8Array(dstSize);

  console.log('Dst output', dst.slice(0, 100));
  console.log('Dst size: ', dstSize);

  if (!basisFile.transcodeImage(dst, 0, 0, format, 0, 0)) {
    console.log('basisFile.transcodeImage failed');
    console.warn('transcodeImage failed');
    basisFile.close();
    basisFile.delete();

    return;
  }

  console.log('Dst output after', dst.slice(0, 100));
  console.log('Dst size: ', dstSize);

  basisFile.close();
  basisFile.delete();
};

export const encoding = async (): Promise<void> => {
  initializeBasis();

  for (let i = 0; i < NUM_ITERATIONS; i++) {
    const image = await readFile('desk.exr');
    const basisEncoder = new BasisEncoder();
    basisEncoder.setCreateKTX2File(true);
    basisEncoder.setKTX2UASTCSupercompression(true);
    basisEncoder.setKTX2SRGBTransferFunc(true);

    const useHDR = true;


    if (useHDR) {
      basisEncoder.setSliceSourceImageHDR(0, image, 0, 0, 3, true);
      basisEncoder.setHDR(true);
    } else {
      basisEncoder.setSliceSourceImage(0, new Uint8Array(image), 0, 0, true);
    }

    basisEncoder.setDebug(false);
    basisEncoder.setComputeStats(false);
    basisEncoder.setQualityLevel(255);
    basisEncoder.setMipSRGB(true);
    basisEncoder.setMipGen(false);

    // Create a destination buffer to hold the compressed .basis file data. If this buffer isn't large enough compression will fail.
    const ktx2FileData = new Uint8Array(1024 * 1024 * 24);
    const numOutputBytes = basisEncoder.encode(ktx2FileData);

    basisEncoder.delete();

    const actualKTX2FileData = new Uint8Array(
      ktx2FileData.buffer,
      0,
      numOutputBytes
    );

    const ktx2File = new KTX2File(new Uint8Array(actualKTX2FileData));

    dumpKTX2FileDesc(ktx2File);

    if (!ktx2File.startTranscoding()) {
      console.warn('startTranscoding failed');
      return;
    }

    const format = 22; // cTFBC6H
    const dstSize = ktx2File.getImageTranscodedSizeInBytes(0, 0, 0, format);
    const dst = new Uint8Array(dstSize);

    console.log('Dst output', dst.slice(0, 100));
    console.log('Dst size: ' + dstSize);

    if (!ktx2File.transcodeImage(dst, 0, 0, 0, format, 0, -1, -1)) {
      ktx2File.close();
      ktx2File.delete();
      return;
    }

    console.log('Dst output after', dst.slice(0, 100));

    ktx2File.close();
    ktx2File.delete();
  }

  return Promise.resolve();
};
