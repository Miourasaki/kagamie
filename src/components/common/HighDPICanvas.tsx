import React, { useRef, useEffect, useImperativeHandle } from 'react';

export interface HighDPICanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
    width?: number;
    height?: number;
    draw?: (ctx: CanvasRenderingContext2D, option: DrawFnOption) => void;
    clearEffect?: () => void
}

export interface DrawFnOption {
    width: number;
    height: number;
    dpr: number;
    canvas: HTMLCanvasElement;
}

export interface HighDPICanvasHandle {
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;

}

export interface DrawHandle extends HighDPICanvasHandle {
    clear: () => void;
    draw: (fn: (ctx: CanvasRenderingContext2D, option: DrawFnOption) => void) => void;
}


const HighDPICanvas = React.forwardRef<DrawHandle, HighDPICanvasProps>(({
    width = 300,
    height = 150,
    draw,
    style = {},
    clearEffect = null,
    ...props
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(dpr, dpr);
        ctxRef.current = ctx;

        if (draw) {
            draw(ctx, {
                width: rect.width,
                height: rect.height,
                dpr,
                canvas,
            });
        }

        return () => {
            if (clearEffect) clearEffect()
        };
    }, [width, height, draw]);

    useImperativeHandle(ref, () => ({
        canvas: canvasRef.current,
        ctx: ctxRef.current,
        clear: () => {
            if (!ctxRef.current || !canvasRef.current) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = canvasRef.current.getBoundingClientRect();
            ctxRef.current.clearRect(0, 0, rect.width * dpr, rect.height * dpr);
        },
        draw: (fn) => {
            if (!ctxRef.current || !canvasRef.current) return;
            ctxRef.current.save()
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            fn(ctxRef.current, {
                width: rect.width,
                height: rect.height,
                dpr,
                canvas,
            })
            ctxRef.current.restore()
        },
    }));


    return (
        <canvas
            ref={canvasRef}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                ...style,
            }}
            {...props}
        >你的浏览器是老古董哦（。＾▽＾）! 这边推荐使用Chrome浏览器呢</canvas>
    );
});

export default HighDPICanvas;