# Trendsetter CAD Processor
# Railway/Render deployment - builds from source

FROM python:3.11-slim

# Install CAD dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglu1-mesa \
    libfreetype6 \
    libxrender1 \
    libxmu6 \
    libxi6 \
    tcl8.6 \
    tk8.6 \
    libxft2 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Download OpenCASCADE
ENV OCCT_VERSION=7.7.1
RUN cd /opt && \
    wget -q https://dev.opencascade.org/release/files/occt-${OCCT_VERSION}/occt-${OCCT_VERSION}.tar.gz && \
    tar -xzf occt-${OCCT_VERSION}.tar.gz && \
    rm occt-${OCCT_VERSION}.tar.gz

ENV CASROOT=/opt/opencascade-${OCCT_VERSION}
ENV LD_LIBRARY_PATH=${CASROOT}/lib:${LD_LIBRARY_PATH}
ENV PATH=${CASROOT}/bin:${PATH}

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
