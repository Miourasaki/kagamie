import style from '@/assets/styles/colorpicker.module.css'

import React, { useState, useCallback, useContext } from 'react';
import { DrawingContext } from './DrawingContext';
export function invertHex(hex: string) {
    // 移除 # 并确保是6位Hex
    const num = parseInt(hex.replace(/^#/, ''), 16);
    // XOR 运算并格式化为6位Hex
    return '#' + (0xFFFFFF ^ num).toString(16).padStart(6, '0').toUpperCase();
}

const ColorPicker: React.FC = () => {
    const drawing = useContext(DrawingContext)
    const color = drawing.color.value

    // Handle RGB changes
    const handleRgbChange = (type: 'r' | 'g' | 'b', value: number) => {
        const newColor = { ...color, [type]: value };
        drawing.color.updateFromRGB(newColor.r, newColor.g, newColor.b)
    };

    // Handle HSV changes
    const handleHsvChange = (type: 'h' | 's' | 'v', value: number) => {
        const newColor = { ...color, [type]: value };
        drawing.color.updateFromHSV(newColor.h, newColor.s, newColor.v)
    };

    // Handle color wheel click
    const handleColorWheelClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate angle (hue)
        const dx = x - centerX;
        const dy = y - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        // Calculate distance from center (saturation)
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), centerX);
        const saturation = Math.round((distance / centerX) * 100);

        handleHsvChange('h', Math.round(angle));
        handleHsvChange('s', saturation);
    };


    return (
        <div className="w-full">
            {/* Preview */}
            <div className="mb-6 flex items-center">
                <div
                    className="size-14 rounded-full mr-4 border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1 text-xs text-gray-600 flex flex-col justify-between h-14">
                    <div className="font-medium text-sm text-gray-700">HEX: {color.hex}</div>
                    <div>
                        <div className="">RGB: {color.r}, {color.g}, {color.b}</div>
                        <div className="">HSV: {color.h}°, {color.s}%, {color.v}%</div>
                    </div>
                </div>
            </div>

            {/* RGB Controls */}
            <div className="mb-4 select-none">
                <h3 className="text-xs uppercase font-light mb-1 text-stone-400">RGB Controls</h3>
                <StripControl
                    label="Red"
                    value={color.r}
                    max={255}
                    color={`linear-gradient(to right, rgb(0 ${color.g} ${color.b}), rgb(255 ${color.g} ${color.b}))`}
                    onChange={(v) => handleRgbChange('r', v)}
                />
                <StripControl
                    label="Green"
                    value={color.g}
                    max={255}
                    color={`linear-gradient(to right, rgb(${color.r} 0 ${color.b}), rgb(${color.r} 255 ${color.b}))`}
                    onChange={(v) => handleRgbChange('g', v)}
                />
                <StripControl
                    label="Blue"
                    value={color.b}
                    max={255}
                    color={`linear-gradient(to right, rgb(${color.r} ${color.g} 0), rgb(${color.r} ${color.g} 255))`}
                    onChange={(v) => handleRgbChange('b', v)}
                />
            </div>

            {/* HSV Controls */}
            <div className=" select-none">
                <h3 className="text-xs uppercase font-light mb-1 text-stone-400">HSV Controls</h3>
                <StripControl
                    label="Hue"
                    value={color.h}
                    max={360}
                    color={`hsl(${color.h}, 100%, 50%)`}
                    onChange={(v) => handleHsvChange('h', v)}
                />
                <StripControl
                    label="Saturation"
                    value={color.s}
                    max={100}
                    color={`hsl(${color.h}, ${color.s}%, 50%)`}
                    onChange={(v) => handleHsvChange('s', v)}
                />
                <StripControl
                    label="Value"
                    value={color.v}
                    max={100}
                    color={`hsl(${color.h}, 100%, ${color.v}%)`}
                    onChange={(v) => handleHsvChange('v', v)}
                />
            </div>

            {/* Color Wheel */}
            {/* <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Color Wheel</h3>
        <ColorWheel 
          hue={color.h} 
          saturation={color.s} 
          onClick={handleColorWheelClick} 
        />
      </div> */}
        </div>
    );
};

