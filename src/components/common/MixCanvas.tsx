import React, { useRef, useImperativeHandle } from 'react';
import HighDPICanvas, { DrawFnOption, DrawHandle, HighDPICanvasHandle, HighDPICanvasProps } from './HighDPICanvas';

interface MixCanvasProps extends HighDPICanvasProps {
}


export type DrawFunc = (ctx: CanvasRenderingContext2D, option: DrawFnOption) => void

export interface MixCanvasHandle extends HighDPICanvasHandle {
    draw: (fn: DrawFunc) => number;
    clear: (id: number) => void
}


const MixCanvas = React.forwardRef<MixCanvasHandle, MixCanvasProps>(({
    ...props
}, ref) => {
    const canvas = useRef<DrawHandle>(null);
    const drawFns = useRef<Map<number, (ctx: CanvasRenderingContext2D, option: DrawFnOption) => void>>(new Map());
    let animationFrameId = useRef<number>(undefined);


    const draw = (ctx: CanvasRenderingContext2D, option: DrawFnOption) => {
        const { width, height } = option;
        ctx.clearRect(0, 0, width, height);
        // ctx.fillRect(0, 0, width, height);

        drawFns.current.forEach(fn => {
            ctx.save();
            fn(ctx, option);
            ctx.restore();
        });

        animationFrameId.current = requestAnimationFrame((_) => draw(ctx, option));
    };



    useImperativeHandle(ref, () => ({
        canvas: canvas.current?.canvas || null,
        ctx: canvas.current?.ctx || null,
        clear: (id) => {
            drawFns.current.delete(id);
        },
        draw: (fn) => {
            const id = Math.floor(Math.random() * 10000)
            drawFns.current.set(id, fn);
            return id
        },
    }))

    return (
        <HighDPICanvas
            ref={canvas}
            draw={draw}
            clearEffect={() => {
                if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            }}
            {...props}
        />
    );
});

export default MixCanvas;