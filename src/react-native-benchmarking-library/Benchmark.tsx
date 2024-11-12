import React from 'react';
import { useCallback, useState } from 'react';
import { Button, Text, View } from 'react-native';

export interface BenchmarkProps {
  name: string;
  run: () => Promise<void>;
}

export const Benchmark: React.FC<BenchmarkProps> = ({
  name,
  run,
}) => {
  const [benchmarkRunTime, setBenchmarkRunTime] = useState<number | null>(null);
  const [error, setError] = useState<Error>();
  const [running, setRunning] = useState(false);

  const onBeginBenchmark = useCallback(async () => {
    setRunning(true);
    const startTime = Date.now();
    await run().catch((err) => {
      setError(err);
    });
    const timeDelta = Date.now() - startTime;

    setRunning(false);
    setBenchmarkRunTime(timeDelta);
  }, [run]);

  if (error) {
    return <Text>{`${error}`}</Text>;
  }

  if (running) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text>Running benchmark, please wait</Text>
      </View>
    );
  }

  if (benchmarkRunTime) {
    const completedLabel = `${name}Completed`;
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontWeight: 'bold'}} testID={completedLabel} accessibilityValue={{text: `${benchmarkRunTime}`}}>Benchmark took: {benchmarkRunTime}ms</Text>
      </View>
    );
  }

  return <Button title={name} testID={name} onPress={onBeginBenchmark} />;
};
