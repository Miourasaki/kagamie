import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  ReactNode,
  useEffect,
  Dispatch,
  SetStateAction
} from 'react';
import DebugPanel from './DebugPanel';
import '@/assets/styles/canvas.css'
import { Vector2 } from '@/lib/type';
import { StateType } from '@/lib/state';

interface TransformContainerProps {
  children: ReactNode;
  lock?: boolean;
  friction?: number;
  offsetState?: StateType<Vector2>
  scaleState?: StateType<number>;
  defaultOffset?: Vector2; // 添加默认偏移属性
  defaultScale?: number;  // 添加默认缩放属性
  scaleRange?: [number, number]
  onPositionChange?: (pos: Vector2) => void;
  onScaleChange?: (scale: number) => void;
  onMouseMove?: (pos: Vector2, event: React.MouseEvent) => void;
}

export interface TransformContainerRef {
  getCenterPosition: () => Vector2;
  getChildSize: () => { width: number; height: number };
  startDragging: () => void;
  setOffset: (pos: Vector2) => void;
  setScale: (sca: number) => void;
  isDragging: () => boolean;
}

/**
 * 用于控制缩放，移动的React组件
 * 
 * @param {boolean} lock 用于设置是否锁定移动
 * @param {number} friction 用于设置速度衰减系数 取值范围[0,1)
 * 
 * @param opPositionChange 当位置发生移动时的回调
 * @param onMouseMove 当鼠标移动时回调, 其余同上
 * 
 */
