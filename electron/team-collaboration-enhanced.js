/**
 * BigDaddyG IDE - Enhanced Team Collaboration
 * Full screen sharing, voice, video, and real-time collaboration
 */

class TeamCollaborationEnhanced {
    constructor() {
        this.initialized = false;
        this.session = null;
        this.peers = new Map();
        this.mediaStreams = new Map();
        this.connections = new Map();
        this.useFirebase = false;
        this.useWebRTC = true;
        this.screenStream = null;
        this.voiceStream = null;
        
        console.log('[TeamCollab Enhanced] Initializing...');
    }
    
    /**
     * Initialize enhanced team collaboration
     */
    async initialize() {
        console.log('[TeamCollab Enhanced] Starting initialization...');
        
        // Check Firebase availability
        if (typeof firebase !== 'undefined') {
            this.useFirebase = true;
            console.log('[TeamCollab Enhanced] Firebase backend available');
        } else {
            console.warn('[TeamCollab Enhanced] Firebase not available, using WebRTC P2P only');
        }
        
        // Check WebRTC support
        if (navigator.mediaDevices) {
            this.useWebRTC = true;
            console.log('[TeamCollab Enhanced] WebRTC support detected');
        } else {
            console.warn('[TeamCollab Enhanced] WebRTC not supported in this browser');
        }
        
        this.initialized = true;
        return true;
    }
    
