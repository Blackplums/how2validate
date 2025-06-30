# Use an official Python runtime as a base image
FROM python:3.13.5-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Python source code and other necessary files into the container
COPY src/python /app

# Install the Python package from the copied files
RUN pip install --no-cache-dir .

# Environment variables for paths to your config.ini and tokenManager.json files
ENV CONFIG_PATH=/app/config.ini
ENV TOKEN_PATH=/app/tokenManager.json

# Set the entry point to the how2validate command
ENTRYPOINT ["how2validate"]