// RGB Control Component
interface StripControlProps {
    label: string;
    value: number;
    max: number;
    color: string;
    onChange: (value: number) => void;
}

const StripControl: React.FC<StripControlProps> = ({ label, value, max, color, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const input = e.target as HTMLInputElement;
        const previousValue = input.getAttribute('data-prev-value') || '';
        const newValue = input.value;

        // 检查是否为数字且在0-255范围内
        if (/^\d+$/.test(newValue)) {
            const num = parseInt(newValue, 10);
            if (num >= 0 && num <= 255) {
                // 有效输入，保存当前值作为下次的previousValue
                input.setAttribute('data-prev-value', newValue);
                onChange(parseInt(e.target.value));
                return;
            }
        }

        // 无效输入，恢复为之前的值或设为0
        e.preventDefault();
        onChange(parseInt(previousValue !== '' ? previousValue : value.toString()));
        input.setAttribute('data-prev-value', input.value);

    };

    return (
        <div className="mb-2">
            <div className="flex justify-between items-center text-xs mb-1 mt-2">
                <label className="font-medium text-gray-700">{label}</label>
                <span className="font-light text-gray-600">
                    <input
                        type="text"
                        value={value}
                        onChange={handleChange}
                        className="w-6 text-end focus-visible:outline-0"
                    />{label === 'Hue' ? '°' : (label == "Saturation" || label == "Value") && '%'}
                </span>
            </div>
            <div className="flex items-center pr-3">
                <input
                    type="range"
                    min="0"
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className={`flex-1 h-1 my-0.5 rounded-lg appearance-none cursor-pointer range-slider ${style['range-slider']}`}
                    style={{
                        background: label === 'Hue'
                            ? 'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))'
                            : label === 'Saturation'
                                ? `linear-gradient(to right, hsl(${color.split(',')[0].split('(')[1]},0%,50%), ${color})`
                                : label === 'Value' ? `linear-gradient(to right, hsl(${color.split(',')[0].split('(')[1]},100%,0%), ${color})` :
                                    color
                    }}
                />

            </div>
        </div>
    );
};

// Color Wheel Component
interface ColorWheelProps {
    hue: number;
    saturation: number;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ColorWheel: React.FC<ColorWheelProps> = ({ hue, saturation, onClick }) => {
    const radius = 120;
    const center = radius;

    // Create color wheel segments
    const renderColorWheel = () => {
        const segments = [];
        const segmentCount = 36;
        const segmentAngle = 360 / segmentCount;

        for (let i = 0; i < segmentCount; i++) {
            const angle = i * segmentAngle;
            const nextAngle = (i + 1) * segmentAngle;

            segments.push(
                <div
                    key={i}
                    className="absolute w-full h-full"
                    style={{
                        clipPath: `path('M ${center} ${center} L ${center + radius * Math.cos(angle * Math.PI / 180)} ${center + radius * Math.sin(angle * Math.PI / 180)} L ${center + radius * Math.cos(nextAngle * Math.PI / 180)} ${center + radius * Math.sin(nextAngle * Math.PI / 180)} Z')`,
                        backgroundColor: `hsl(${angle}, 100%, 50%)`
                    }}
                />
            );
        }

        return segments;
    };

    // Calculate marker position
    const markerX = center + (saturation / 100) * radius * Math.cos(hue * Math.PI / 180);
    const markerY = center + (saturation / 100) * radius * Math.sin(hue * Math.PI / 180);

    return (
        <div className="relative mx-auto" style={{ width: radius * 2, height: radius * 2 }}>
            <div
                className="relative w-full h-full rounded-full overflow-hidden cursor-pointer"
                onClick={onClick}
            >
                {renderColorWheel()}
                <div
                    className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                        left: markerX,
                        top: markerY,
                        backgroundColor: `hsl(${hue}, ${saturation}%, 50%)`
                    }}
                />
            </div>
        </div>
    );
};


export default ColorPicker;