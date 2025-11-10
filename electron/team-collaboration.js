/**
 * BigDaddyG IDE - Team Collaboration Module
 * 
 * Real-time team collaboration using Firebase (free tier)
 * No backend server needed - uses Firebase as signaling/sync layer
 * 
 * Features:
 * - Room-based collaboration (room codes)
 * - Real-time code sharing
 * - Live cursor positions
 * - Team chat
 * - Member presence
 * - File sharing
 * - Optional: P2P WebRTC for advanced features
 */

class TeamCollaboration {
    constructor() {
        this.firebaseConfig = {
            // NOTE: These are PUBLIC Firebase config (safe to expose)
            // Create your own at: https://console.firebase.google.com
            apiKey: "YOUR_FIREBASE_API_KEY",
            authDomain: "bigdaddyg-ide.firebaseapp.com",
            projectId: "bigdaddyg-ide",
            storageBucket: "bigdaddyg-ide.appspot.com",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID"
        };
        
        this.db = null;
        this.roomCode = null;
        this.localUser = {
            id: this.generateUserId(),
            name: localStorage.getItem('username') || 'Anonymous',
            color: this.generateUserColor()
        };
        
        this.roomRef = null;
        this.unsubscribe = null;
        this.members = new Map();
        this.cursors = new Map();
        
        // Initialize UI
        this.initializeUI();
        
        // Check if Firebase is available
        this.checkFirebase();
    }
    
    // ============================================================================
    // FIREBASE INITIALIZATION
    // ============================================================================
    
    checkFirebase() {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase not loaded. Team features will not work.');
            this.showSetupInstructions();
            return false;
        }
        
        try {
            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }
            this.db = firebase.firestore();
            
