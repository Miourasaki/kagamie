import { ReactiveState, useReactiveState } from '@/lib/state';
import { Vector2 } from '@/lib/type';
import { Color, rgbToHsv, hsvToRgb, rgbToHex } from '@/lib/utils/color';
import React, { createContext, useEffect, useRef } from 'react';
import { GabanDocument, Pixels } from '@/models/types';
import { io, Socket } from 'socket.io-client';

interface DrawingContextValue {
    selected: ReactiveState<Vector2>
    status: ReactiveState<ToolStatus>
    position: ReactiveState<Vector2>
    scale: ReactiveState<number>
    size: ReactiveState<Vector2>
    click: ReactiveState<Vector2>
    move: ReactiveState<Vector2>
    color: ReactiveState<Color> & {
        updateFromRGB: (r: number, g: number, b: number) => void;
        updateFromHEX: (hex: string) => void;
        updateFromHSV: (h: number, s: number, v: number) => void;
    },
    data: ReactiveState<GabanDocument | null>
    update: ReactiveState<Pixels>
    fetchData: () => Promise<void>
    reset: () => void
    subscribe: (event: string, callback: (...args: any[]) => void) => void
    unsubscribe: (event: string, callback?: (...args: any[]) => void) => void
}

export enum ToolStatus {
    DRAW,
    ERASER,
    MOVE,
    SEARCH,
    SELECT,
}

const DEFAULT_COLOR = {
    r: 255, g: 0, b: 0,
    h: 0, s: 100, v: 100,
    hex: '#ff0000'
}
const INITIALIZE_BEFORE = () => console.warn("No DrawingProvider found!")

export const DrawingContext = createContext<DrawingContextValue>({
    selected: { value: { x: 0, y: 0 }, set: INITIALIZE_BEFORE },
    status: { value: ToolStatus.MOVE, set: INITIALIZE_BEFORE },
    position: { value: { x: 0, y: 0 }, set: INITIALIZE_BEFORE },
    scale: { value: 0, set: INITIALIZE_BEFORE },
    size: { value: { x: 0, y: 0 }, set: INITIALIZE_BEFORE },
    click: { value: { x: 0, y: 0 }, set: INITIALIZE_BEFORE },
    move: { value: { x: -1, y: -1 }, set: INITIALIZE_BEFORE },
    color: {
        value: DEFAULT_COLOR,
        set: INITIALIZE_BEFORE,
        updateFromRGB: INITIALIZE_BEFORE,
        updateFromHEX: INITIALIZE_BEFORE,
        updateFromHSV: INITIALIZE_BEFORE,
    },
    data: { value: null, set: INITIALIZE_BEFORE },
    update: { value: {}, set: INITIALIZE_BEFORE },
    fetchData: () => Promise.reject(),
    reset: () => { },
    subscribe: INITIALIZE_BEFORE,
    unsubscribe: INITIALIZE_BEFORE
});

export const DrawingProvider = ({ children }: { children: React.ReactNode }) => {
    const selected = useReactiveState<Vector2>({ x: 0, y: 0 });
    const status = useReactiveState<ToolStatus>(ToolStatus.MOVE);
    const colorState = useReactiveState<Color>(DEFAULT_COLOR);
    const position = useReactiveState<Vector2>({ x: 0, y: 0 });
    const scale = useReactiveState<number>(10);
    const size = useReactiveState<Vector2>({ x: 100, y: 100 });
    const click = useReactiveState<Vector2>({ x: 0, y: 0 });
    const move = useReactiveState<Vector2>({ x: -1, y: -1 });

    const data = useReactiveState<GabanDocument | null>(null);
    const update = useReactiveState<Pixels>({});

    const socketRef = useRef<Socket | null>(null);
    const listeners = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());

    const subscribe = (event: string, callback: (...args: any[]) => void) => {
        if (!listeners.current.has(event)) {
            listeners.current.set(event, new Set());
        }
        listeners.current.get(event)?.add(callback);
        socketRef.current?.on(event, callback);
    };

    const unsubscribe = (event: string, callback?: (...args: any[]) => void) => {
        if (callback) {
            listeners.current.get(event)?.delete(callback);
            socketRef.current?.off(event, callback);
        } else {
            listeners.current.delete(event);
            socketRef.current?.off(event);
        }
    };

    const setupSocket = (gabanId: string) => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        const socket = io(`/gaban`, {
            query: { gabanId },
            path: '/socket.io',
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current = socket;

        // 绑定已存在的监听器
        listeners.current.forEach((callbacks, event) => {
            callbacks.forEach(callback => socket.on(event, callback));
        });

        socket.on('connect', () => {
            console.log('成功连接到WebSocket服务器');
        });

        socket.on('disconnect', () => {
            console.log('从画板断开连接');
        });

        return socket;
    };

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/gaban`);
            if (!response.ok) throw new Error('网络响应不正常');

            const d = await response.json() as GabanDocument;
            data.set(d);
            size.set(d.size);

            const socket = setupSocket(d._id.toString());

            // 初始化默认监听器
            socket.on('user-joined', (data) => {
                console.log('用户加入:', data.userId);
            });

            socket.on('user-left', (data) => {
                console.log('用户离开:', data.userId);
            });

            socket.on('draw', (d) => {
                console.log('像素数据更新:', data);
                data.set(o => {
                    if (o) {
                        if (d.color == "clear") delete o.pixels[`${d.x},${d.y}`]
                        else o.pixels[`${d.x},${d.y}`] = d.color;
                    }
                    return o
                })
                update.set({
                    [`${d.x},${d.y}`]: d.color,
                    ...update.value
                })
            });

        } catch (error) {
            console.error('获取像素数据失败:', error);
        }
    };

    useEffect(() => {
        if (!data.value) {
            fetchData().then(() => {
                position.set({
                    x: window.innerWidth / 2 - size.value.x / 2,
                    y: window.innerHeight / 2 - size.value.y / 2
                });
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const reset = () => {
        position.set({
            x: window.innerWidth / 2 - size.value.x / 2,
            y: window.innerHeight / 2 - size.value.y / 2
        });
        scale.set(1)
    }

    // 颜色处理逻辑保持不变
    const updateFromRGB = (r: number, g: number, b: number) => {
        const hsv = rgbToHsv(r, g, b);
        const hex = rgbToHex(r, g, b);
        colorState.set({ r, g, b, ...hsv, hex });
    };

    const updateFromHEX = (hex: string) => {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        updateFromRGB(r, g, b);
    };

    const updateFromHSV = (h: number, s: number, v: number) => {
        const rgb = hsvToRgb(h, s, v);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        colorState.set({ ...rgb, h, s, v, hex });
    };

    const color = {
        ...colorState,
        updateFromRGB,
        updateFromHEX,
        updateFromHSV
    };

    return (
        <DrawingContext.Provider value={{
            selected, status, position, scale, color, move, update, reset,
            data, size, fetchData, click, subscribe, unsubscribe
        }}>
            {children}
        </DrawingContext.Provider>
    );
};