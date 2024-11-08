import React from 'react';
import {
  ScrollView,
  Text,
} from 'react-native';
import { BenchmarkHarness, BenchmarkDescriptor } from 'react-native-benchmarking-library';
import { advancedDracoBenchmark, simpleDracoBenchmark } from './benchmarks/draco';
import { basisTranscoding, encoding } from './benchmarks/basis';


const BENCHMARK_MATRIX: BenchmarkDescriptor[] = [
  {
    title: 'DracoDecoderModule - Simple file decoding',
    benchmarkType: 'headless',
    benchmarkFn: simpleDracoBenchmark,
  },
  {
    title: 'DracoDecoderModule - Simple file decoding + Attribute access',
    benchmarkType: 'headless',
    benchmarkFn: advancedDracoBenchmark,
  },
  {
    title: 'Basis - File Encoding To KTX2',
    benchmarkType: 'headless',
    benchmarkFn: encoding,
  },
  {
    title: 'Basis - File Transcoding From .basis',
    benchmarkType: 'headless',
    benchmarkFn: basisTranscoding,
  },
];

function App(): React.JSX.Element {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={{fontSize: 30, width: '100%', textAlign: 'center'}}>IR Engine Benchmark suite</Text>

      <BenchmarkHarness items={BENCHMARK_MATRIX} />
    </ScrollView>
  );
}

export default App;
