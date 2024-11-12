"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseBenchmarks_1 = require("./parseBenchmarks");
const path_1 = __importDefault(require("path"));
const benchmarkPath = path_1.default.resolve(process.cwd(), "benchmarks");
const outputPath = path_1.default.resolve(process.cwd(), "benchmark.json");
const bundlePath = path_1.default.resolve(process.cwd(), "bundleDist/main.ios.jsbundle");
const executablePath = path_1.default.resolve(process.cwd(), "jscBenchmarking.ipa");
(0, parseBenchmarks_1.parseBenchmarks)(benchmarkPath, bundlePath, executablePath, outputPath);
