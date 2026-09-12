import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (!socket) {
    try {
      socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        timeout: 2000
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected to real-time notification engine:', socket?.id);
      });

      socket.on('connect_error', (err) => {
        console.warn('[Socket] Connection error (using in-app local event bus):', err.message);
      });
    } catch (e) {
      console.warn('[Socket] Init failed, running in fallback mode');
    }
  }
  return socket;
}

export function subscribeToUserNotifications(collegeId: string, callback: (event: any) => void) {
  const s = getSocket();
  if (s) {
    s.emit('join_user_room', collegeId);
    s.on('complaint:status_updated', callback);
  }
  return () => {
    if (s) {
      s.off('complaint:status_updated', callback);
    }
  };
}
