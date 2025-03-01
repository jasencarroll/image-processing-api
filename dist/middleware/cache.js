"use strict";
/**
 * Image Caching Middleware
 *
 * This middleware checks if a requested image with the same processing parameters
 * already exists in the cache. If it does, it serves the cached version instead
 * of regenerating the image.
 *
 * @module cache
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
exports.cacheMiddleware = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Path to the output folder for processed images
const outputFolder = path_1.default.resolve(__dirname, '../../public/images/processed');
/**
 * Generates a cache key based on the image processing options
 * This key uniquely identifies a processed image variant
 *
 * @param options - The image processing options
 * @returns A string representing the cache key
 */
const generateCacheKey = (options) => {
    // Extract the filename without extension
    const fileNameWithoutExt = path_1.default.parse(options.filename).name;
    // Get the extension or use jpg as default
    const extension = options.format || path_1.default.parse(options.filename).ext.replace('.', '') || 'jpg';
    // Create a unique filename based on dimensions and format
    const dimensions = options.width || options.height
        ? `_${options.width || 'auto'}x${options.height || 'auto'}`
        : '';
    return `${fileNameWithoutExt}${dimensions}.${extension}`;
};
/**
 * Checks if an image with the given processing options exists in the cache
 *
 * @param options - The image processing options
 * @returns A promise that resolves to the cached file path if found, or null if not found
 */
const checkCache = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate the expected filename based on processing options
        const cachedFilename = generateCacheKey(options);
        const cachedFilePath = path_1.default.join(outputFolder, cachedFilename);
        // Check if the file exists
        if (fs_1.default.existsSync(cachedFilePath)) {
            console.log(`Cache hit: ${cachedFilePath}`);
            return cachedFilePath;
        }
        console.log(`Cache miss: ${cachedFilename}`);
        return null;
    }
    catch (error) {
        console.error('Error checking cache:', error);
        return null;
    }
});
/**
 * Express middleware that checks for cached images before processing
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const cacheMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract image processing options from request query parameters
        const options = {
            filename: req.query.filename,
            width: req.query.width ? parseInt(req.query.width) : undefined,
            height: req.query.height ? parseInt(req.query.height) : undefined,
            format: req.query.format
        };
        // Validate required parameters
        if (!options.filename) {
            res.status(400).send('Missing required parameter: filename');
            return;
        }
        // Check if the image with these processing options is already cached
        const cachedFilePath = yield checkCache(options);
        if (cachedFilePath) {
            // If cached, send the cached file
            res.sendFile(cachedFilePath);
        }
        else {
            // If not cached, attach options to the request and proceed to next middleware
            // This allows the route handler to access the options and process the image
            res.locals.imageOptions = options;
            next();
        }
    }
    catch (error) {
        console.error('Cache middleware error:', error);
        next(error);
    }
});
exports.cacheMiddleware = cacheMiddleware;
exports.default = {
    cacheMiddleware: exports.cacheMiddleware,
    checkCache,
    generateCacheKey
};