const TransformContainer = forwardRef<TransformContainerRef, TransformContainerProps>(
  ({ children, lock = false, friction = 0.93, offsetState, scaleState,
    defaultScale = 1, defaultOffset = { x: 0, y: 0 }, scaleRange = [0.7, 30],
    onPositionChange, onScaleChange, onMouseMove }, ref) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = offsetState || useState(defaultOffset); // 偏移量, 用于偏移偏移控制器
    const [scale, setScale] = scaleState || useState(defaultScale); // 尺寸，用于控制尺寸控制器的缩放大小
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // 起始位置，开始拖拽时相对于控制元素的偏移量

    // 暴露ref方法
    useImperativeHandle(ref, () => ({
      getCenterPosition: () => {
        if (!contentRef.current) return { x: 0, y: 0 };
        const rect = contentRef.current.getBoundingClientRect();
        return {
          x: rect.width / 2,
          y: rect.height / 2
        };
      },
      getChildSize: () => {
        if (!contentRef.current) return { width: 0, height: 0 };
        const rect = contentRef.current.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      },
      startDragging: () => setIsDragging(true),
      setOffset: (pos: Vector2) => setOffset(pos),
      setScale: (sca: number) => setScale(sca),
      isDragging: () => isDragging
    }));

    // 惯性部分代码
    const nextPos = useRef<Vector2>({ x: 0, y: 0 }); // 后一个点位，用于拖动时通报
    const prevPos = useRef<Vector2>({ x: 0, y: 0 }); // 前一个点位用于计算速度
    const lastTime = useRef(0); // 鼠标最后相对于视口的落点与时间
    const velocity = useRef<Vector2>({ x: 0, y: 0 }); // 拖拽速度
    const animationFrameId = useRef<number>(undefined);
    useEffect(() => () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }, []);
    // 用于计算拖拽速度
    useEffect(() => {
      let ani: number

      const fun = (now: number) => {
        if (isDragging) {
          const deltaTime = now - lastTime.current;

          if (deltaTime > 0) {
            // 获取偏移量
            const deltaX = nextPos.current.x - prevPos.current.x;
            const deltaY = nextPos.current.y - prevPos.current.y;

            // 计算速度（像素/毫秒）
            velocity.current = {
              x: deltaX / deltaTime,
              y: deltaY / deltaTime
            };
          }

          prevPos.current = nextPos.current
          lastTime.current = now
          ani = requestAnimationFrame(fun)
        }
      }

      ani = requestAnimationFrame(fun)
      return () => {
        cancelAnimationFrame(ani)
      }
    })


    // 鼠标事件处理
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      // 清除惯性帧函数
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }

      // 设置移动的起始点位
      setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });

      // 初始化惯性计算器
      const EventClientPosition = { x: e.clientX, y: e.clientY }
      nextPos.current = EventClientPosition;
      prevPos.current = EventClientPosition;
      lastTime.current = Date.now()


      // 判断是否开始拖拽
      if (!lock) setIsDragging(true);
    }, [offset, lock]);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (isDragging) {
          // 向惯性计算器传递当前位置
          nextPos.current = {
            x: e.clientX, y: e.clientY
          };

          const newOffset = {
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
          };
          setOffset(newOffset);
          onPositionChange?.(newOffset);


        }

        onMouseMove?.(offset, e);
      },
      [isDragging, offset, startPos, onPositionChange, onMouseMove]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);

      const animate = (timestamp: number) => {
        let lastTimestamp = timestamp;
        const tick = (currentTime: number) => {
          const deltaTime = currentTime - lastTimestamp;
          lastTimestamp = currentTime;

          setOffset(prev => {
            const newOffset = {
              x: prev.x + velocity.current.x * deltaTime,
              y: prev.y + velocity.current.y * deltaTime
            };

            velocity.current.x = Math.max(-3, Math.min(velocity.current.x, 3))
            velocity.current.y = Math.max(-3, Math.min(velocity.current.y, 3))

            // 应用摩擦力
            velocity.current = {
              x: velocity.current.x * friction,
              y: velocity.current.y * friction
            };

            // 速度低于阈值时停止
            if (
              Math.abs(velocity.current.x) < 0.05 &&
              Math.abs(velocity.current.y) < 0.05
            ) {
              velocity.current = { x: 0, y: 0 };
              return newOffset;
            }

            onPositionChange?.(newOffset);
            animationFrameId.current = requestAnimationFrame(tick);
            return newOffset;
          });
        };

        animationFrameId.current = requestAnimationFrame(tick);
      };

      animationFrameId.current = requestAnimationFrame(animate);

    }, [onPositionChange]);


    const targetScale = useRef(scale); // 目标缩放值
    const currentScale = useRef(scale); // 当前动画缩放值
    const scaleAnimationId = useRef<number>(undefined); // 缩放动画的 requestAnimationFrame ID

    const animateScale = useCallback(() => {
      const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;
      const animationStep = () => {
        currentScale.current = lerp(currentScale.current, targetScale.current, 0.2); // 0.2 是插值速度

        setScale(currentScale.current);
        onScaleChange?.(currentScale.current);

        // 如果接近目标值，则停止动画
        if (Math.abs(currentScale.current - targetScale.current) > 0.001) {
          scaleAnimationId.current = requestAnimationFrame(animationStep);
        }
      };

      scaleAnimationId.current = requestAnimationFrame(animationStep);
    }, [onScaleChange]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
      const delta = e.deltaY > 0 ? 0.8 : 1.2;
      targetScale.current = Math.max(scaleRange[0], Math.min(scale * delta, scaleRange[1]))

      if (scaleAnimationId.current) cancelAnimationFrame(scaleAnimationId.current);
      animateScale();
    }, [scale, animateScale]);


    return (<>
      {/* <DebugPanel
        position="bottom-right"
        data={{
          '锁定状态': lock,
          '拖动状态': isDragging,
          '开始点': startPos,
          '偏移量': offset,
          '比例尺': scale,
          '最后落点': nextPos.current,
          '拖拽速度': velocity.current,
        }}
        title="Container Debug"
      /> */}
      <div id='transform-container'
        ref={containerRef}
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%', height: '100%',
          cursor: lock ? 'auto' : isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >

        <div className='transition-transform'></div>
        <div id='offset-container' ref={contentRef} style={{
          position: 'absolute',
          left: offset.x,
          top: offset.y
        }}>
          <div id='zoom-container' style={{
            transform: `scale(${scale})`,
          }}>
            {children}
          </div>
        </div>

        <div className='grid-bg dots' style={{
          backgroundSize: `${10 * scale}px ${10 * scale}px`,
          backgroundPosition: `${offset.x + 5}px ${offset.y + 5}px`,
        }} inert></div>
      </div>
    </>);
  }
);

export default TransformContainer;