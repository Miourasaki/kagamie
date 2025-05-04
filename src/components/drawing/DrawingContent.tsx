import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import MixCanvas, { DrawFunc, MixCanvasHandle } from "../common/MixCanvas";
import { Vector2 } from "@/lib/type";
import { DrawingContext, ToolStatus } from "./DrawingContext";
import { invertHex } from "./ColorPicker";

type StateType<T> = [T, Dispatch<SetStateAction<T>>]
interface DarwingProps {
    offset: StateType<Vector2>
    size: Vector2
    scale: StateType<number>;
}
export type PixelData = {
    width: number
    height: number
    pixels: {
        [key: string]: string
    }
    generatedAt: string,
    totalPixels: number
}
const DrawingContent: React.FC<DarwingProps> = ({ offset, scale, size }) => {

    const canvas = useRef<MixCanvasHandle>(null);
    const [load, setLoad] = useState<boolean>(true);
    const { move, status, data, update, color } = useContext(DrawingContext);

    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });
    useEffect(() => {
        const observer = new ResizeObserver(() => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        });

        observer.observe(document.body);
        return () => observer.disconnect();
    }, []);

    const transformationDraw = (fn: DrawFunc): DrawFunc => {
        return (ctx, opt) => {
            const sca = scale[0];
            const off = offset[0];

            // 应用偏移量
            ctx.translate(off.x, off.y);

            // 应用以中心点为基准的缩放
            const centerX = size.x / 2;
            const centerY = size.y / 2;
            ctx.transform(
                sca, 0,       // 水平缩放
                0, sca,       // 垂直缩放
                centerX * (1 - sca),  // 水平补偿（保证中心点不变）
                centerY * (1 - sca)   // 垂直补偿
            );

            fn(ctx, opt);
        };
    }


    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = size.x;
        offscreenCanvas.height = size.y;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        if (!offscreenCtx) return;
        offscreenCtx.imageSmoothingEnabled = false

        if (data.value) {
            Object.entries(data.value.pixels).forEach(([key, value]) => {
                const [i, j] = key.split(",").map(coord => parseInt(coord, 10));
                offscreenCtx.fillStyle = value;
                offscreenCtx.fillRect(i, j, 1, 1);
            });
            Object.entries(update.value).forEach(([key, value]) => {
                const [i, j] = key.split(",").map(coord => parseInt(coord, 10));
                offscreenCtx.fillStyle = value;
                offscreenCtx.fillRect(i, j, 1, 1);
            });

            if (load) setLoad(false);
        }


        offscreenCanvasRef.current = offscreenCanvas;
        offscreenCtxRef.current = offscreenCtx;

        return () => {
            offscreenCanvasRef.current = null;
            offscreenCtxRef.current = null;
        };
    }, [data.value, update.value]);

    useEffect(() => {
        if (!canvas.current) return
        const ids: number[] = []

        ids.push(canvas.current.draw(transformationDraw((ctx, _) => {
            // ctx.fillRect(0, 0, 10, 10)
            ctx.imageSmoothingEnabled = false
            if (offscreenCanvasRef.current) ctx.drawImage(
                offscreenCanvasRef.current!,
                0,
                0,
                size.x,
                size.y
            );
        })))

        ids.push(canvas.current.draw(transformationDraw((ctx, _) => {
            if (status.value != ToolStatus.DRAW) return
            // ctx.fillRect(0, 0, 10, 10)
            const p = move.value
            ctx.imageSmoothingEnabled = false

            ctx.translate(p.x, p.y)
            ctx.scale(1 / 10, 1 / 10)

            ctx.fillStyle = color.value.hex
            ctx.strokeStyle = invertHex(color.value.hex)
            ctx.lineWidth = 0.1

            ctx.rect(-1, 0, 12, 1)
            ctx.rect(0, -1, 1, 12)
            ctx.rect(9, -1, 1, 12)
            ctx.rect(-1, 9, 12, 1)
            ctx.fill()
            ctx.stroke()
        })))


        return () => {
            for (const id of ids) canvas.current?.clear(id)
        }
    }, [offset[0], scale[0], move, status])


    return (<>
        <div inert={!load} style={{
            opacity: load ? 1 : 0
        }} id="load" className="fixed size-full inset-0 bg-white flex items-center justify-center z-10 transition-opacity ease-in-out">
            <div className="loading la-2x">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <MixCanvas
            ref={canvas}
            className="absolute inset-0" inert
            width={dimensions.width}
            height={dimensions.height} ></MixCanvas></>); // Return a valid ReactNode or JSX

}


const DrawingContentClient = dynamic(
    () => Promise.resolve(DrawingContent),
    { ssr: false }
);


export default DrawingContent;

