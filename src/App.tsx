import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {
  BenchmarkHarness,
  BenchmarkDescriptor,
} from './react-native-benchmarking-library';
import {advancedDracoBenchmark, simpleDracoBenchmark} from './benchmarks/draco';
import {basisTranscoding, encoding} from './benchmarks/basis';

const DEFAULT_N_ITERATIONS = 1000;

// These benchmarks take longer to run per iteration. Total benchmark time should be no longer than 1 minute.
const MAX_BASIS_ENCODING_ITERATIONS = 5;
const MAX_BASIS_TRANSCODING_ITERATIONS = 100;

function App(): React.JSX.Element {
  const [numIterations, setNumIterations] = React.useState<string>(
    String(DEFAULT_N_ITERATIONS),
  );
  const BENCHMARK_MATRIX: BenchmarkDescriptor[] = useMemo(() => {
    const iterations = parseInt(numIterations, 10);
    return [
      {
        title: 'Draco: Decoding',
        benchmarkType: 'headless',
        benchmarkFn: simpleDracoBenchmark(iterations),
      },
      {
        title: 'Draco: Decoding + Attribute access',
        benchmarkType: 'headless',
        benchmarkFn: advancedDracoBenchmark(iterations),
      },
      {
        title: 'Basis: File Encoding To KTX2',
        benchmarkType: 'headless',
        benchmarkFn: encoding(
          Math.min(MAX_BASIS_ENCODING_ITERATIONS, iterations),
        ),
      },
      {
        title: 'Basis: File Transcoding From .basis',
        benchmarkType: 'headless',
        benchmarkFn: basisTranscoding(
          Math.min(MAX_BASIS_TRANSCODING_ITERATIONS, iterations),
        ),
      },
    ];
  }, [numIterations]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}>
      <Text style={styles.title}>IR Engine Benchmark suite</Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={styles.text}>Number of iterations</Text>
        <TextInput
          style={styles.input}
          onChangeText={setNumIterations}
          value={numIterations}
          placeholder="Number of iterations"
          keyboardType="numeric"
        />
      </View>
      <BenchmarkHarness items={BENCHMARK_MATRIX} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 30,
    width: '100%',
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 18,
    width: '100%',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 13,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '60%',
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 10,
  },
});

export default App;
