/**
 * Image processing utility module
 * 
 * This module provides functions for processing images using the Sharp library.
 * It handles resizing images while maintaining aspect ratio if only one dimension is provided.
 * 
 * @module imageProcessor
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { ImageProcessingOptions } from '../config/types';

// Define paths for original and processed images
const inputFolder = path.resolve(__dirname, '../../images');
const outputFolder = path.resolve(__dirname, '../../public/images/processed');

/**
 * Ensures that the output directory exists for processed images
 * Creates the directory if it doesn't exist
 */
const ensureOutputFolderExists = async (): Promise<void> => {
  // Check if the output folder exists, and create it if it doesn't
  if (!fs.existsSync(outputFolder)) {
    try {
      // Use recursive option to create parent directories if needed
      await fs.promises.mkdir(outputFolder, { recursive: true });
      console.log(`Created output directory: ${outputFolder}`);
    } catch (error) {
      console.error('Error creating output directory:', error);
      throw new Error(`Failed to create output directory: ${error}`);
    }
  }
};

/**
 * Generates a filename for the processed image based on its original name and processing options
 * 
 * @param options - The image processing options
 * @returns A string representing the unique filename for the processed image
 */
const generateProcessedFilename = (options: ImageProcessingOptions): string => {
  // Extract the original filename without extension
  const fileNameWithoutExt = path.parse(options.filename).name;
  
  // Get the extension from the original file or use the specified format
  const extension = options.format || path.parse(options.filename).ext.replace('.', '') || 'jpg';
  
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
export const processImage = async (
  options: ImageProcessingOptions
): Promise<string> => {
  try {
    // Ensure output folder exists
    await ensureOutputFolderExists();

    // Construct the input and output file paths
    const inputPath = path.join(inputFolder, options.filename);
    const outputFilename = generateProcessedFilename(options);
    const outputPath = path.join(outputFolder, outputFilename);

    // Check if the input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Initialize Sharp with the input file
    let imageProcess = sharp(inputPath);

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
      imageProcess = imageProcess.toFormat(options.format as keyof sharp.FormatEnum);
    }

    // Write the processed image to the output path
    await imageProcess.toFile(outputPath);
    
    console.log(`Image processed successfully: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process image: ${error}`);
  }
};

/**
 * Checks if an image exists in the input folder
 * 
 * @param filename - The name of the image file to check
 * @returns A promise that resolves to a boolean indicating if the file exists
 */
export const imageExists = async (filename: string): Promise<boolean> => {
  const filePath = path.join(inputFolder, filename);
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export default {
  processImage,
  imageExists,
  inputFolder,
  outputFolder
};