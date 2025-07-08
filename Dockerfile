FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install uv

# Copy project files
COPY pyproject.toml uv.lock ./
RUN uv pip install --system -e .

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p static/uploads static/results logs

# Set environment to production
ENV FLASK_ENV=production
ENV FLASK_DEBUG=False

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run application
CMD ["python", "main.py"]
