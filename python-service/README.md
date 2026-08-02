# STEP/IGES Converter Service

A Python microservice that converts STEP (.step/.stp) and IGES (.iges/.igs) files to mesh data for 3D visualization in the browser.

## Features

- **Trimesh + Pyglet** for STEP/IGES parsing
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

### Option 2: Local Python (Python 3.11)

```bash
cd python-service
pip install -r requirements.txt
python step_converter.py
```

The service will start at `http://localhost:8000`

## Deployment to Render.com

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `python-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python step_converter.py`
   - **Python Version**: 3.11 (set in runtime.txt)
4. Click "Create Web Service"

After deployment, set the environment variable in your Next.js app:
```
STEP_SERVICE_URL=https://your-service.onrender.com
```

## API Endpoints

### Health Check
```
GET /
```

### Convert File
```
POST /convert
Content-Type: multipart/form-data
Body: file (STEP, IGES, or STL file)
```

## Supported Formats

| Format | Extension | Status |
|--------|-----------|--------|
| STEP | .step, .stp | ✅ With trimesh+pyglet |
| IGES | .iges, .igs | ✅ With trimesh+pyglet |
| STL | .stl | ✅ Browser-native loading |

## Note

For best results with STEP/IGES files, use the Python service. STL files load directly in the browser.

## License

MIT
