"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBenchmarkType = exports.parseBenchmarks = void 0;
const promises_1 = require("fs/promises");
const child_process_1 = require("child_process");
const xml2js_1 = require("xml2js");
function parseBenchmarks(pathToBenchmarks, bundlePath, executablePath, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield (0, promises_1.readdir)(pathToBenchmarks, {
            recursive: true,
        });
        const benchmarkEntries = yield processBenchmarkFiles(pathToBenchmarks, files);
        const bundleSizeEntry = yield processBundleSize(bundlePath, "Bundle Size").catch((err) => {
            console.error(err);
            return null;
        });
        if (bundleSizeEntry) {
            benchmarkEntries.push(bundleSizeEntry);
        }
        const executableSizeEntry = yield processBundleSize(executablePath, "Executable Size").catch((err) => {
            console.error(err);
            return null;
        });
        if (executableSizeEntry) {
            benchmarkEntries.push(executableSizeEntry);
        }
        yield (0, promises_1.writeFile)(outputPath, JSON.stringify(benchmarkEntries));
    });
}
exports.parseBenchmarks = parseBenchmarks;
function processBenchmarkFiles(parentPath, files) {
    return __awaiter(this, void 0, void 0, function* () {
        const benchmarkEntries = [];
        for (const file of files) {
            const benchmarkType = parseBenchmarkType(file);
            if (!benchmarkType) {
                continue;
            }
            const benchmarkPath = `${parentPath}/${file}`;
            const result = yield (0, promises_1.readFile)(benchmarkPath, "utf-8");
            benchmarkEntries.push(createBenchmarkEntry(file, result, benchmarkType));
        }
        return benchmarkEntries;
    });
}
function processBundleSize(bundlePath, name) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const output = yield new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`du -k ${bundlePath}`, { encoding: "utf8" }, (err, stdout, stderr) => {
                if (stderr.length > 0) {
                    console.error(stderr);
                }
                if (err) {
                    reject(err);
                }
                else {
                    resolve(stdout);
                }
            });
        });
        const bundleSizeKib = (_a = output.match(/^\d+/)) === null || _a === void 0 ? void 0 : _a.at(0);
        if (!bundleSizeKib) {
            throw new Error(`Failed to parse file size from du result: ${output}`);
        }
        return createBenchmarkEntry(name, bundleSizeKib, "kiB");
    });
}
function processXmlProfile(xmlPath, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const xmlProfile = yield (0, promises_1.readFile)(xmlPath, "utf-8");
        const parsedXml = yield (0, xml2js_1.parseStringPromise)(xmlProfile);
        console.log(parsedXml);
    });
}
function createBenchmarkEntry(file, result, unit) {
    return {
        name: file,
        unit,
        value: parseInt(result),
    };
}
function parseBenchmarkType(fileName) {
    const matches = [...fileName.matchAll(/-(\w+)\.txt/g)];
    const match = matches.at(0);
    if (!match) {
        return undefined;
    }
    // Return first match group
    return match.at(1);
}
exports.parseBenchmarkType = parseBenchmarkType;
