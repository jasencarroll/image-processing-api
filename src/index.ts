/**
 * Image Processing API - Main Application Entry Point
 * 
 * This is the main entry point for the Image Processing API application.
 * It sets up the Express server, configures middleware, and registers routes.
 * 
 * @module index
 */

import express from 'express';
import path from 'path';
import imagesRouter from './routes/images';

// Create an Express application
const app = express();
const port = process.env.PORT || 3000;

// Middleware for logging all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, '../public')));

// Welcome message for the root route
app.get('/', (req, res) => {
  res.send(`
    <h1>Image Processing API</h1>
    <p>Use the /api/images endpoint with the following query parameters:</p>
    <ul>
      <li><strong>filename</strong>: (required) The name of the image file to process</li>
      <li><strong>width</strong>: (optional) The width to resize the image to</li>
      <li><strong>height</strong>: (optional) The height to resize the image to</li>
      <li><strong>format</strong>: (optional) The format to convert the image to (e.g., jpg, png, webp)</li>
    </ul>
    <p>Example: <a href="/api/images?filename=encenadaport.jpg&width=300&height=200">/api/images?filename=encenadaport.jpg&width=300&height=200</a></p>
  `);
});

// Register the images router
app.use('/api/images', imagesRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error occurred:', err);
  res.status(500).send(`Internal server error: ${err.message}`);
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).send('Route not found');
});

// Start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Image Processing API is running on port ${port}`);
    console.log(`Visit http://localhost:${port} to access the API`);
  });
}

// Export the Express app for testing
export default app;