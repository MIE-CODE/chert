# Docker Setup Guide

This guide explains how to build and run the Chert application using Docker.

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### Production Build

```bash
# Build the Docker image
docker build -t chert:latest .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:4000 \
  -e NEXT_PUBLIC_SOCKET_URL=http://localhost:4000 \
  chert:latest
```

Or using Docker Compose:

```bash
# Set environment variables in .env file or export them
export NEXT_PUBLIC_API_URL=http://localhost:4000
export NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Development Build

```bash
# Using development Docker Compose
docker-compose -f docker-compose.dev.yml up

# Or build and run manually
docker build -f Dockerfile.dev -t chert:dev .
docker run -p 3000:3000 -v $(pwd):/app chert:dev
```

## Docker Images

### Production Image (`Dockerfile`)
- Multi-stage build for optimized image size
- Uses Next.js standalone output
- Runs as non-root user for security
- Optimized for production deployment

### Development Image (`Dockerfile.dev`)
- Includes development dependencies
- Hot reload enabled
- Volume mounting for live code changes

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SOCKET_URL` - WebSocket server URL

Optional:
- `NODE_ENV` - Set to `production` for production builds
- `PORT` - Server port (default: 3000)

## Docker Compose Files

### `docker-compose.yml` (Production)
- Production-ready configuration
- Health checks included
- Auto-restart on failure

### `docker-compose.dev.yml` (Development)
- Development configuration
- Volume mounting for hot reload
- Development dependencies

## Building for Different Platforms

```bash
# Build for AMD64 (Intel/AMD)
docker build --platform linux/amd64 -t chert:latest .

# Build for ARM64 (Apple Silicon, Raspberry Pi)
docker build --platform linux/arm64 -t chert:latest .

# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t chert:latest .
```

## Pushing to Docker Registry

### Docker Hub

```bash
# Login
docker login

# Tag image
docker tag chert:latest yourusername/chert:latest

# Push
docker push yourusername/chert:latest
```

### Private Registry

```bash
# Tag for private registry
docker tag chert:latest registry.example.com/chert:latest

# Push
docker push registry.example.com/chert:latest
```

## CI/CD Integration

The GitHub Actions workflow automatically builds and pushes Docker images to Docker Hub on every push to `main`.

Required secrets:
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password or access token

## Troubleshooting

### Port Already in Use

```bash
# Change the port mapping
docker run -p 3001:3000 chert:latest
```

### Permission Issues

```bash
# Run with specific user
docker run -u $(id -u):$(id -g) chert:latest
```

### Build Cache Issues

```bash
# Build without cache
docker build --no-cache -t chert:latest .
```

### View Container Logs

```bash
# Using docker-compose
docker-compose logs -f

# Using docker
docker logs -f <container-id>
```

## Production Deployment

### Using Docker Compose

1. Create a `.env` file with your environment variables
2. Run `docker-compose up -d`
3. Access the app at `http://localhost:3000`

### Using Docker Run

```bash
docker run -d \
  --name chert \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  -e NEXT_PUBLIC_SOCKET_URL=https://api.example.com \
  yourusername/chert:latest
```

### Using Docker Swarm or Kubernetes

The Docker image is compatible with orchestration platforms. Refer to your platform's documentation for deployment specifics.

## Image Size Optimization

The production image uses multi-stage builds to minimize size:
- Stage 1: Install dependencies
- Stage 2: Build the application
- Stage 3: Copy only necessary files for runtime

This results in a smaller final image (~150-200MB) compared to including all build tools.

