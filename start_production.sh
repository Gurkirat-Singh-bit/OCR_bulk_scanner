#!/bin/bash

# Production startup script using Gunicorn

export FLASK_ENV=production
export FLASK_DEBUG=False

# Start application with Gunicorn
exec gunicorn \
    --bind 0.0.0.0:5000 \
    --workers 4 \
    --worker-class sync \
    --worker-connections 1000 \
    --timeout 30 \
    --keepalive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload \
    --access-logfile /var/log/ocr-scanner-access.log \
    --error-logfile /var/log/ocr-scanner-error.log \
    --log-level info \
    --capture-output \
    main:app
