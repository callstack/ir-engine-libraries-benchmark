import {
  benchmarkWithMemoryProfiler,
  benchmarkWithProfiler,
  benchmarkWithWallClockTime,
} from "./runTest";

const runBenchmarkSuite = async () => {
  console.log("Running benchmarks with wall clock time");
  await benchmarkWithWallClockTime("Draco: Decoding");
  await benchmarkWithWallClockTime("Draco: Decoding + Attribute access");
  await benchmarkWithWallClockTime("Basis: File Encoding To KTX2");
  await benchmarkWithWallClockTime("Basis: File Transcoding From .basis");


  console.log("Running benchmarks with profiler");
  await benchmarkWithMemoryProfiler("Draco: Decoding", true);
  await benchmarkWithProfiler("Draco: Decoding");
  await benchmarkWithProfiler("Draco: Decoding + Attribute access");
  await benchmarkWithProfiler("Basis: File Encoding To KTX2");
  await benchmarkWithProfiler("Basis: File Transcoding From .basis");
};

runBenchmarkSuite();
