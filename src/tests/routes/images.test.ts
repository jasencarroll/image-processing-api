/**
 * Tests for the images API endpoint
 * 
 * This file contains tests for the images API routes.
 * It verifies that the API handles requests correctly and returns appropriate responses.
 */

import supertest from 'supertest';
import fs from 'fs';
import path from 'path';
import express from 'express';
import imagesRouter from '../../routes/images';

// Create a test app for the tests
const app = express();
app.use('/api/images', imagesRouter);
const request = supertest(app);

// Sample image filename for testing - using an actual image from the images folder
const sampleImageFilename = 'encenadaport.jpg';

// Setup function to ensure processed directory exists
beforeAll(() => {
  const outputFolder = path.resolve(__dirname, '../../../public/images/processed');
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }
});

// Helper function to check if the sample image exists
const checkImageExists = (): boolean => {
  const inputFolder = path.resolve(__dirname, '../../../images');
  return fs.existsSync(path.join(inputFolder, sampleImageFilename));
};

describe('Images API Endpoint', () => {
  it('should return 400 if filename parameter is missing', async () => {
    const response = await request.get('/api/images');
    expect(response.status).toBe(400);
    expect(response.text).toContain('Missing required parameter: filename');
  });

  it('should return 404 if image does not exist', async () => {
    const response = await request.get('/api/images?filename=non-existent-image.jpg');
    expect(response.status).toBe(404);
    expect(response.text).toContain('not found');
  });

  it('should return 400 if width or height is invalid', async () => {
    if (!checkImageExists()) {
      // Skip test if sample image doesn't exist
      console.log('Skipping test: sample image does not exist');
      return;
    }

    const response = await request.get(`/api/images?filename=${sampleImageFilename}&width=invalid`);
    expect(response.status).toBe(400);
    expect(response.text).toContain('Width and height must be positive numbers');
  });

  it('should process an image successfully with valid parameters', async () => {
    if (!checkImageExists()) {
      // Skip test if sample image doesn't exist
      return;
    }

    const response = await request.get(`/api/images?filename=${sampleImageFilename}&width=300&height=200`);
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/image\/jpeg/);
  });

  it('should process an image with only width parameter', async () => {
    if (!checkImageExists()) {
      // Skip test if sample image doesn't exist
      return;
    }

    const response = await request.get(`/api/images?filename=${sampleImageFilename}&width=300`);
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/image\/jpeg/);
  });

  it('should convert image format if format parameter is provided', async () => {
    if (!checkImageExists()) {
      // Skip test if sample image doesn't exist
      return;
    }

    const response = await request.get(`/api/images?filename=${sampleImageFilename}&format=png`);
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/image\/png/);
  });
  
  it('should use cached image on subsequent requests', async () => {
    if (!checkImageExists()) {
      // Skip test if sample image doesn't exist
      return;
    }

    // First request to process the image
    await request.get(`/api/images?filename=${sampleImageFilename}&width=300&height=200`);
    
    // Second request should use cached version
    const start = Date.now();
    const response = await request.get(`/api/images?filename=${sampleImageFilename}&width=300&height=200`);
    const end = Date.now();
    
    expect(response.status).toBe(200);
    
    // Cached response should be fast (less than 100ms)
    // This is a soft test and might need adjustment based on your environment
    expect(end - start).toBeLessThan(100);
  });
});