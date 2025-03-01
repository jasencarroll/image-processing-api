/**
 * Tests for the image processor utility
 * 
 * This file contains tests for the image processing functionality.
 * It verifies that images can be resized and processed correctly.
 */

import fs from 'fs';
import path from 'path';
import { processImage, imageExists } from '../../utils/imageProcessor';
import { ImageProcessingOptions } from '../../config/types';

// Sample image filename for testing - using an actual image from the images folder
const sampleImageFilename = 'encenadaport.jpg'; 

// Test setup function to ensure directories exist
const setupTests = async (): Promise<void> => {
  // Ensure input directory exists
  const inputFolder = path.resolve(__dirname, '../../../images');
  
  if (!fs.existsSync(inputFolder)) {
    await fs.promises.mkdir(inputFolder, { recursive: true });
  }
  
  // Ensure output directory exists
  const outputFolder = path.resolve(__dirname, '../../../public/images/processed');
  if (!fs.existsSync(outputFolder)) {
    await fs.promises.mkdir(outputFolder, { recursive: true });
  }
  
  // Check if sample image exists
  const sampleImagePath = path.join(inputFolder, sampleImageFilename);
  
  if (!fs.existsSync(sampleImagePath)) {
    console.warn(`
      Test Warning: Sample image '${sampleImageFilename}' does not exist in the images folder.
      Tests will be skipped until a sample image is available.
    `);
  }
};

// Run setup before tests
beforeAll(async () => {
  await setupTests();
});

describe('Image Processor Utility', () => {
  // Skip tests if sample image doesn't exist
  const checkImageExists = (): boolean => {
    const inputFolder = path.resolve(__dirname, '../../../images');
    return fs.existsSync(path.join(inputFolder, sampleImageFilename));
  };

  describe('imageExists function', () => {
    it('should return true for existing images', async () => {
      if (!checkImageExists()) {
        return; // Skip test if sample image doesn't exist
      }
      
      const exists = await imageExists(sampleImageFilename);
      expect(exists).toBe(true);
    });

    it('should return false for non-existing images', async () => {
      const exists = await imageExists('non-existent-image.jpg');
      expect(exists).toBe(false);
    });
  });

  describe('processImage function', () => {
    it('should process an image with width and height parameters', async () => {
      if (!checkImageExists()) {
        return; // Skip test if sample image doesn't exist
      }
      
      const options: ImageProcessingOptions = {
        filename: sampleImageFilename,
        width: 300,
        height: 200
      };
      
      const processedPath = await processImage(options);
      
      // Check if the processed file exists
      expect(fs.existsSync(processedPath)).toBe(true);
      
      // Clean up the processed file
      if (fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
    });
    
    it('should process an image with only width parameter', async () => {
      if (!checkImageExists()) {
        return; // Skip test if sample image doesn't exist
      }
      
      const options: ImageProcessingOptions = {
        filename: sampleImageFilename,
        width: 300
      };
      
      const processedPath = await processImage(options);
      
      // Check if the processed file exists
      expect(fs.existsSync(processedPath)).toBe(true);
      
      // Clean up the processed file
      if (fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
    });
    
    it('should process an image with format conversion', async () => {
      if (!checkImageExists()) {
        return; // Skip test if sample image doesn't exist
      }
      
      const options: ImageProcessingOptions = {
        filename: sampleImageFilename,
        format: 'png'
      };
      
      const processedPath = await processImage(options);
      
      // Check if the processed file exists and has the right extension
      expect(fs.existsSync(processedPath)).toBe(true);
      expect(path.extname(processedPath).toLowerCase()).toBe('.png');
      
      // Clean up the processed file
      if (fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
    });
    
    it('should throw an error for non-existent input files', async () => {
      const options: ImageProcessingOptions = {
        filename: 'non-existent-image.jpg',
        width: 300,
        height: 200
      };
      
      await expect(processImage(options)).rejects.toThrow('Input file not found');
    });
  });
});