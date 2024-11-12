/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BasisEncoder,
  BasisFile,
  KTX2File,
  initializeBasis,
} from '@callstack/react-native-basis-universal';
import {readFile} from '../utils/readFile';

function dumpKTX2FileDesc(ktx2File: KTX2File) {
  ktx2File.getWidth();
  ktx2File.getHeight();
  ktx2File.isHDR();
  ktx2File.getFaces();
  ktx2File.getLayers();
  ktx2File.getLevels();
  ktx2File.isUASTC();
  ktx2File.isETC1S();
  ktx2File.getFormat();
  ktx2File.getHasAlpha();
  ktx2File.getTotalKeys();
  ktx2File.getDFDSize();
  ktx2File.getDFDColorModel();
  ktx2File.getDFDColorPrimaries();
  ktx2File.getDFDTransferFunc();
  ktx2File.getDFDFlags();
  ktx2File.getDFDTotalSamples();
  ktx2File.getDFDChannelID0();
  ktx2File.getDFDChannelID1();
  ktx2File.isVideo();

  var dfdSize = ktx2File.getDFDSize();
  var dvdData = new Uint8Array(dfdSize);
  ktx2File.getDFD(dvdData);

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
          face_index,
        );

        if (!imageLevelInfo) {
          continue;
        }

        const _ = {
          origWidth: imageLevelInfo.origWidth,
          origHeight: imageLevelInfo.origHeight,
          width: imageLevelInfo.width,
          height: imageLevelInfo.height,
          numBlocksX: imageLevelInfo.numBlocksX,
          numBlocksY: imageLevelInfo.numBlocksY,
          totalBlocks: imageLevelInfo.totalBlocks,
          alphaFlag: imageLevelInfo.alphaFlag,
          iframeFlag: imageLevelInfo.iframeFlag,
        };
      }
    }
  }
}

export const basisTranscoding =
  (iterations: number) => async (): Promise<void> => {
    const image = await readFile('desk.basis');
    initializeBasis();

    for (let i = 0; i < iterations; i++) {
      const basisFile = new BasisFile(new Uint8Array(image));

      const width = basisFile.getImageWidth(0, 0);
      const height = basisFile.getImageHeight(0, 0);
      const images = basisFile.getNumImages();
      const levels = basisFile.getNumLevels(0);
      const has_alpha = basisFile.getHasAlpha();
      const is_hdr = basisFile.isHDR();
      const _ = {
        width,
        height,
        images,
        levels,
        has_alpha,
        is_hdr,
      };

      if (!basisFile.startTranscoding()) {
        basisFile.close();
        basisFile.delete();
        return;
      }

      const format = 22; // cTFBC6H
      const dstSize = basisFile.getImageTranscodedSizeInBytes(0, 0, format);
      const dst = new Uint8Array(dstSize);

      if (!basisFile.transcodeImage(dst, 0, 0, format, 0, 0)) {
        basisFile.close();
        basisFile.delete();

        return;
      }

      basisFile.close();
      basisFile.delete();
    }

    return Promise.resolve();
  };

export const encoding = (iterations: number) => async (): Promise<void> => {
  initializeBasis();

  for (let i = 0; i < iterations; i++) {
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
      numOutputBytes,
    );

    const ktx2File = new KTX2File(new Uint8Array(actualKTX2FileData));

    dumpKTX2FileDesc(ktx2File);

    if (!ktx2File.startTranscoding()) {
      return;
    }

    const format = 22; // cTFBC6H
    const dstSize = ktx2File.getImageTranscodedSizeInBytes(0, 0, 0, format);
    const dst = new Uint8Array(dstSize);

    if (!ktx2File.transcodeImage(dst, 0, 0, 0, format, 0, -1, -1)) {
      if (!ktx2File.transcodeImage(dst, 0, 0, 0, format, 0, -1, -1)) {
        ktx2File.close();

        ktx2File.close();
        ktx2File.delete();
      }
    }
  }

  return Promise.resolve();
};
