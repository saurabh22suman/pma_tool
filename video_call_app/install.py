#!/usr/bin/env python
"""
Installation script for the Secure Video Call application.
This script ensures all dependencies are properly installed.
"""

import subprocess
import sys
import os

def check_python_version():
    """Check if Python version is 3.8 or higher."""
    major, minor = sys.version_info[:2]
    if major < 3 or (major == 3 and minor < 8):
        print(f"Error: Python 3.8 or higher is required. You have Python {major}.{minor}.")
        return False
    print(f"Python version {major}.{minor} detected. ✓")
    return True

def install_setuptools():
    """Install setuptools package."""
    print("\nInstalling setuptools...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "setuptools>=65.5.0"], check=True)
        print("Setuptools installed successfully. ✓")
        return True
    except subprocess.CalledProcessError:
        print("Error installing setuptools. Please install it manually with:")
        print("pip install setuptools>=65.5.0")
        return False

def install_requirements():
    """Install required packages from requirements.txt."""
    print("\nInstalling required packages...")
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    requirements_path = os.path.join(script_dir, "requirements.txt")
    
    if not os.path.exists(requirements_path):
        print(f"Error: requirements.txt not found at {requirements_path}")
        print("Please make sure you're running this script from the correct directory.")
        return False
    
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", requirements_path], check=True)
        print("All required packages installed successfully. ✓")
        return True
    except subprocess.CalledProcessError:
        print("Error installing required packages. Please install them manually with:")
        print(f"pip install -r {requirements_path}")
        return False

def generate_ssl_certificates():
    """Generate SSL certificates if they don't exist."""
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ssl_dir = os.path.join(script_dir, "ssl")
    cert_path = os.path.join(ssl_dir, "cert.pem")
    key_path = os.path.join(ssl_dir, "key.pem")
    generate_ssl_path = os.path.join(script_dir, "generate_ssl.py")
    
    if os.path.exists(cert_path) and os.path.exists(key_path):
        print("\nSSL certificates already exist. ✓")
        return True
    
    print("\nGenerating SSL certificates...")
    try:
        if not os.path.exists(ssl_dir):
            os.makedirs(ssl_dir)
        
        if not os.path.exists(generate_ssl_path):
            print(f"Error: generate_ssl.py not found at {generate_ssl_path}")
            print("Please make sure you're running this script from the correct directory.")
            return False
        
        subprocess.run([sys.executable, generate_ssl_path], check=True)
        print("SSL certificates generated successfully. ✓")
        return True
    except subprocess.CalledProcessError:
        print("Error generating SSL certificates. Please run 'python generate_ssl.py' manually.")
        return False

def main():
    """Main function."""
    print("=" * 60)
    print("Secure Video Call Application Installation")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install setuptools first
    if not install_setuptools():
        return
    
    # Install required packages
    if not install_requirements():
        return
    
    # Generate SSL certificates
    if not generate_ssl_certificates():
        return
    
    print("\n" + "=" * 60)
    print("Installation completed successfully!")
    print("=" * 60)
    print("\nYou can now run the application with:")
    print("python run.py")
    print("\nOr directly with:")
    print("python app.py")

if __name__ == "__main__":
    main()
