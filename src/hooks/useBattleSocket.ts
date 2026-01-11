/**
 * 🔌 MathBot Arena - WebSocket Client Hook
 * React hook for connecting to the battle server
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientMessage, ServerMessage } from '../../server/types';
import { BattleHero } from '../battle/battleMechanics';

interface UseBattleSocketOptions {
  serverUrl: string;
  userId: string;
  onMessage?: (message: ServerMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseBattleSocketReturn {
  socket: Socket | null;
  connected: boolean;
  findMatch: (hero: BattleHero, rank: number, ageCategory: 'child' | 'teen' | 'adult') => void;
  cancelQueue: () => void;
  ready: (battleId: string) => void;
  submitAnswer: (battleId: string, answer: number, timeTaken: number) => void;
  useUltimate: (battleId: string) => void;
  surrender: (battleId: string) => void;
  sendHeartbeat: (battleId: string) => void;
}

export function useBattleSocket(options: UseBattleSocketOptions): UseBattleSocketReturn {
  const { serverUrl, userId, onMessage, onConnect, onDisconnect, onError } = options;

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    const socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('🔌 Connected to battle server:', socket.id);
      setConnected(true);
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from battle server:', reason);
      setConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      onError?.(error);
    });

    // Message handler
    socket.on('message', (message: ServerMessage) => {
      console.log('📨 Received message:', message.type);
      onMessage?.(message);
    });

    // Cleanup
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [serverUrl, onMessage, onConnect, onDisconnect, onError]);

  // Send message helper
  const sendMessage = useCallback((message: ClientMessage) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', message);
    } else {
      console.warn('⚠️ Socket not connected, cannot send message');
    }
  }, []);

  // API methods
  const findMatch = useCallback((
    hero: BattleHero,
    rank: number,
    ageCategory: 'child' | 'teen' | 'adult'
  ) => {
    sendMessage({
      type: 'FIND_MATCH',
      payload: {
        userId,
        heroData: hero,
        rank,
        ageCategory
      }
    });
  }, [sendMessage, userId]);

  const cancelQueue = useCallback(() => {
    sendMessage({
      type: 'CANCEL_QUEUE',
      payload: { userId }
    });
  }, [sendMessage, userId]);

  const ready = useCallback((battleId: string) => {
    sendMessage({
      type: 'READY',
      payload: { battleId }
    });
  }, [sendMessage]);

  const submitAnswer = useCallback((battleId: string, answer: number, timeTaken: number) => {
    sendMessage({
      type: 'SUBMIT_ANSWER',
      payload: { battleId, answer, timeTaken }
    });
  }, [sendMessage]);

  const useUltimate = useCallback((battleId: string) => {
    sendMessage({
      type: 'USE_ULTIMATE',
      payload: { battleId }
    });
  }, [sendMessage]);

  const surrender = useCallback((battleId: string) => {
    sendMessage({
      type: 'SURRENDER',
      payload: { battleId }
    });
  }, [sendMessage]);

  const sendHeartbeat = useCallback((battleId: string) => {
    sendMessage({
      type: 'HEARTBEAT',
      payload: { battleId }
    });
  }, [sendMessage]);

  return {
    socket: socketRef.current,
    connected,
    findMatch,
    cancelQueue,
    ready,
    submitAnswer,
    useUltimate,
    surrender,
    sendHeartbeat
  };
}

console.log('🔌 useBattleSocket hook loaded');
