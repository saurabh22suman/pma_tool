document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const roomId = document.getElementById('room-id').textContent;
    const localVideo = document.getElementById('local-video');
    const videoGrid = document.getElementById('video-grid');
    const toggleVideoBtn = document.getElementById('toggle-video-btn');
    const toggleAudioBtn = document.getElementById('toggle-audio-btn');
    const shareScreenBtn = document.getElementById('share-screen-btn');
    const endCallBtn = document.getElementById('end-call-btn');
    const copyRoomIdBtn = document.getElementById('copy-room-id-btn');
    const connectionStatus = document.getElementById('connection-status');
    const statusIndicator = connectionStatus.querySelector('.status-indicator');
    const statusText = connectionStatus.querySelector('.status-text');
    const toggleChatBtn = document.getElementById('toggle-chat-btn');
    const chatSidebar = document.getElementById('chat-sidebar');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    
    // State variables
    let localStream = null;
    let screenStream = null;
    let isScreenSharing = false;
    let isVideoEnabled = true;
    let isAudioEnabled = true;
    let peers = {};
    
    // Socket.IO connection
    const socket = io({
        secure: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });
    
    // Initialize call
    async function initializeCall() {
        try {
            // Get user media with constraints
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Display local video
            localVideo.srcObject = localStream;
            
            // Join room
            socket.emit('join-room', { room_id: roomId });
            
            updateConnectionStatus('Connected', true);
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Could not access camera or microphone. Please check permissions.');
            updateConnectionStatus('Media Error', false);
        }
    }
    
    // Socket.IO event handlers
    socket.on('connect', () => {
        console.log('Connected to server');
        initializeCall();
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        updateConnectionStatus('Disconnected', false);
        
        // Close all peer connections
        Object.values(peers).forEach(peer => peer.destroy());
        peers = {};
    });
    
    socket.on('user-joined', (data) => {
        console.log('User joined:', data.sid);
        // Create a new peer connection for the new user
        const peer = createPeer(data.sid);
        peers[data.sid] = peer;
        
        // Send our stream to the new peer
        if (localStream) {
            localStream.getTracks().forEach(track => {
                peer.addTrack(track, localStream);
            });
        }
    });
    
    socket.on('user-left', (data) => {
        console.log('User left:', data.sid);
        if (peers[data.sid]) {
            peers[data.sid].destroy();
            delete peers[data.sid];
        }
        
        // Remove video element
        const videoElement = document.getElementById(`video-${data.sid}`);
        if (videoElement) {
            videoElement.parentElement.remove();
        }
    });
    
    socket.on('existing-participants', (data) => {
        console.log('Existing participants:', data.participants);
        // Create peer connections for existing participants
        data.participants.forEach(sid => {
            const peer = createPeer(sid);
            peers[sid] = peer;
            
            // Send our stream to the peer
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    peer.addTrack(track, localStream);
                });
            }
            
            // Signal to the peer that we want to connect
            socket.emit('signal', {
                to: sid,
                signal: { type: 'new-peer' }
            });
        });
    });
    
    socket.on('signal', (data) => {
        const { from, signal } = data;
        
        if (!peers[from]) {
            // Create a new peer if it doesn't exist
            const peer = createPeer(from, false);
            peers[from] = peer;
        }
        
        try {
            // Handle the signal
            if (signal.type === 'offer') {
                peers[from].signal(signal);
            } else if (signal.type === 'answer') {
                peers[from].signal(signal);
            } else if (signal.type === 'candidate') {
                peers[from].signal(signal);
            } else if (signal.type === 'new-peer') {
                // Send an offer to the peer
                const offer = peers[from].createOffer();
                peers[from].setLocalDescription(offer);
                socket.emit('signal', {
                    to: from,
                    signal: offer
                });
            }
        } catch (error) {
            console.error('Error handling signal:', error);
        }
    });
    
    socket.on('error', (data) => {
        alert(`Error: ${data.message}`);
    });
    
    // Create a peer connection
    function createPeer(peerId, initiator = true) {
        const peer = new SimplePeer({
            initiator,
            trickle: true,
            stream: localStream
        });
        
        // Handle peer events
        peer.on('signal', signal => {
            socket.emit('signal', {
                to: peerId,
                signal
            });
        });
        
        peer.on('stream', stream => {
            // Create video element for the remote stream
            addVideoStream(peerId, stream);
        });
        
        peer.on('error', err => {
            console.error('Peer connection error:', err);
        });
        
        return peer;
    }
    
    // Add a video stream to the grid
    function addVideoStream(userId, stream) {
        // Check if video already exists
        if (document.getElementById(`video-${userId}`)) {
            return;
        }
        
        // Create container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        // Create video element
        const video = document.createElement('video');
        video.id = `video-${userId}`;
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        
        // Create label
        const label = document.createElement('div');
        label.className = 'video-label';
        label.textContent = 'Participant';
        
        // Add elements to container
        videoContainer.appendChild(video);
        videoContainer.appendChild(label);
        
        // Add container to grid
        videoGrid.appendChild(videoContainer);
    }
    
    // Toggle video
    toggleVideoBtn.addEventListener('click', () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                isVideoEnabled = !isVideoEnabled;
                videoTrack.enabled = isVideoEnabled;
                
                // Update button state
                toggleVideoBtn.classList.toggle('disabled', !isVideoEnabled);
                toggleVideoBtn.querySelector('span').textContent = isVideoEnabled ? 'videocam' : 'videocam_off';
            }
        }
    });
    
    // Toggle audio
    toggleAudioBtn.addEventListener('click', () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                isAudioEnabled = !isAudioEnabled;
                audioTrack.enabled = isAudioEnabled;
                
                // Update button state
                toggleAudioBtn.classList.toggle('disabled', !isAudioEnabled);
                toggleAudioBtn.querySelector('span').textContent = isAudioEnabled ? 'mic' : 'mic_off';
            }
        }
    });
    
    // Share screen
    shareScreenBtn.addEventListener('click', async () => {
        try {
            if (!isScreenSharing) {
                // Start screen sharing
                screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });
                
                // Replace video track with screen track
                const videoTrack = screenStream.getVideoTracks()[0];
                const senders = Object.values(peers).flatMap(peer => 
                    peer._senders.filter(sender => sender.track.kind === 'video')
                );
                
                senders.forEach(sender => sender.replaceTrack(videoTrack));
                
                // Update local video
                localVideo.srcObject = screenStream;
                
                // Listen for screen sharing end
                videoTrack.onended = () => {
                    stopScreenSharing();
                };
                
                isScreenSharing = true;
                shareScreenBtn.querySelector('span').textContent = 'stop_screen_share';
            } else {
                stopScreenSharing();
            }
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    });
    
    // Stop screen sharing
    function stopScreenSharing() {
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            
            // Restore video track
            if (localStream) {
                const videoTrack = localStream.getVideoTracks()[0];
                if (videoTrack) {
                    const senders = Object.values(peers).flatMap(peer => 
                        peer._senders.filter(sender => sender.track.kind === 'video')
                    );
                    
                    senders.forEach(sender => sender.replaceTrack(videoTrack));
                    
                    // Update local video
                    localVideo.srcObject = localStream;
                }
            }
            
            isScreenSharing = false;
            shareScreenBtn.querySelector('span').textContent = 'screen_share';
        }
    }
    
    // End call
    endCallBtn.addEventListener('click', () => {
        // Leave room
        socket.emit('leave-room', { room_id: roomId });
        
        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }
        
        // Close all peer connections
        Object.values(peers).forEach(peer => peer.destroy());
        
        // Redirect to home page
        window.location.href = '/';
    });
    
    // Copy room ID
    copyRoomIdBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(roomId)
            .then(() => {
                // Change button text temporarily
                const originalText = copyRoomIdBtn.textContent;
                copyRoomIdBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyRoomIdBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    });
    
    // Toggle chat sidebar
    toggleChatBtn.addEventListener('click', () => {
        chatSidebar.classList.toggle('open');
    });
    
    // Close chat sidebar
    closeChatBtn.addEventListener('click', () => {
        chatSidebar.classList.remove('open');
    });
    
    // Send chat message
    sendMessageBtn.addEventListener('click', sendChatMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    function sendChatMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Add message to chat
            addChatMessage('You', message, true);
            
            // Clear input
            chatInput.value = '';
            
            // TODO: Implement data channel for chat messages
            // For now, this is just a UI demonstration
        }
    }
    
    // Add chat message to the chat window
    function addChatMessage(sender, message, isSent = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${isSent ? 'sent' : 'received'}`;
        
        const senderElement = document.createElement('div');
        senderElement.className = 'chat-message-sender';
        senderElement.textContent = sender;
        
        const contentElement = document.createElement('div');
        contentElement.className = 'chat-message-content';
        contentElement.textContent = message;
        
        messageElement.appendChild(senderElement);
        messageElement.appendChild(contentElement);
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Update connection status
    function updateConnectionStatus(text, isConnected) {
        statusText.textContent = text;
        statusIndicator.classList.toggle('disconnected', !isConnected);
    }
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        // Leave room
        socket.emit('leave-room', { room_id: roomId });
        
        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }
    });
});
