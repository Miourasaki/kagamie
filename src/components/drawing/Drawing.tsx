import DefaultAvatar from '@/assets/default_avatar.webp'

import TransformContainer, { TransformContainerRef } from '@/components/common/TransformContainer';
import React, { CSSProperties, useContext, useEffect, useRef } from 'react';
import DrawingMenu from '@/components/drawing/DrawingMenu';
import { Vector2 } from '@/lib/type';
import DrawingContent from '@/components/drawing/DrawingContent';
import { DrawingContext, DrawingProvider, ToolStatus } from '@/components/drawing/DrawingContext';
import { useReactiveState } from '@/lib/state';
import { RecordDocument } from '@/models/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import DrawingContextMenu from './DrawingContextMenu';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const Main = () => {

    const { status, position, scale, color, data, size, click, move } = useContext(DrawingContext)

    const container = useRef<TransformContainerRef>(null)

    useEffect(() => {

        const handleMouseDown = (ev: MouseEvent) => {
            if (ev.button !== 1) return;
            const originalStatus = status.value;
            status.set(ToolStatus.MOVE);
            container.current?.startDragging();

            const handleMouseUp = (ev: MouseEvent) => {
                if (ev.button !== 1) return;
                status.set(originalStatus);
                window.removeEventListener('mouseup', handleMouseUp); // 移除自身
            };
            window.addEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousedown', handleMouseDown);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [status]); // 确保依赖项正确


    const recordDialog = useReactiveState<boolean>(false);
    const record = useReactiveState<RecordDocument[] | { error: string } | null>(null);
    function formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);

        const datePart = new Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            day: '2-digit'
        }).format(date);

        const timePart = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date);

        return `${datePart} ${timePart}`;
    }


    const getPosition = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>): Vector2 => {
        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect(); // 获取 canvas 的边界矩形
        const scaleX = canvas.width / rect.width; // 水平方向的缩放比例
        const scaleY = canvas.height / rect.height; // 垂直方向的缩放比例

        // 根据鼠标点击位置计算实际像素坐标
        return {
            x: Math.floor((e.clientX - rect.left) * scaleX),
            y: Math.floor((e.clientY - rect.top) * scaleY),
        };
    }


    const cursorStyle = (): CSSProperties => {
        const result: CSSProperties = {};
        switch (status.value) {
            case ToolStatus.DRAW:
                // if (scale.value > 13) result["cursor"] = 'none';
                break;
        }
        return result; // Ensure an object is always returned
    }

    return (<>
        <div style={{ width: '100vw', height: '100vh' }} className={`bg-gray-50`}>
            <DrawingMenu />
            <Dialog open={recordDialog.value} onOpenChange={recordDialog.set}>
                <DialogContent className='w-80 max-h-1/2 flex flex-col p-0'>
                    <DialogHeader className='p-6 pb-0'>
                        <DialogTitle>{record.value && 'error' in record.value ? 'Internal Server Error' : <>({click.value.x},{click.value.y}) Painting Record</>} </DialogTitle>
                        <DialogDescription>
                            {record.value && 'error' in record.value ? record.value.error : record.value?.length === 0 ? <>当前像素还没有被人晕染过哦ヾ(≧へ≦)〃</> : <>Modification record of P({click.value.x},{click.value.y})</>}
                        </DialogDescription>
                    </DialogHeader>
                    {record.value == null ?
                        <>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full" />
                                    <div className='flex h-4 items-center justify-between w-full'>
                                        <Skeleton className="h-full w-20" />
                                        <Skeleton className="h-full w-30" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full" />
                                    <div className='flex h-4 items-center justify-between w-full'>
                                        <Skeleton className="h-full w-20" />
                                        <Skeleton className="h-full w-30" />
                                    </div>
                                </div>
                            </div>
                        </> : !('error' in record.value) && record.value.length > 0 ? <>
                            <div className='overflow-y-auto h-auto flex-1 p-6 pt-3 flex flex-col gap-4 shadow-inner'>
                                {
                                    record.value.map((item, _) => {
                                        return <div className='w-full'>
                                            <div className="flex items-center space-x-4">
                                                <Avatar className="size-12">
                                                    <AvatarImage src={DefaultAvatar.src} alt="@avatar" />
                                                    <AvatarFallback>AT</AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-2 flex-1">
                                                    <div className='font-light'>
                                                        {item.creater}
                                                    </div>
                                                    <div className='flex h-4 items-center justify-between w-full'>
                                                        <div className='flex items-center gap-1 text-sm'>
                                                            {
                                                                item.color == 'clear' ?
                                                                    <>Clear Color</>
                                                                    :
                                                                    <>
                                                                        <span className='size-4 rounded-full' style={{
                                                                            backgroundColor: item.color
                                                                        }}></span>{item.color}</>
                                                            }
                                                        </div>
                                                        <div className='text-xs text-stone-400 font-thin'>{formatTimestamp(item.created)}</div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>;
                                    })
                                }
                            </div>

                        </> :
                            <div className='h-3'></div>
                    }
                </DialogContent>
            </Dialog>
            <DrawingContextMenu>
                <TransformContainer
                    lock={status.value != ToolStatus.MOVE} scaleState={[scale.value, scale.set]} offsetState={[position.value, position.set]}
                    friction={0.87} ref={container}
                >
                    <canvas
                        onMouseMove={(e) => {
                            const pos = getPosition(e)
                            move.set(pos)
                        }}
                        onClick={async (e) => {
                            const pos = getPosition(e)
                            click.set(pos)

                            switch (status.value) {
                                case ToolStatus.SELECT: {
                                    const hex = data.value?.pixels[`${pos.x},${pos.y}`];
                                    color.updateFromHEX(hex || "#FFFFFF");
                                    break;
                                }
                                case ToolStatus.SEARCH: {
                                    if (data.value) {
                                        try {
                                            const url = new URL('/api/gaban/record', window.location.origin);
                                            url.searchParams.append('gabanId', data.value._id.toString()); // Replace 'yourGabanIdValue' with the actual value
                                            url.searchParams.append('x', pos.x + ''); // Replace 'yourGabanIdValue' with the actual value
                                            url.searchParams.append('y', pos.y + ''); // Replace 'yourGabanIdValue' with the actual value
                                            const response = await fetch(url.toString())
                                            const d = (await response.json());
                                            record.set(d)
                                        } catch (error) {
                                            throw new Error("获取像素数据失败: " + error);
                                        }
                                    }
                                    recordDialog.set(true)
                                    break;
                                }
                                case ToolStatus.DRAW:
                                case ToolStatus.ERASER: {
                                    try {
                                        const c = status.value == ToolStatus.ERASER ? 'clear' : color.value.hex
                                        const response = await fetch(`/api/gaban/draw`, {
                                            method: 'POST',
                                            body: JSON.stringify({
                                                'gabanId': data.value?._id ?? '',
                                                'x': pos.x,
                                                'y': pos.y,
                                                'color': c
                                            }),
                                            headers: {
                                                'Content-Type': 'application/json'
                                            }
                                        });
                                        if (!response.ok) {
                                            throw new Error('网络响应不正常');
                                        }
                                    } catch (error) {
                                        console.error('绘画失败:', error);
                                    }
                                    break;
                                }



                            }
                        }}
                        width={size.value.x}
                        height={size.value.y}
                        style={{
                            backgroundColor: "#ffffff70",
                            backgroundImage: `
                          linear-gradient(45deg, #e0e0e070 25%, transparent 25%),
                          linear-gradient(-45deg, #e0e0e070 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #e0e0e070 75%),
                          linear-gradient(-45deg, transparent 75%, #e0e0e070 75%)
                        `,
                            backgroundSize: "2px 2px",
                            backgroundPosition: "0 0, 0 1px, 1px -1px, -1px 0px",
                            ...cursorStyle()
                        }}
                    ></canvas>
                </TransformContainer>
            </DrawingContextMenu>
        </div>
        <DrawingContent offset={[position.value, position.set]} scale={[scale.value, scale.set]} size={size.value} />

    </>);
};


const Drawing = () => {


    return (
        <DrawingProvider>
            <Main />
        </DrawingProvider>
    );
};


export default Drawing;
