#!/usr/bin/env python3
"""
Setup script for FitnessPr Backend
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        return False


def check_python_version():
    """Check if Python version is 3.9+"""
    if sys.version_info < (3, 9):
        print("❌ Python 3.9+ is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True


def setup_environment():
    """Set up the development environment."""
    print("🚀 Setting up FitnessPr Backend...")
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Create virtual environment
    if not os.path.exists("venv"):
        if not run_command("python -m venv venv", "Creating virtual environment"):
            return False
    
    # Activate virtual environment and install dependencies
    if sys.platform == "win32":
        activate_cmd = "venv\\Scripts\\activate.bat"
        pip_cmd = "venv\\Scripts\\pip"
        python_cmd = "venv\\Scripts\\python"
    else:
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
        python_cmd = "venv/bin/python"
    
    # Upgrade pip
    if not run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install dependencies
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing dependencies"):
        return False
    
    # Copy environment file if it doesn't exist
    if not os.path.exists(".env"):
        if os.path.exists(".env.example"):
            run_command("copy .env.example .env" if sys.platform == "win32" else "cp .env.example .env", 
                       "Creating .env file")
        else:
            print("⚠️  .env.example not found, please create .env manually")
    
    # Initialize database
    if not run_command(f"{python_cmd} -m app.utils.init_db", "Initializing database"):
        return False
    
    print("\n🎉 Setup completed successfully!")
    print("\n📝 Next steps:")
    print("1. Activate virtual environment:")
    if sys.platform == "win32":
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("2. Edit .env file with your configuration")
    print("3. Start the development server:")
    print("   uvicorn app.main:app --reload")
    print("\n🌐 The API will be available at:")
    print("   - API: http://localhost:8000")
    print("   - Docs: http://localhost:8000/docs")
    
    return True


if __name__ == "__main__":
    setup_environment()
