document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const createRoomBtn = document.getElementById('create-room-btn');
    const joinRoomBtn = document.getElementById('join-room-btn');
    const roomIdInput = document.getElementById('room-id-input');
    const roomCreatedModal = document.getElementById('room-created-modal');
    const createdRoomId = document.getElementById('created-room-id');
    const copyRoomIdBtn = document.getElementById('copy-room-id');
    const enterRoomBtn = document.getElementById('enter-room-btn');
    const closeModalBtn = document.querySelector('.close');
    
    // Socket.IO connection
    const socket = io({
        secure: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });
    
    // Socket.IO event handlers
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
    
    socket.on('room-created', (data) => {
        showRoomCreatedModal(data.room_id);
    });
    
    socket.on('error', (data) => {
        alert(`Error: ${data.message}`);
    });
    
    // Event Listeners
    createRoomBtn.addEventListener('click', () => {
        socket.emit('create-room', {});
    });
    
    joinRoomBtn.addEventListener('click', () => {
        const roomId = roomIdInput.value.trim();
        if (roomId) {
            window.location.href = `/call/${roomId}`;
        } else {
            alert('Please enter a valid Room ID');
        }
    });
    
    roomIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinRoomBtn.click();
        }
    });
    
    copyRoomIdBtn.addEventListener('click', () => {
        createdRoomId.select();
        document.execCommand('copy');
        
        // Change button text temporarily
        const originalText = copyRoomIdBtn.textContent;
        copyRoomIdBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyRoomIdBtn.textContent = originalText;
        }, 2000);
    });
    
    enterRoomBtn.addEventListener('click', () => {
        const roomId = createdRoomId.value;
        window.location.href = `/call/${roomId}`;
    });
    
    closeModalBtn.addEventListener('click', () => {
        roomCreatedModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === roomCreatedModal) {
            roomCreatedModal.style.display = 'none';
        }
    });
    
    // Functions
    function showRoomCreatedModal(roomId) {
        createdRoomId.value = roomId;
        roomCreatedModal.style.display = 'flex';
    }
    
    // Privacy policy link (placeholder)
    document.getElementById('privacy-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Privacy Policy: This application uses WebRTC for peer-to-peer video calls. No video or audio data is stored on our servers. Room IDs are randomly generated and temporary.');
    });
});
