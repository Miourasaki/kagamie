import { useReactiveState } from '@/lib/state';
import React, { useState, useEffect, useRef } from 'react';


const FPSDisplay: React.FC = () => {
    const fps = useReactiveState<number>(0);
    const latency = useReactiveState<number>(0); // 用于平滑FPS值
    const frameCount = useRef<number>(0);
    const lastTime = useRef<number>(performance.now());
    const animationRef = useRef<number>(0);
    const fpsRef = useRef<number[]>([]); // 用于平滑FPS值
    const latencyRef = useRef<number[]>([]);
    const latencyTime = useRef<number>(performance.now());

    const updateFPS = (timestamp: number) => {
        frameCount.current += 1;

        const delta = timestamp - lastTime.current;

        latencyRef.current.push(timestamp- latencyTime.current);
        latencyTime.current = timestamp
        if (latencyRef.current.length > 100) {
            latencyRef.current.shift();
        }
        const avgLatency = Math.round(
            latencyRef.current.reduce((sum, val) => sum + val, 0) / latencyRef.current.length
        );
        latency.set(avgLatency)

        if (delta >= 1000) {
            const currentFPS = Math.round((frameCount.current * 1000) / delta);

            fps.set(currentFPS);
            frameCount.current = 0;
            lastTime.current = timestamp;
        }

        animationRef.current = requestAnimationFrame(updateFPS);
    };

    useEffect(() => {
        // 确保在开始时lastTime被正确初始化
        lastTime.current = performance.now();
        animationRef.current = requestAnimationFrame(updateFPS);

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, []);



    return (
        <div className='w-17 flex-col flex items-center gap-1'>

            <div inert className={`w-full text-white bg-amber-600 px-2 py-0.5 rounded-sm flex justify-between items-end`}>
                <div className={`font-bold font-mono`}>{fps.value}</div>
                <div className={`text-xs text-gray-300`}>FPS</div>
            </div>
            <div inert className={`w-full text-white bg-amber-600 px-2 py-0.5 rounded-sm flex justify-between items-end`}>
                <div className={`font-bold font-mono`}>{latency.value}</div>
                <div className={`text-xs text-gray-300`}>MS</div>
            </div>
        </div>
    );
};


export default FPSDisplay;