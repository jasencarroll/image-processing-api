"use strict";
/**
 * Images API Router
 *
 * This module defines the routes for the image processing API.
 * It handles requests to resize and process images using the specified parameters.
 *
 * @module routes/images
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
const express_1 = __importDefault(require("express"));
const imageProcessor_1 = require("../../utils/imageProcessor");
const cache_1 = require("../../middleware/cache");
// Create a router instance
const router = express_1.default.Router();
/**
 * Main route for image processing
 * GET /api/images?filename=example.jpg&width=300&height=200&format=png
 *
 * Required parameters:
 * - filename: The name of the image file to process
 *
 * Optional parameters:
 * - width: The desired width of the processed image
 * - height: The desired height of the processed image
 * - format: The desired format of the processed image (e.g., jpg, png, webp)
 */
router.get('/', cache_1.cacheMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get image options from the middleware (res.locals) or recreate from query params
        const options = res.locals.imageOptions || {
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
        // Validate that the input image exists
        const fileExists = yield (0, imageProcessor_1.imageExists)(options.filename);
        if (!fileExists) {
            res.status(404).send(`Image '${options.filename}' not found`);
            return;
        }
        // Validate numeric parameters
        if ((options.width !== undefined && (isNaN(options.width) || options.width <= 0)) ||
            (options.height !== undefined && (isNaN(options.height) || options.height <= 0))) {
            res.status(400).send('Width and height must be positive numbers');
            return;
        }
        // Process the image
        const processedImagePath = yield (0, imageProcessor_1.processImage)(options);
        // Send the processed image
        res.sendFile(processedImagePath);
    }
    catch (error) {
        console.error('Error in image processing route:', error);
        res.status(500).send(`Internal server error: ${error}`);
    }
}));
exports.default = router;
