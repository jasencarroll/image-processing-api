# Image Processing API

A Node.js Express API that processes images using the Sharp library. The API can resize JPEG images and cache the results for improved performance.

## Project Status

✅ **Completed Features:**
- Express server setup with TypeScript
- Image resizing endpoint with Sharp
- Caching middleware for processed images
- Error handling
- Unit tests for routes and image processing

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm

### Installation

1. Clone the repository
2. Install dependencies
```bash
npm install
```

## Development

### Build and Run
```bash
# Build TypeScript to JavaScript
npm run build

# Start the server
npm start

# Run in development mode with hot reloading
npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Run tests for a specific file
npm test -- -t "test pattern"
```

### Code Quality
```bash
# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Usage

Once the server is running, you can access the image processing API:

### Image Resizing Endpoint

```
GET /api/images?filename=IMAGE_NAME&width=WIDTH&height=HEIGHT
```

Parameters:
- `filename`: Name of the image file (without extension) from the `images` directory
- `width`: Desired width in pixels (optional)
- `height`: Desired height in pixels (optional)

Example:
```
http://localhost:3000/api/images?filename=fjord&width=300&height=200
```

The API will:
1. Check if a cached version exists
2. Process the image if not in cache
3. Return the resized image
4. Store processed images in `public/images/processed/`

## Available Images

The following sample images are included:
- encenadaport
- fjord
- icelandwaterfall
- palmtunnel
- santamonica

## Project Structure
```
image-processing-api/
├── src/             # TypeScript source files
│   ├── routes/      # API routes
│   ├── utils/       # Utility functions
│   ├── middleware/  # Express middleware
│   ├── config/      # Configuration
│   └── tests/       # Test files
├── public/          # Public assets
├── images/          # Original images
└── dist/            # Compiled JavaScript
```

## License

[License](LICENSE.txt)