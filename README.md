# URL Redirect Monitor

A powerful Go-based tool for monitoring and analyzing URL redirect chains. This tool tracks the complete redirect path of any URL and displays detailed information about each step in an intuitive web interface.

## Features

- 🔍 **Complete Redirect Tracking**: Follow the entire redirect chain from start to finish
- 📊 **Detailed Analysis**: View HTTP status codes, headers, and timestamps for each step
- 🎨 **Modern Web Interface**: Clean, responsive UI built with Tailwind CSS
- ⚡ **Fast Performance**: Built with Go and Gin framework for optimal speed
- 🛡️ **Safety Features**: Prevents infinite redirect loops with configurable limits
- 📱 **Mobile Friendly**: Responsive design that works on all devices

## Installation

### Prerequisites

- Go 1.21 or higher
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/haxqer/redirect-monitor
cd redirect-monitor
```

2. Install dependencies:
```bash
go mod tidy
```

3. Run the application:
```bash
go run main.go
```

4. Open your browser and navigate to:
```
http://localhost:8080
```

## Usage

1. **Enter a URL**: Input any URL in the text field (protocol is optional - https:// will be added automatically)
2. **Click "Check Redirects"**: The tool will analyze the complete redirect chain
3. **View Results**: See detailed information including:
   - Total number of steps
   - Final destination URL
   - Duration of the entire process
   - Number of redirects encountered
   - Detailed step-by-step breakdown with headers

## API Endpoints

### POST /api/check-redirects

Analyzes the redirect chain for a given URL.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "original_url": "https://example.com",
  "final_url": "https://www.example.com",
  "steps": [
    {
      "url": "https://example.com",
      "status_code": 301,
      "method": "GET",
      "headers": {
        "Location": "https://www.example.com",
        "Server": "nginx/1.18.0"
      },
      "timestamp": "2024-01-15 10:30:45"
    }
  ],
  "total_steps": 2,
  "total_duration": "245.67ms",
  "success": true
}
```

## Configuration

The tool includes several configurable parameters:

- **Maximum Redirects**: 20 (prevents infinite loops)
- **Request Timeout**: 30 seconds
- **Server Port**: 8080
- **User Agent**: "Redirect-Monitor/1.0"

## Technical Details

### Architecture

- **Backend**: Go with Gin web framework
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **HTTP Client**: Custom client with redirect handling disabled
- **CORS**: Enabled for cross-origin requests

### Key Components

1. **RedirectStep**: Represents each step in the redirect chain
2. **RedirectResult**: Contains the complete analysis results
3. **trackRedirects()**: Core function that follows the redirect chain
4. **Web Interface**: Modern, responsive frontend for user interaction

### Security Features

- URL validation to prevent malformed requests
- Request timeout to prevent hanging connections
- Maximum redirect limit to prevent infinite loops
- Proper error handling and user feedback

## CI/CD

### GitHub Actions

The project includes automated CI/CD pipeline that:

- **Builds Docker images** for both `linux/amd64` and `linux/arm64` platforms
- **Publishes to Docker Hub** (`docker.io`) automatically
- **Triggers on**:
  - Push to `main`/`master` branch
  - Git tags (for versioned releases)
  - Pull requests (build only, no push)

#### Creating a Release

1. Create and push a git tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. GitHub Actions will automatically:
   - Build multi-platform Docker images
   - Tag with version number (`v1.0.0`, `1.0`, `1`)
   - Push to Docker Hub
   - Generate build attestation for security

#### Using Released Images

```bash
# Use specific version
docker run -p 8080:8080 haxqer/redirect-monitor:v1.0.0

# Use latest stable
docker run -p 8080:8080 haxqer/redirect-monitor:latest
```

## Development

### Project Structure

```
redirect-monitor/
├── main.go              # Main application file
├── go.mod              # Go module definition
├── templates/          # HTML templates
│   └── index.html     # Main web interface
├── static/            # Static assets (if needed)
└── README.md          # This file
```

### Building for Production

```bash
# Build binary
go build -o redirect-monitor main.go

# Run binary
./redirect-monitor
```

### Docker Support

#### Using Docker Compose (Recommended)

```bash
# Build and run with docker-compose
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop the service
docker-compose down
```

#### Using Docker directly

```bash
# Build the image
docker build -t redirect-monitor .

# Run the container (production mode)
docker run -p 8080:8080 redirect-monitor

# Run in background (production mode)
docker run -d -p 8080:8080 --name redirect-monitor redirect-monitor

# Run with custom port
docker run -d -p 3000:3000 -e PORT=3000 --name redirect-monitor redirect-monitor
```

#### Using pre-built image from Docker Hub

```bash
# Pull and run the latest image
docker run -p 8080:8080 haxqer/redirect-monitor:latest
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository. 