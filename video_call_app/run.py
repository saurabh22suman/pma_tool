#!/usr/bin/env python
"""
Run script for the Secure Video Call application.
This script handles SSL certificate generation and starts the application.
"""

import os
import sys
import subprocess

def check_ssl_certificates():
    """Check if SSL certificates exist, generate them if not."""
    cert_path = os.path.join('ssl', 'cert.pem')
    key_path = os.path.join('ssl', 'key.pem')
    
    if not (os.path.exists(cert_path) and os.path.exists(key_path)):
        print("SSL certificates not found. Generating new certificates...")
        try:
            subprocess.run([sys.executable, 'generate_ssl.py'], check=True)
            print("SSL certificates generated successfully.")
        except subprocess.CalledProcessError:
            print("Error generating SSL certificates. Please run 'python generate_ssl.py' manually.")
            return False
    else:
        print("SSL certificates found.")
    
    return True

def run_app():
    """Run the Flask application."""
    print("\nStarting Secure Video Call application...")
    print("Press Ctrl+C to stop the server.")
    
    try:
        subprocess.run([sys.executable, 'app.py'], check=True)
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except subprocess.CalledProcessError:
        print("\nError running the application. Please check the logs for details.")

def main():
    """Main function."""
    print("=" * 60)
    print("Secure Video Call Application Setup")
    print("=" * 60)
    
    # Check if requirements are installed
    print("\nChecking requirements...")
    try:
        import flask
        import flask_socketio
        import eventlet
        from OpenSSL import crypto
        print("All required packages are installed.")
    except ImportError as e:
        print(f"Missing required package: {e}")
        print("Please run 'pip install -r requirements.txt' to install all required packages.")
        return
    
    # Check SSL certificates
    if not check_ssl_certificates():
        return
    
    # Run the application
    run_app()

if __name__ == "__main__":
    main()