    /**
     * Create collaboration session
     */
    async createSession(options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const sessionId = this.generateSessionId();
        
        this.session = {
            id: sessionId,
            owner: options.username || 'Host',
            created: Date.now(),
            peers: [],
            features: {
                screenShare: options.screenShare !== false,
                cursorTracking: options.cursorTracking !== false,
                chat: options.chat !== false,
                voice: options.voice !== false,
                video: options.video !== false
            }
        };
        
        console.log(`[TeamCollab Enhanced] Session created: ${sessionId}`);
        
        // Broadcast session creation if Firebase available
        if (this.useFirebase && this.db) {
            await this.db.collection('sessions').doc(sessionId).set({
                ...this.session,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        return sessionId;
    }
    
    /**
     * Join existing session
     */
    async joinSession(sessionId, username) {
        console.log(`[TeamCollab Enhanced] Joining session ${sessionId} as ${username}`);
        
        this.session = {
            id: sessionId,
            username,
            joined: Date.now(),
            isOwner: false
        };
        
        // Connect to session via Firebase or WebRTC
        if (this.useFirebase && this.db) {
            await this.subscribeToSession(sessionId);
        }
        
        return true;
    }
    
    /**
     * Screen sharing
     */
    async startScreenShare() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            console.error('[TeamCollab Enhanced] Screen sharing not supported');
            this.showNotification('Screen sharing not supported in your browser', 'error');
            return null;
        }
        
        try {
            console.log('[TeamCollab Enhanced] Starting screen share...');
            
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            
            this.screenStream = stream;
            
            // Broadcast screen stream to peers
            this.broadcastStream(stream, 'screen');
            
            // Handle stream end
            stream.getVideoTracks()[0].onended = () => {
                console.log('[TeamCollab Enhanced] Screen share ended');
                this.stopScreenShare();
            };
            
            console.log('[TeamCollab Enhanced] Screen sharing active');
            this.showNotification('Screen sharing started', 'success');
            
            return stream;
            
        } catch (error) {
            console.error('[TeamCollab Enhanced] Screen share failed:', error);
            
            if (error.name === 'NotAllowedError') {
                this.showNotification('Screen sharing permission denied', 'error');
            } else if (error.name === 'NotFoundError') {
                this.showNotification('No screen available for sharing', 'error');
            } else {
                this.showNotification('Screen sharing failed: ' + error.message, 'error');
            }
            
            return null;
        }
    }
    
    /**
     * Stop screen sharing
     */
    stopScreenShare() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
            console.log('[TeamCollab Enhanced] Screen share stopped');
            this.showNotification('Screen sharing stopped', 'info');
        }
    }
    
    /**
     * Voice communication
     */
    async startVoice() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('[TeamCollab Enhanced] Voice not supported');
            return null;
        }
        
        try {
            console.log('[TeamCollab Enhanced] Starting voice...');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000
                },
                video: false
            });
            
            this.voiceStream = stream;
            this.broadcastStream(stream, 'voice');
            
            console.log('[TeamCollab Enhanced] Voice active');
            this.showNotification('Voice communication started', 'success');
            
            return stream;
            
        } catch (error) {
            console.error('[TeamCollab Enhanced] Voice failed:', error);
            this.showNotification('Microphone access denied', 'error');
            return null;
        }
    }
    
    /**
     * Stop voice
     */
    stopVoice() {
        if (this.voiceStream) {
            this.voiceStream.getTracks().forEach(track => track.stop());
            this.voiceStream = null;
            console.log('[TeamCollab Enhanced] Voice stopped');
        }
    }
    
    /**
     * Cursor tracking
     */
    sendCursorPosition(x, y, fileName = '') {
        if (!this.session) return;
        
        const data = {
            type: 'cursor',
            x, y,
            fileName,
            user: this.session.username,
            userId: this.session.id,
            timestamp: Date.now()
        };
        
        this.broadcast(data);
    }
    
    /**
     * Code synchronization
     */
    sendCodeChange(fileName, content, cursorPosition) {
        if (!this.session) return;
        
        const data = {
            type: 'code',
            fileName,
            content,
            cursorPosition,
            user: this.session.username,
            timestamp: Date.now()
        };
        
        this.broadcast(data);
    }
    
    /**
     * Chat message
     */
    sendMessage(message) {
        if (!this.session) return;
        
        const data = {
            type: 'chat',
            message,
            user: this.session.username,
            timestamp: Date.now()
        };
        
        this.broadcast(data);
        
        // Also store in Firebase if available
        if (this.useFirebase && this.db && this.session.id) {
            this.db.collection('sessions').doc(this.session.id)
                .collection('messages').add(data);
        }
    }
    
    /**
     * Broadcast data to all peers
     */
    broadcast(data) {
        // WebRTC broadcast
        for (const [peerId, connection] of this.connections) {
            try {
                if (connection.dataChannel && connection.dataChannel.readyState === 'open') {
                    connection.dataChannel.send(JSON.stringify(data));
                }
            } catch (error) {
                console.error(`[TeamCollab Enhanced] Failed to send to ${peerId}:`, error);
            }
        }
        
        // Firebase broadcast (if available)
        if (this.useFirebase && this.db && this.session && this.session.id) {
            this.db.collection('sessions').doc(this.session.id)
                .collection('events').add({
                    ...data,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
        }
    }
    
    /**
     * Broadcast media stream
     */
    broadcastStream(stream, type) {
        for (const [peerId, connection] of this.connections) {
            try {
                stream.getTracks().forEach(track => {
                    connection.peerConnection.addTrack(track, stream);
                });
                console.log(`[TeamCollab Enhanced] Broadcasting ${type} to ${peerId}`);
            } catch (error) {
                console.error(`[TeamCollab Enhanced] Failed to broadcast ${type}:`, error);
            }
        }
    }
    
    /**
     * Create WebRTC peer connection
     */
    async createPeerConnection(peerId) {
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        const pc = new RTCPeerConnection(config);
        
        // Data channel for messages
        const dataChannel = pc.createDataChannel('bigdaddyg-collab');
        
        dataChannel.onopen = () => {
            console.log(`[TeamCollab Enhanced] Data channel open with ${peerId}`);
        };
        
        dataChannel.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data));
        };
        
        // Handle incoming tracks
        pc.ontrack = (event) => {
            console.log(`[TeamCollab Enhanced] Received track from ${peerId}`);
            this.mediaStreams.set(peerId, event.streams[0]);
            this.emit('peerStream', { peerId, stream: event.streams[0] });
        };
        
        this.connections.set(peerId, { peerConnection: pc, dataChannel });
        
        return pc;
    }
    
    /**
     * Handle received message
     */
    handleMessage(data) {
        switch (data.type) {
            case 'cursor':
                this.emit('cursorMove', data);
                break;
            case 'code':
                this.emit('codeChange', data);
                break;
            case 'chat':
                this.emit('chatMessage', data);
                break;
            default:
                console.log('[TeamCollab Enhanced] Unknown message type:', data.type);
        }
    }
    
    /**
     * Event emitter
     */
    emit(event, data) {
        const eventName = `teamcollab:${event}`;
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
    
    /**
     * Subscribe to session updates (Firebase)
     */
    async subscribeToSession(sessionId) {
        if (!this.db) return;
        
        const sessionRef = this.db.collection('sessions').doc(sessionId);
        
        // Listen for events
        this.unsubscribe = sessionRef.collection('events')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        this.handleMessage(change.doc.data());
                    }
                });
            });
    }
    
    /**
     * Disconnect from session
     */
    disconnect() {
        console.log('[TeamCollab Enhanced] Disconnecting...');
        
        // Stop all media
        this.stopScreenShare();
        this.stopVoice();
        
        // Close all peer connections
        for (const [peerId, connection] of this.connections) {
            if (connection.dataChannel) connection.dataChannel.close();
            if (connection.peerConnection) connection.peerConnection.close();
        }
        this.connections.clear();
        
        // Unsubscribe from Firebase
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        
        this.session = null;
        console.log('[TeamCollab Enhanced] Disconnected');
    }
    
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        console.log(`[TeamCollab Enhanced] [${type}] ${message}`);
        
        // Try to use IDE's notification system
        if (window.showNotification) {
            window.showNotification(message, type);
        } else if (window.Notification && Notification.permission === 'granted') {
            new Notification('Team Collaboration', { body: message });
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamCollaborationEnhanced;
} else {
    window.TeamCollaborationEnhanced = TeamCollaborationEnhanced;
    
    // Auto-initialize
    if (!window.teamCollabEnhanced) {
        window.teamCollabEnhanced = new TeamCollaborationEnhanced();
        window.teamCollabEnhanced.initialize();
    }
}
