# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV USE_SQLITE=true
ENV SQLITE_URL=sqlite:///./fitnesspr.db

# Initialize database and start server
CMD ["sh", "-c", "python -c 'from app.core.database import engine, Base; from app.models import user, trainer, client, exercise, meal, payment, program, progress; Base.metadata.create_all(bind=engine)' && uvicorn app.main:app --host 0.0.0.0 --port 8000"]