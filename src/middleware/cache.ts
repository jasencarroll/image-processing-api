/**
 * Image Caching Middleware
 * 
 * This middleware checks if a requested image with the same processing parameters
 * already exists in the cache. If it does, it serves the cached version instead
 * of regenerating the image.
 * 
 * @module cache
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { ImageProcessingOptions, CachedImage } from '../config/types';
import { processImage } from '../utils/imageProcessor';

// Path to the output folder for processed images
const outputFolder = path.resolve(__dirname, '../../public/images/processed');

/**
 * Generates a cache key based on the image processing options
 * This key uniquely identifies a processed image variant
 * 
 * @param options - The image processing options
 * @returns A string representing the cache key
 */
const generateCacheKey = (options: ImageProcessingOptions): string => {
  // Extract the filename without extension
  const fileNameWithoutExt = path.parse(options.filename).name;
  
  // Get the extension or use jpg as default
  const extension = options.format || path.parse(options.filename).ext.replace('.', '') || 'jpg';
  
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
const checkCache = async (options: ImageProcessingOptions): Promise<string | null> => {
  try {
    // Generate the expected filename based on processing options
    const cachedFilename = generateCacheKey(options);
    const cachedFilePath = path.join(outputFolder, cachedFilename);
    
    // Check if the file exists
    if (fs.existsSync(cachedFilePath)) {
      console.log(`Cache hit: ${cachedFilePath}`);
      return cachedFilePath;
    }
    
    console.log(`Cache miss: ${cachedFilename}`);
    return null;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
};

/**
 * Express middleware that checks for cached images before processing
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract image processing options from request query parameters
    const options: ImageProcessingOptions = {
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
    
    // Check if the image with these processing options is already cached
    const cachedFilePath = await checkCache(options);
    
    if (cachedFilePath) {
      // If cached, send the cached file
      res.sendFile(cachedFilePath);
    } else {
      // If not cached, attach options to the request and proceed to next middleware
      // This allows the route handler to access the options and process the image
      res.locals.imageOptions = options;
      next();
    }
  } catch (error) {
    console.error('Cache middleware error:', error);
    next(error);
  }
};

export default {
  cacheMiddleware,
  checkCache,
  generateCacheKey
};