            console.log('✅ Firebase initialized for team collaboration');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
            this.showNotification('Firebase setup required for team features', 'warning');
            return false;
        }
    }
    
    showSetupInstructions() {
        const instructions = `
            To enable team features:
            1. Create Firebase project: https://console.firebase.google.com
            2. Add Firebase SDK to index.html
            3. Update firebaseConfig in team-collaboration.js
            
            See: TEAM-COLLABORATION-SETUP.md for full guide
        `;
        console.log(instructions);
    }
    
    // ============================================================================
    // ROOM MANAGEMENT
    // ============================================================================
    
    async createRoom() {
        if (!this.db) {
            this.showNotification('Firebase not initialized', 'error');
            return null;
        }
        
        try {
            const roomCode = this.generateRoomCode();
            
            const roomData = {
                code: roomCode,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                owner: this.localUser.id,
                ownerName: this.localUser.name,
                members: [{
                    id: this.localUser.id,
                    name: this.localUser.name,
                    color: this.localUser.color,
                    joinedAt: Date.now(),
                    online: true
                }],
                currentCode: '',
                currentFile: null,
                messages: [],
                settings: {
                    maxMembers: 10,
                    allowEditing: true,
                    requireApproval: false
                }
            };
            
            await this.db.collection('rooms').doc(roomCode).set(roomData);
            
            this.roomCode = roomCode;
            this.startListening();
            
            this.showNotification(`Room created: ${roomCode}`, 'success');
            this.updateUI();
            
            return roomCode;
            
        } catch (error) {
            console.error('Failed to create room:', error);
            this.showNotification('Failed to create room: ' + error.message, 'error');
            return null;
        }
    }
    
    async joinRoom(roomCode) {
        if (!this.db) {
            this.showNotification('Firebase not initialized', 'error');
            return false;
        }
        
        try {
            roomCode = roomCode.toUpperCase().trim();
            
            // Check if room exists
            const roomDoc = await this.db.collection('rooms').doc(roomCode).get();
            
            if (!roomDoc.exists) {
                this.showNotification('Room not found', 'error');
                return false;
            }
            
            const roomData = roomDoc.data();
            
            // Check member limit
            if (roomData.members.length >= roomData.settings.maxMembers) {
                this.showNotification('Room is full', 'error');
                return false;
            }
            
            // Add self to members
            await this.db.collection('rooms').doc(roomCode).update({
                members: firebase.firestore.FieldValue.arrayUnion({
                    id: this.localUser.id,
                    name: this.localUser.name,
                    color: this.localUser.color,
                    joinedAt: Date.now(),
                    online: true
                })
            });
            
            this.roomCode = roomCode;
            this.startListening();
            
            // Send join message
            await this.sendChatMessage(`${this.localUser.name} joined the room`, 'system');
            
            this.showNotification(`Joined room: ${roomCode}`, 'success');
            this.updateUI();
            
            return true;
            
        } catch (error) {
            console.error('Failed to join room:', error);
            this.showNotification('Failed to join room: ' + error.message, 'error');
            return false;
        }
    }
    
    async leaveRoom() {
        if (!this.roomCode || !this.db) return;
        
        try {
            // Remove self from members
            const roomRef = this.db.collection('rooms').doc(this.roomCode);
            const roomDoc = await roomRef.get();
            
            if (roomDoc.exists) {
                const members = roomDoc.data().members.filter(m => m.id !== this.localUser.id);
                await roomRef.update({ members });
                
                // Send leave message
                await this.sendChatMessage(`${this.localUser.name} left the room`, 'system');
            }
            
            // Stop listening
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
            
            this.roomCode = null;
            this.members.clear();
            this.cursors.clear();
            
            this.showNotification('Left room', 'info');
            this.updateUI();
            
        } catch (error) {
            console.error('Failed to leave room:', error);
        }
    }
    
    startListening() {
        if (!this.roomCode || !this.db) return;
        
        const roomRef = this.db.collection('rooms').doc(this.roomCode);
        
        this.unsubscribe = roomRef.onSnapshot(snapshot => {
            if (!snapshot.exists) return;
            
            const data = snapshot.data();
            this.handleRoomUpdate(data);
        });
    }
    
    handleRoomUpdate(data) {
        // Update members
        this.members.clear();
        data.members.forEach(member => {
            this.members.set(member.id, member);
        });
        
        // Update code if changed by others
        if (data.lastUpdatedBy && data.lastUpdatedBy !== this.localUser.id) {
            if (window.editor && data.currentCode !== window.editor.getValue()) {
                // Only update if local hasn't been modified recently
                const timeSinceUpdate = Date.now() - (this.lastLocalEdit || 0);
                if (timeSinceUpdate > 2000) { // 2 second debounce
                    window.editor.setValue(data.currentCode);
                }
            }
        }
        
        // Update cursor positions
        if (data.cursors) {
            Object.entries(data.cursors).forEach(([userId, cursor]) => {
                if (userId !== this.localUser.id) {
                    this.updateRemoteCursor(userId, cursor);
                }
            });
        }
        
        // Update chat
        if (data.messages && data.messages.length > 0) {
            this.updateChatUI(data.messages);
        }
        
        // Update UI
        this.updateMembersUI();
    }
    
    // ============================================================================
    // CODE SHARING
    // ============================================================================
    
    async shareCode(code) {
        if (!this.roomCode || !this.db) return;
        
        try {
            this.lastLocalEdit = Date.now();
            
            await this.db.collection('rooms').doc(this.roomCode).update({
                currentCode: code,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdatedBy: this.localUser.id
            });
            
        } catch (error) {
            console.error('Failed to share code:', error);
        }
    }
    
    async shareFile(fileName, content) {
        if (!this.roomCode || !this.db) return;
        
        try {
            await this.db.collection('rooms').doc(this.roomCode).update({
                currentFile: {
                    name: fileName,
                    content: content,
                    sharedBy: this.localUser.name,
                    sharedAt: Date.now()
                }
            });
            
            await this.sendChatMessage(`${this.localUser.name} shared: ${fileName}`, 'system');
            
        } catch (error) {
            console.error('Failed to share file:', error);
        }
    }
    
    async shareCursorPosition(line, column) {
        if (!this.roomCode || !this.db) return;
        
        try {
            await this.db.collection('rooms').doc(this.roomCode).update({
                [`cursors.${this.localUser.id}`]: {
                    line: line,
                    column: column,
                    name: this.localUser.name,
                    color: this.localUser.color,
                    timestamp: Date.now()
                }
            });
            
        } catch (error) {
        console.error('[Error]', error);
    }
    }
    
    updateRemoteCursor(userId, cursor) {
        if (!window.editor) return;
        
        // Store cursor data
        this.cursors.set(userId, cursor);
        
        // Visual indicator (implement with Monaco decorations)
        // This would show other users' cursors in the editor
        console.log(`${cursor.name} cursor at ${cursor.line}:${cursor.column}`);
    }
    
    // ============================================================================
    // CHAT
    // ============================================================================
    
    async sendChatMessage(message, type = 'user') {
        if (!this.roomCode || !this.db) return;
        
        try {
            const chatMessage = {
                id: Date.now() + Math.random(),
                userId: this.localUser.id,
                userName: this.localUser.name,
                userColor: this.localUser.color,
                message: message,
                type: type,
                timestamp: Date.now()
            };
            
            await this.db.collection('rooms').doc(this.roomCode).update({
                messages: firebase.firestore.FieldValue.arrayUnion(chatMessage)
            });
            
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }
    
    updateChatUI(messages) {
        const chatMessages = document.getElementById('team-chat-messages');
        if (!chatMessages) return;
        
        // Only show last 50 messages
        const recentMessages = messages.slice(-50);
        
        chatMessages.innerHTML = recentMessages.map(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            const isSystem = msg.type === 'system';
            
            return `
                <div class="chat-message ${isSystem ? 'system-message' : ''}">
                    ${!isSystem ? `
                        <span class="chat-user" style="color: ${msg.userColor}">
                            ${msg.userName}
                        </span>
                    ` : ''}
                    <span class="chat-text">${this.escapeHtml(msg.message)}</span>
                    <span class="chat-time">${time}</span>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // ============================================================================
    // UI MANAGEMENT
    // ============================================================================
    
    initializeUI() {
        const sidebar = document.getElementById('right-sidebar') || 
                        document.querySelector('.right-sidebar') || 
                        document.querySelector('.sidebar');
        
        if (!sidebar) {
            console.warn('Sidebar not found for team panel');
            return;
        }
        
        const teamPanel = document.createElement('div');
        teamPanel.id = 'team-panel';
        teamPanel.className = 'panel team-panel';
        teamPanel.innerHTML = `
            <div class="panel-header">
                <h3>👥 Team Collaboration</h3>
            </div>
            
            <div class="panel-content">
                <!-- Not Connected Section -->
                <div id="team-not-connected" class="team-section">
                    <div class="team-actions">
                        <button id="team-create-room-btn" class="btn btn-primary">
                            ➕ Create Room
                        </button>
                        <div class="join-room-form">
                            <input type="text" 
                                   id="team-room-code-input" 
                                   class="form-input" 
                                   placeholder="Enter room code"
                                   maxlength="6">
                            <button id="team-join-room-btn" class="btn btn-success">
                                🚪 Join Room
                            </button>
                        </div>
                    </div>
                    
                    <div class="team-info">
                        <h4>Your Info</h4>
                        <input type="text" 
                               id="team-username-input" 
                               class="form-input" 
                               placeholder="Your name"
                               value="${this.localUser.name}">
                    </div>
                </div>
                
                <!-- Connected Section -->
                <div id="team-connected" class="team-section" style="display: none;">
                    <div class="room-info">
                        <h4>Room Code</h4>
                        <div class="room-code-display">
                            <input type="text" 
                                   id="team-room-code-display" 
                                   class="form-input" 
                                   readonly>
                            <button id="team-copy-code-btn" class="btn btn-sm btn-secondary">
                                📋 Copy
                            </button>
                        </div>
                        <button id="team-leave-room-btn" class="btn btn-sm btn-secondary">
                            🚪 Leave Room
                        </button>
                    </div>
                    
                    <div class="team-members">
                        <h4>Members (<span id="team-member-count">0</span>)</h4>
                        <div id="team-member-list" class="member-list"></div>
                    </div>
                    
                    <div class="team-chat">
                        <h4>Chat</h4>
                        <div id="team-chat-messages" class="chat-messages"></div>
                        <div class="chat-input-area">
                            <input type="text" 
                                   id="team-chat-input" 
                                   class="form-input" 
                                   placeholder="Type a message...">
                            <button id="team-send-chat-btn" class="btn btn-sm btn-primary">
                                Send
                            </button>
                        </div>
                    </div>
                    
                    <div class="team-actions-connected">
                        <button id="team-share-code-btn" class="btn btn-sm btn-success">
                            📤 Share Current Code
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        sidebar.appendChild(teamPanel);
        
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        // Create room
        const createBtn = document.getElementById('team-create-room-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.createRoom());
        }
        
        // Join room
        const joinBtn = document.getElementById('team-join-room-btn');
        const roomCodeInput = document.getElementById('team-room-code-input');
        if (joinBtn && roomCodeInput) {
            joinBtn.addEventListener('click', () => {
                const code = roomCodeInput.value.trim();
                if (code) this.joinRoom(code);
            });
            
            roomCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const code = roomCodeInput.value.trim();
                    if (code) this.joinRoom(code);
                }
            });
        }
        
        // Leave room
        const leaveBtn = document.getElementById('team-leave-room-btn');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => this.leaveRoom());
        }
        
        // Copy room code
        const copyBtn = document.getElementById('team-copy-code-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const codeDisplay = document.getElementById('team-room-code-display');
                if (codeDisplay) {
                    codeDisplay.select();
                    document.execCommand('copy');
                    this.showNotification('Room code copied!', 'success');
                }
            });
        }
        
        // Update username
        const usernameInput = document.getElementById('team-username-input');
        if (usernameInput) {
            usernameInput.addEventListener('change', (e) => {
                this.localUser.name = e.target.value || 'Anonymous';
                localStorage.setItem('username', this.localUser.name);
            });
        }
        
        // Send chat message
        const sendChatBtn = document.getElementById('team-send-chat-btn');
        const chatInput = document.getElementById('team-chat-input');
        if (sendChatBtn && chatInput) {
            const sendMessage = () => {
                const message = chatInput.value.trim();
                if (message) {
                    this.sendChatMessage(message);
                    chatInput.value = '';
                }
            };
            
            sendChatBtn.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
        
        // Share code
        const shareCodeBtn = document.getElementById('team-share-code-btn');
        if (shareCodeBtn) {
            shareCodeBtn.addEventListener('click', () => {
                if (window.editor) {
                    const code = window.editor.getValue();
                    this.shareCode(code);
                    this.showNotification('Code shared with team!', 'success');
                }
            });
        }
        
        // Listen to editor changes
        if (window.editor) {
            window.editor.onDidChangeModelContent(() => {
                if (this.roomCode) {
                    // Debounce code sharing
                    clearTimeout(this.shareCodeTimeout);
                    this.shareCodeTimeout = setTimeout(() => {
                        const code = window.editor.getValue();
                        this.shareCode(code);
                    }, 1000);
                }
            });
            
            window.editor.onDidChangeCursorPosition((e) => {
                if (this.roomCode) {
                    this.shareCursorPosition(e.position.lineNumber, e.position.column);
                }
            });
        }
    }
    
    updateUI() {
        const notConnected = document.getElementById('team-not-connected');
        const connected = document.getElementById('team-connected');
        const roomCodeDisplay = document.getElementById('team-room-code-display');
        
        if (this.roomCode) {
            // Show connected state
            if (notConnected) notConnected.style.display = 'none';
            if (connected) connected.style.display = 'block';
            if (roomCodeDisplay) roomCodeDisplay.value = this.roomCode;
        } else {
            // Show not connected state
            if (notConnected) notConnected.style.display = 'block';
            if (connected) connected.style.display = 'none';
        }
    }
    
    updateMembersUI() {
        const memberList = document.getElementById('team-member-list');
        const memberCount = document.getElementById('team-member-count');
        
        if (!memberList) return;
        
        if (memberCount) {
            memberCount.textContent = this.members.size;
        }
        
        memberList.innerHTML = Array.from(this.members.values()).map(member => {
            const isYou = member.id === this.localUser.id;
            
            return `
                <div class="member-item">
                    <span class="member-indicator" style="background: ${member.color}"></span>
                    <span class="member-name">${member.name}${isYou ? ' (You)' : ''}</span>
                    <span class="member-status ${member.online ? 'online' : 'offline'}">
                        ${member.online ? '🟢' : '⚫'}
                    </span>
                </div>
            `;
        }).join('');
    }
    
    // ============================================================================
    // UTILITIES
    // ============================================================================
    
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    generateUserColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a',
            '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

let teamCollaboration;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        teamCollaboration = new TeamCollaboration();
        window.teamCollaboration = teamCollaboration;
    });
} else {
    teamCollaboration = new TeamCollaboration();
    window.teamCollaboration = teamCollaboration;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamCollaboration;
}

