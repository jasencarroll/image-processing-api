/**
 * Type definitions for the image processing API
 * These types help maintain consistency across the application and provide type safety
 */

// Define the structure for image processing options
export interface ImageProcessingOptions {
    // The filename of the image to process
    filename: string;
    
    // The width to resize the image to (optional)
    width?: number;
    
    // The height to resize the image to (optional)
    height?: number;
    
    // Optional format to convert the image to (e.g., 'jpeg', 'png', 'webp')
    format?: string;
  }
  
  // Define the structure for cached images
  export interface CachedImage {
    // Original filename
    originalFilename: string;
    
    // Path to the cached (processed) image
    cachedFilePath: string;
    
    // Timestamp when the image was cached
    timestamp: Date;
    
    // Processing options that were applied
    options: ImageProcessingOptions;
  }