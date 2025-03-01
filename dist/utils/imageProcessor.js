"use strict";
/**
 * Image processing utility module
 *
 * This module provides functions for processing images using the Sharp library.
 * It handles resizing images while maintaining aspect ratio if only one dimension is provided.
 *
 * @module imageProcessor
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageExists = exports.processImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define paths for original and processed images
const inputFolder = path_1.default.resolve(__dirname, '../../images');
const outputFolder = path_1.default.resolve(__dirname, '../../public/images/processed');
/**
 * Ensures that the output directory exists for processed images
 * Creates the directory if it doesn't exist
 */
const ensureOutputFolderExists = () => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the output folder exists, and create it if it doesn't
    if (!fs_1.default.existsSync(outputFolder)) {
        try {
            // Use recursive option to create parent directories if needed
            yield fs_1.default.promises.mkdir(outputFolder, { recursive: true });
            console.log(`Created output directory: ${outputFolder}`);
        }
        catch (error) {
            console.error('Error creating output directory:', error);
            throw new Error(`Failed to create output directory: ${error}`);
        }
    }
});
/**
 * Generates a filename for the processed image based on its original name and processing options
 *
 * @param options - The image processing options
 * @returns A string representing the unique filename for the processed image
 */
const generateProcessedFilename = (options) => {
    // Extract the original filename without extension
    const fileNameWithoutExt = path_1.default.parse(options.filename).name;
    // Get the extension from the original file or use the specified format
    const extension = options.format || path_1.default.parse(options.filename).ext.replace('.', '') || 'jpg';
    // Create a unique filename based on dimensions and format
    const dimensions = options.width || options.height
        ? `_${options.width || 'auto'}x${options.height || 'auto'}`
        : '';
    return `${fileNameWithoutExt}${dimensions}.${extension}`;
};
/**
 * Processes an image according to the provided options
 *
 * @param options - The image processing options
 * @returns A promise that resolves to the path of the processed image
 */
const processImage = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure output folder exists
        yield ensureOutputFolderExists();
        // Construct the input and output file paths
        const inputPath = path_1.default.join(inputFolder, options.filename);
        const outputFilename = generateProcessedFilename(options);
        const outputPath = path_1.default.join(outputFolder, outputFilename);
        // Check if the input file exists
        if (!fs_1.default.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }
        // Initialize Sharp with the input file
        let imageProcess = (0, sharp_1.default)(inputPath);
        // Apply resizing if width or height is specified
        if (options.width || options.height) {
            imageProcess = imageProcess.resize({
                width: options.width,
                height: options.height,
                fit: 'contain', // Maintain aspect ratio
                background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
            });
        }
        // Convert format if specified
        if (options.format) {
            imageProcess = imageProcess.toFormat(options.format);
        }
        // Write the processed image to the output path
        yield imageProcess.toFile(outputPath);
        console.log(`Image processed successfully: ${outputPath}`);
        return outputPath;
    }
    catch (error) {
        console.error('Error processing image:', error);
        throw new Error(`Failed to process image: ${error}`);
    }
});
exports.processImage = processImage;
/**
 * Checks if an image exists in the input folder
 *
 * @param filename - The name of the image file to check
 * @returns A promise that resolves to a boolean indicating if the file exists
 */
const imageExists = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path_1.default.join(inputFolder, filename);
    try {
        yield fs_1.default.promises.access(filePath, fs_1.default.constants.F_OK);
        return true;
    }
    catch (_a) {
        return false;
    }
});
exports.imageExists = imageExists;
exports.default = {
    processImage: exports.processImage,
    imageExists: exports.imageExists,
    inputFolder,
    outputFolder
};
