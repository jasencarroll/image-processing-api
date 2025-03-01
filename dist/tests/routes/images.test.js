"use strict";
/**
 * Tests for the images API endpoint
 *
 * This file contains tests for the images API routes.
 * It verifies that the API handles requests correctly and returns appropriate responses.
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
const supertest_1 = __importDefault(require("supertest"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const images_1 = __importDefault(require("../../routes/images"));
// Create a test app for the tests
const app = (0, express_1.default)();
app.use('/api/images', images_1.default);
const request = (0, supertest_1.default)(app);
// Sample image filename for testing - using an actual image from the images folder
const sampleImageFilename = 'encenadaport.jpg';
// Setup function to ensure processed directory exists
beforeAll(() => {
    const outputFolder = path_1.default.resolve(__dirname, '../../../public/images/processed');
    if (!fs_1.default.existsSync(outputFolder)) {
        fs_1.default.mkdirSync(outputFolder, { recursive: true });
    }
});
// Helper function to check if the sample image exists
const checkImageExists = () => {
    const inputFolder = path_1.default.resolve(__dirname, '../../../images');
    return fs_1.default.existsSync(path_1.default.join(inputFolder, sampleImageFilename));
};
describe('Images API Endpoint', () => {
    it('should return 400 if filename parameter is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images');
        expect(response.status).toBe(400);
        expect(response.text).toContain('Missing required parameter: filename');
    }));
    it('should return 404 if image does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images?filename=non-existent-image.jpg');
        expect(response.status).toBe(404);
        expect(response.text).toContain('not found');
    }));
    it('should return 400 if width or height is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        if (!checkImageExists()) {
            // Skip test if sample image doesn't exist
            console.log('Skipping test: sample image does not exist');
            return;
        }
        const response = yield request.get(`/api/images?filename=${sampleImageFilename}&width=invalid`);
        expect(response.status).toBe(400);
        expect(response.text).toContain('Width and height must be positive numbers');
    }));
    it('should process an image successfully with valid parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        if (!checkImageExists()) {
            // Skip test if sample image doesn't exist
            return;
        }
        const response = yield request.get(`/api/images?filename=${sampleImageFilename}&width=300&height=200`);
        expect(response.status).toBe(200);
        expect(response.type).toMatch(/image\/jpeg/);
    }));
    it('should process an image with only width parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        if (!checkImageExists()) {
            // Skip test if sample image doesn't exist
            return;
        }
        const response = yield request.get(`/api/images?filename=${sampleImageFilename}&width=300`);
        expect(response.status).toBe(200);
        expect(response.type).toMatch(/image\/jpeg/);
    }));
    it('should convert image format if format parameter is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        if (!checkImageExists()) {
            // Skip test if sample image doesn't exist
            return;
        }
        const response = yield request.get(`/api/images?filename=${sampleImageFilename}&format=png`);
        expect(response.status).toBe(200);
        expect(response.type).toMatch(/image\/png/);
    }));
    it('should use cached image on subsequent requests', () => __awaiter(void 0, void 0, void 0, function* () {
        if (!checkImageExists()) {
            // Skip test if sample image doesn't exist
            return;
        }
        // First request to process the image
        yield request.get(`/api/images?filename=${sampleImageFilename}&width=300&height=200`);
        // Second request should use cached version
        const start = Date.now();
        const response = yield request.get(`/api/images?filename=${sampleImageFilename}&width=300&height=200`);
        const end = Date.now();
        expect(response.status).toBe(200);
        // Cached response should be fast (less than 100ms)
        // This is a soft test and might need adjustment based on your environment
        expect(end - start).toBeLessThan(100);
    }));
});
