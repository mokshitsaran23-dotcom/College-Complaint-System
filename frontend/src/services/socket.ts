import { io, Socket } from 'socket.io-client';
import { User } from '../types';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (!socket) {
    try {
      socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 3000
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected to real-time notification engine:', socket?.id);
      });

      socket.on('connect_error', (err) => {
        console.warn('[Socket] Real-time connection error:', err.message);
      });
    } catch (e) {
      console.warn('[Socket] Socket init failed');
    }
  }
  return socket;
}

export function subscribeToUserNotifications(user: User, callback: (event: any) => void) {
  const s = getSocket();
  if (s && user) {
    s.emit('join_user_room', user.collegeId);
    if (user.role) {
      s.emit('join_role_room', user.role);
    }
    if (user.department) {
      s.emit('join_dept_room', user.department);
    }

    const events = [
      'notification:new',
      'complaint:status_updated',
      'complaint:created',
      'complaint:assigned',
      'complaint:work_completed',
      'complaint:resolved',
      'complaint:rework_required',
      'global:complaint_event'
    ];

    events.forEach(ev => s.on(ev, callback));

    return () => {
      events.forEach(ev => s.off(ev, callback));
    };
  }

  return () => {};
}
