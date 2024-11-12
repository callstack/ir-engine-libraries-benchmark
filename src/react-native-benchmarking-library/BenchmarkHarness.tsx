import React from 'react';

import {  View } from 'react-native';
import { Benchmark } from './Benchmark';
import { JavaScriptEngineVersion } from './JavascriptEngineVersion';
import { GraphicsBenchmark } from './GraphicsBenchmark';
import { graphicsBenchmarkFn } from './WebGpuBenchmark';

export type BenchmarkDescriptor =
  | {
      benchmarkType: 'headless';
      title: string;
      benchmarkFn: () => Promise<void>;
    }
  | {
      benchmarkType: 'graphics';
      title: string;
      benchmarkFn: graphicsBenchmarkFn;
    };

export const BenchmarkHarness: React.FC<{ items: BenchmarkDescriptor[] }> = ({
  items,
}) => {

  return (
    <>
      <View
        style={{ flex: 1 }}
        accessibilityLabel="benchmarkView"
      >
         <JavaScriptEngineVersion />
        {items.map(({ benchmarkType, title, benchmarkFn }) => {
          switch (benchmarkType) {
            case 'graphics':
              return (
                <GraphicsBenchmark run={benchmarkFn} name={title} key={title} />
              );
            case 'headless':
            default:
              return (
                <Benchmark
                  name={title}
                  run={benchmarkFn}
                  key={title}
                />
              );
          }
        })}
      </View>
    </>
  );
};
