"use strict";
/**
 * Tests for the image processor utility
 *
 * This file contains tests for the image processing functionality.
 * It verifies that images can be resized and processed correctly.
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const imageProcessor_1 = require("../../utils/imageProcessor");
// Sample image filename for testing - using an actual image from the images folder
const sampleImageFilename = 'encenadaport.jpg';
// Test setup function to ensure directories exist
const setupTests = () => __awaiter(void 0, void 0, void 0, function* () {
    // Ensure input directory exists
    const inputFolder = path_1.default.resolve(__dirname, '../../../images');
    if (!fs_1.default.existsSync(inputFolder)) {
        yield fs_1.default.promises.mkdir(inputFolder, { recursive: true });
    }
    // Ensure output directory exists
    const outputFolder = path_1.default.resolve(__dirname, '../../../public/images/processed');
    if (!fs_1.default.existsSync(outputFolder)) {
        yield fs_1.default.promises.mkdir(outputFolder, { recursive: true });
    }
    // Check if sample image exists
    const sampleImagePath = path_1.default.join(inputFolder, sampleImageFilename);
    if (!fs_1.default.existsSync(sampleImagePath)) {
        console.warn(`
      Test Warning: Sample image '${sampleImageFilename}' does not exist in the images folder.
      Tests will be skipped until a sample image is available.
    `);
    }
});
// Run setup before tests
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield setupTests();
}));
describe('Image Processor Utility', () => {
    // Skip tests if sample image doesn't exist
    const checkImageExists = () => {
        const inputFolder = path_1.default.resolve(__dirname, '../../../images');
        return fs_1.default.existsSync(path_1.default.join(inputFolder, sampleImageFilename));
    };
    describe('imageExists function', () => {
        it('should return true for existing images', () => __awaiter(void 0, void 0, void 0, function* () {
            if (!checkImageExists()) {
                return; // Skip test if sample image doesn't exist
            }
            const exists = yield (0, imageProcessor_1.imageExists)(sampleImageFilename);
            expect(exists).toBe(true);
        }));
        it('should return false for non-existing images', () => __awaiter(void 0, void 0, void 0, function* () {
            const exists = yield (0, imageProcessor_1.imageExists)('non-existent-image.jpg');
            expect(exists).toBe(false);
        }));
    });
    describe('processImage function', () => {
        it('should process an image with width and height parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            if (!checkImageExists()) {
                return; // Skip test if sample image doesn't exist
            }
            const options = {
                filename: sampleImageFilename,
                width: 300,
                height: 200
            };
            const processedPath = yield (0, imageProcessor_1.processImage)(options);
            // Check if the processed file exists
            expect(fs_1.default.existsSync(processedPath)).toBe(true);
            // Clean up the processed file
            if (fs_1.default.existsSync(processedPath)) {
                fs_1.default.unlinkSync(processedPath);
            }
        }));
        it('should process an image with only width parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            if (!checkImageExists()) {
                return; // Skip test if sample image doesn't exist
            }
            const options = {
                filename: sampleImageFilename,
                width: 300
            };
            const processedPath = yield (0, imageProcessor_1.processImage)(options);
            // Check if the processed file exists
            expect(fs_1.default.existsSync(processedPath)).toBe(true);
            // Clean up the processed file
            if (fs_1.default.existsSync(processedPath)) {
                fs_1.default.unlinkSync(processedPath);
            }
        }));
        it('should process an image with format conversion', () => __awaiter(void 0, void 0, void 0, function* () {
            if (!checkImageExists()) {
                return; // Skip test if sample image doesn't exist
            }
            const options = {
                filename: sampleImageFilename,
                format: 'png'
            };
            const processedPath = yield (0, imageProcessor_1.processImage)(options);
            // Check if the processed file exists and has the right extension
            expect(fs_1.default.existsSync(processedPath)).toBe(true);
            expect(path_1.default.extname(processedPath).toLowerCase()).toBe('.png');
            // Clean up the processed file
            if (fs_1.default.existsSync(processedPath)) {
                fs_1.default.unlinkSync(processedPath);
            }
        }));
        it('should throw an error for non-existent input files', () => __awaiter(void 0, void 0, void 0, function* () {
            const options = {
                filename: 'non-existent-image.jpg',
                width: 300,
                height: 200
            };
            yield expect((0, imageProcessor_1.processImage)(options)).rejects.toThrow('Input file not found');
        }));
    });
});
