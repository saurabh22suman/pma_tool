# Secure Video Call Web Application

A lightweight, secure video calling web application built with Python and WebRTC.

## Features

- Secure peer-to-peer video calls using WebRTC
- SSL/TLS encryption for secure connections
- Room-based calling system with unique IDs
- Video and audio toggle controls
- Screen sharing capability
- Chat functionality
- Responsive design for desktop and mobile devices
- Low latency, high-quality video and audio

## Technology Stack

- **Backend**: Python with Flask and Flask-SocketIO
- **Frontend**: HTML, CSS, JavaScript
- **Real-time Communication**: WebRTC (via Simple-Peer)
- **Signaling**: Socket.IO with Gevent
- **Security**: SSL/TLS with self-signed certificates (for development)

## Prerequisites

- Python 3.8 or higher (compatible with Python 3.12)
- pip (Python package manager)
- setuptools (for distutils module)
- Modern web browser with WebRTC support (Chrome, Firefox, Edge, Safari)

## Installation

### Automatic Installation (Recommended)

1. Clone the repository or download the source code.

2. Run the installation script:
   ```
   python video_call_app/install.py
   ```
   
   Note: The installation script will work correctly regardless of which directory you run it from.
   
   This script will:
   - Check your Python version
   - Install setuptools (which provides the distutils module)
   - Install all required dependencies
   - Generate SSL certificates

### Manual Installation

If you prefer to install manually:

1. Clone the repository or download the source code.

2. Navigate to the project directory:
   ```
   cd video_call_app
   ```

3. Install setuptools (if not already installed):
   ```
   pip install setuptools>=65.5.0
   ```

4. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

5. Generate SSL certificates for secure connections:
   ```
   python generate_ssl.py
   ```

## Usage

1. Start the application using the run script:
   ```
   python video_call_app/run.py
   ```
   
   Or directly with:
   ```
   python video_call_app/app.py
   ```
   
   Note: Both scripts will work correctly regardless of which directory you run them from.

2. Open your web browser and navigate to:
   ```
   https://localhost:5000
   ```
   
   Note: Since the application uses a self-signed certificate, you may need to accept the security warning in your browser.

3. Create a new room or join an existing one by entering a Room ID.

4. Share the Room ID with others to join the call.

5. Use the controls at the bottom of the call screen to:
   - Toggle video on/off
   - Toggle audio on/off
   - Share your screen
   - End the call
   - Open the chat sidebar

## Security Considerations

- This application uses WebRTC, which establishes peer-to-peer connections between users, meaning video and audio data do not pass through the server.
- All connections are secured with SSL/TLS encryption.
- For production use, replace the self-signed certificates with certificates from a trusted Certificate Authority.
- Room IDs are randomly generated and temporary, existing only while the room is active.

## Production Deployment

For production deployment, consider the following:

1. Use a proper WSGI server like Gunicorn instead of the built-in Flask development server.
2. Obtain SSL certificates from a trusted Certificate Authority.
3. Set up proper logging and monitoring.
4. Configure a reverse proxy (like Nginx) for better performance and security.
5. Implement user authentication if needed.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Flask](https://flask.palletsprojects.com/)
- [Socket.IO](https://socket.io/)
- [WebRTC](https://webrtc.org/)
- [Simple-Peer](https://github.com/feross/simple-peer)
