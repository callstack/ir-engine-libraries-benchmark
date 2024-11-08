import { NUM_ITERATIONS } from '../config';
import { readFile } from '../utils/readFile';
import {
  DracoDecoderModule,
  EncodedGeometryType,
  GeometryAttribute,
} from '@callstack/react-native-draco';

const defaultAttributeIDs = {
  position: 'POSITION',
  normal: 'NORMAL',
  color: 'COLOR',
  uv: 'TEX_COORD',
};

const defaultAttributeTypes = {
  position: 'Float32Array',
  normal: 'Float32Array',
  color: 'Float32Array',
  uv: 'Float32Array',
};

export const simpleDracoBenchmark = async (): Promise<void> => {
  try {
    const decoderModule = DracoDecoderModule();
    const decoder = new decoderModule.Decoder();

    for (let i = 0; i < NUM_ITERATIONS; i++) {
      const byteArray = await readFile('bunny.drc');
      const buffer = new decoderModule.DecoderBuffer();
      buffer.Init(byteArray, byteArray.length);

      const geometryType = decoder.GetEncodedGeometryType(buffer);

      let outputGeometry;
      let status: number;

      if (geometryType === decoderModule.TRIANGULAR_MESH) {
        outputGeometry = new decoderModule.Mesh();
        status = decoder.DecodeBufferToMesh(buffer, outputGeometry);
      } else {
        outputGeometry = new decoderModule.PointCloud();
        status = decoder.DecodeBufferToPointCloud(buffer, outputGeometry);
      }

      console.log('Draco Decoder finished decoding!', status);

      // Clean up resources
      decoderModule.destroy(buffer);
      decoderModule.destroy(outputGeometry);
    }
  } catch (error) {
    console.error('Error in Draco benchmark:', error);
  }

  return Promise.resolve();
};

export const advancedDracoBenchmark = async (): Promise<void> => {
  try {
    const decoderModule = DracoDecoderModule();
    const decoder = new decoderModule.Decoder();

    for (let i = 0; i < NUM_ITERATIONS; i++) {
      const byteArray = await readFile('bunny.drc');
      const buffer = new decoderModule.DecoderBuffer();
      buffer.Init(byteArray, byteArray.length);

      const geometryType = decoder.GetEncodedGeometryType(buffer);
      console.log({ geometryType: EncodedGeometryType[geometryType] });

      let outputGeometry;
      let status: number;

      if (geometryType === decoderModule.TRIANGULAR_MESH) {
        outputGeometry = new decoderModule.Mesh();
        status = decoder.DecodeBufferToMesh(buffer, outputGeometry);
      } else {
        outputGeometry = new decoderModule.PointCloud();
        status = decoder.DecodeBufferToPointCloud(buffer, outputGeometry);
      }

      console.log('Draco Decoder finished decoding!', status);

    if ('num_faces' in outputGeometry) {
      const num_faces = outputGeometry.num_faces();
      console.log({ num_faces });
    }
    const num_points = outputGeometry.num_points();

    console.log({ num_points });

    const useUniqueIDs = true;

    // const geometry = { index: null, attributes: [] };

    for (const attributeName in defaultAttributeIDs) {
      // @ts-ignore
      const attributeType = defaultAttributeTypes[attributeName];

      console.log({ attributeName, attributeType });

      let attribute;
      let attributeID;

      if (useUniqueIDs) {
        // @ts-ignore
        attributeID = defaultAttributeIDs[attributeName];
        attribute = decoder.GetAttributeByUniqueId(outputGeometry, attributeID);
      } else {
        attributeID = decoder.GetAttributeId(
          outputGeometry,
          // @ts-ignore
          GeometryAttribute[defaultAttributeIDs[attributeName]]
        );

        if (attributeID === -1) {continue;}

        attribute = decoder.GetAttribute(outputGeometry, attributeID);
      }

      const numComponents = attribute.num_components();
      const numValues = num_points * numComponents;
      const byteLength = numValues * 4;
      const dataType = attribute.data_type();

      const outputArray = new Float32Array(numValues);

      // NOTE: This API is different from Draco.js api as it relied on wasm memory. Has to be adjusted in IR-Engine.
      decoder.GetAttributeDataArrayForAllPoints(
        outputGeometry,
        attribute,
        dataType,
        byteLength,
        outputArray
      );
    }

    if (
      'num_faces' in outputGeometry &&
      geometryType === decoderModule.TRIANGULAR_MESH
    ) {
      // Generate mesh faces.
      var numFaces = outputGeometry.num_faces();
      var numIndices = numFaces * 3;
      var dataSize = numIndices * 4;
      // NOTE: This API is different from Draco.js api as it relied on wasm memory. Has to be adjusted in IR-Engine.
      const outputArray = new Uint32Array(dataSize);
      decoder.GetTrianglesUInt32Array(outputGeometry, dataSize, outputArray);
    }

    // You must explicitly delete objects created from the DracoDecoderModule
    // or Decoder.
    decoderModule.destroy(outputGeometry);
    decoderModule.destroy(decoder);
    decoderModule.destroy(buffer);

      // Clean up resources
      decoderModule.destroy(buffer);
      decoderModule.destroy(outputGeometry);
    }
  } catch (error) {
    console.error('Error in Draco benchmark:', error);
  }

  return Promise.resolve();
};


