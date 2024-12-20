import React from 'react';
import { StyleSheet, View, PixelRatio } from 'react-native';
import { Canvas, useCanvasEffect } from 'react-native-wgpu';
import { CanvasContext } from './types';

export type graphicsBenchmarkFn = (
  context: CanvasContext,
  device: GPUDevice,
  canvas: HTMLCanvasElement,
  requestAnimationFrame: (callback: (time: number) => void) => number
) => Promise<void>;

export const WebGpuBenchmark: React.FC<{
  onComplete: (startTime: number) => void;
  onError: (err: Error) => void;
  run: graphicsBenchmarkFn;
}> = ({ onComplete, run, onError }) => {
  const ref = useCanvasEffect(async () => {
    const startTime = Date.now();
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('No adapter');
    }

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const requiredFeatures: GPUFeatureName[] =
      presentationFormat === 'bgra8unorm' ? ['bgra8unorm-storage'] : [];

    const device = await adapter.requestDevice({
      requiredFeatures,
    });

    const context = ref.current!.getContext('webgpu')!;
    const canvas = context.canvas as HTMLCanvasElement;
    canvas.width = canvas.clientWidth * PixelRatio.get();
    canvas.height = canvas.clientHeight * PixelRatio.get();

    if (!context) {
      throw new Error('No context');
    }

    context.configure({
      device,
      format: presentationFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
      alphaMode: 'opaque',
    });

    try {
      await run(context, device, canvas, requestAnimationFrame);
      onComplete(startTime);
    } catch (err) {
      onError(new Error(`Test failed with error: ${err}`));
    }
  });

  return (
    <View style={style.container}>
      <Canvas ref={ref} style={style.webgpu} />
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  webgpu: {
    flex: 1,
  },
});
