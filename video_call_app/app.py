import os
import secrets
from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room
import ssl

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store active rooms
rooms = {}

@app.route('/')
def index():
    """Serve the index page"""
    return render_template('index.html')

@app.route('/call/<room_id>')
def call(room_id):
    """Serve the call page"""
    return render_template('call.html', room_id=room_id)

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'Client disconnected: {request.sid}')
    # Remove user from any rooms they were in
    for room_id, room in list(rooms.items()):
        if request.sid in room['participants']:
            room['participants'].remove(request.sid)
            # If room is empty, remove it
            if not room['participants']:
                del rooms[room_id]
            else:
                # Notify other participants
                emit('user-disconnected', {'sid': request.sid}, to=room_id)

@socketio.on('create-room')
def handle_create_room(data):
    """Create a new room"""
    room_id = secrets.token_urlsafe(8)
    rooms[room_id] = {
        'participants': [],
        'creator': request.sid
    }
    emit('room-created', {'room_id': room_id})

@socketio.on('join-room')
def handle_join_room(data):
    """Join an existing room"""
    room_id = data['room_id']
    if room_id not in rooms:
        emit('error', {'message': 'Room not found'})
        return
    
    # Join the room
    join_room(room_id)
    rooms[room_id]['participants'].append(request.sid)
    
    # Notify other participants
    emit('user-joined', {'sid': request.sid}, to=room_id, include_self=False)
    
    # Send list of existing participants to the new user
    participants = [sid for sid in rooms[room_id]['participants'] if sid != request.sid]
    emit('existing-participants', {'participants': participants})

@socketio.on('leave-room')
def handle_leave_room(data):
    """Leave a room"""
    room_id = data['room_id']
    if room_id in rooms and request.sid in rooms[room_id]['participants']:
        leave_room(room_id)
        rooms[room_id]['participants'].remove(request.sid)
        
        # If room is empty, remove it
        if not rooms[room_id]['participants']:
            del rooms[room_id]
        else:
            # Notify other participants
            emit('user-left', {'sid': request.sid}, to=room_id)

@socketio.on('signal')
def handle_signal(data):
    """Handle WebRTC signaling"""
    to_sid = data['to']
    # Forward the signal to the recipient
    emit('signal', {
        'from': request.sid,
        'signal': data['signal']
    }, to=to_sid)

def create_ssl_context():
    """Create SSL context for secure connections"""
    cert_path = os.path.join('ssl', 'cert.pem')
    key_path = os.path.join('ssl', 'key.pem')
    
    if not (os.path.exists(cert_path) and os.path.exists(key_path)):
        print("SSL certificates not found. Please run generate_ssl.py first.")
        return None
    
    context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    context.load_cert_chain(cert_path, key_path)
    return context

if __name__ == '__main__':
    ssl_context = create_ssl_context()
    if ssl_context:
        socketio.run(app, host='0.0.0.0', port=5000, ssl_context=ssl_context, debug=True)
    else:
        print("Running without SSL (not secure for production)")
        socketio.run(app, host='0.0.0.0', port=5000, debug=True)
