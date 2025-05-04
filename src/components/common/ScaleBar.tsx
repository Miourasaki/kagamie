import React from 'react';

const ScaleBar = ({ scale = 1, unit = 'm', width = 200, color = '#333' }) => {
  // 计算实际距离
  const actualDistance = Math.round(width / scale);
  
  return (
    <div className="scale-bar-container" style={{ width: `110px` }}>
      <div className="scale-bar" style={{ 
        width: '100%',
        height: '1px',
        backgroundColor: color,
        position: 'relative'
      }}>
        <div className="scale-bar-start" style={{
          position: 'absolute',
          left: 0,
          top: '-6px',
          height: '14px',
          width: '2px',
          backgroundColor: color
        }}></div>
        <div className="scale-bar-end" style={{
          position: 'absolute',
          right: 0,
          top: '-6px',
          height: '14px',
          width: '2px',
          backgroundColor: color
        }}></div>
      </div>
      <div className="scale-label" style={{
        textAlign: 'center',
        marginTop: '5px',
        color: color,
        fontSize: '12px'
      }}>
        {actualDistance} {unit}
      </div>
    </div>
  );
};

export default ScaleBar;