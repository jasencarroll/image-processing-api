/**
 * Images API Router
 * 
 * This module defines the routes for the image processing API.
 * It handles requests to resize and process images using the specified parameters.
 * 
 * @module routes/images
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { processImage, imageExists } from '../../utils/imageProcessor';
import { cacheMiddleware } from '../../middleware/cache';
import { ImageProcessingOptions } from '../../config/types';

// Create a router instance
const router = express.Router();

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
router.get('/', cacheMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get image options from the middleware (res.locals) or recreate from query params
    const options: ImageProcessingOptions = res.locals.imageOptions || {
      filename: req.query.filename as string,
      width: req.query.width ? parseInt(req.query.width as string) : undefined,
      height: req.query.height ? parseInt(req.query.height as string) : undefined,
      format: req.query.format as string | undefined
    };

    // Validate required parameters
    if (!options.filename) {
      res.status(400).send('Missing required parameter: filename');
      return;
    }

    // Validate that the input image exists
    const fileExists = await imageExists(options.filename);
    if (!fileExists) {
      res.status(404).send(`Image '${options.filename}' not found`);
      return;
    }

    // Validate numeric parameters
    if (
      (options.width !== undefined && (isNaN(options.width) || options.width <= 0)) ||
      (options.height !== undefined && (isNaN(options.height) || options.height <= 0))
    ) {
      res.status(400).send('Width and height must be positive numbers');
      return;
    }

    // Process the image
    const processedImagePath = await processImage(options);
    
    // Send the processed image
    res.sendFile(processedImagePath);
  } catch (error) {
    console.error('Error in image processing route:', error);
    res.status(500).send(`Internal server error: ${error}`);
  }
});

export default router;