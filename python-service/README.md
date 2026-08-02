# STEP/IGES Converter Service

A Python microservice that converts STEP (.step/.stp) and IGES (.iges/.igs) files to mesh data for 3D visualization in the browser.

## Features

- **OpenCASCADE (OCC)** integration for precise CAD parsing
- **Trimesh** fallback for additional format support
- **FastAPI** for high-performance REST API
- Returns vertices, normals, indices, and bounding box data

## Quick Start

### Option 1: Docker (Recommended)

```bash
cd python-service
docker build -t step-converter .
docker run -p 8000:8000 step-converter
```

Or use docker-compose:

```bash
cd python-service
docker-compose up -d
```

### Option 2: Local Python

```bash
cd python-service
pip install -r requirements.txt
python step_converter.py
```

The service will start at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /
```
Returns service status and available converters.

### Convert File
```
POST /convert
Content-Type: multipart/form-data

Body: file (STEP, IGES, or STL file)

Response:
{
  "success": true,
  "fileName": "part.step",
  "fileType": "STEP",
  "vertices": [...],
  "normals": [...],
  "indices": [...],
  "bbox": {
    "min": [...],
    "max": [...],
    "center": [...],
    "size": [...]
  },
  "stats": {
    "vertexCount": 12345,
    "triangleCount": 6789
  },
  "source": "opencascade"
}
```

### Get File Info
```
POST /info
Content-Type: multipart/form-data

Body: file

Response: Basic file information without full conversion
```

## Deployment Options

### Render.com
1. Create new Web Service
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python step_converter.py`
5. Add environment variable: `PORT=8000`

### Railway
1. Create new project
2. Add the python-service directory
3. Railway auto-detects Python

### Fly.io
```bash
fly launch
fly deploy
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8000 | Service port |
| PYTHONUNBUFFERED | 1 | Enable stdout/stderr streaming |

## Next.js Integration

Set the environment variable in your Next.js `.env`:

```
STEP_SERVICE_URL=https://your-step-service.railway.app
```

Or deploy to the same domain:

```
STEP_SERVICE_URL=https://your-domain.com/api/step
```

## Supported Formats

| Format | Extension | Status |
|--------|-----------|--------|
| STEP | .step, .stp | ✅ Full support with OCC |
| IGES | .iges, .igs | ✅ Full support with OCC |
| STL | .stl | ✅ Browser-native loading |

## License

MIT
