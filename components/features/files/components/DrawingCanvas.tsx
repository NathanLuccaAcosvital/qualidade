
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AnnotationItem, NormalizedPoint, AnnotationType } from '../../../../types/metallurgy.ts';

export type DrawingTool = AnnotationType | 'hand';

interface DrawingCanvasProps {
  tool: DrawingTool;
  color: string;
  width: number;
  height: number;
  lineWidth: number;
  stampText?: 'APROVADO' | 'REJEITADO';
  pageAnnotations: AnnotationItem[];
  onAnnotationsChange: (annotations: AnnotationItem[]) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  tool, color, width, height, lineWidth, stampText, pageAnnotations, onAnnotationsChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<NormalizedPoint[]>([]);
  const [startPoint, setStartPoint] = useState<NormalizedPoint | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    pageAnnotations.forEach(ann => {
      ctx.beginPath();
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = ann.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = ann.type === 'marker' ? 0.4 : 1.0;
      ctx.globalCompositeOperation = ann.type === 'eraser' ? 'destination-out' : 'source-over';

      if (ann.type === 'pencil' || ann.type === 'marker' || ann.type === 'eraser') {
        if (ann.points && ann.points.length > 0) {
          ctx.moveTo(ann.points[0].x * width, ann.points[0].y * height);
          ann.points.forEach(p => ctx.lineTo(p.x * width, p.y * height));
          ctx.stroke();
        }
      } else if (ann.type === 'rect' && ann.startPoint && ann.endPoint) {
        ctx.strokeRect(
          ann.startPoint.x * width, 
          ann.startPoint.y * height, 
          (ann.endPoint.x - ann.startPoint.x) * width, 
          (ann.endPoint.y - ann.startPoint.y) * height
        );
      } else if (ann.type === 'circle' && ann.startPoint && ann.endPoint) {
        const x1 = ann.startPoint.x * width;
        const y1 = ann.startPoint.y * height;
        const x2 = ann.endPoint.x * width;
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow((ann.endPoint.y * height) - y1, 2));
        ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (ann.type === 'stamp' && ann.startPoint) {
        // RENDER DE TARJA (CARIMBO)
        const x = ann.startPoint.x * width;
        const y = ann.startPoint.y * height;
        const sText = ann.stampText || 'APROVADO';
        const isApproved = sText === 'APROVADO';
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.1); // Leve inclinação de carimbo
        
        ctx.fillStyle = isApproved ? '#10b981' : '#ef4444';
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 4;
        
        const textWidth = ctx.measureText(sText).width + 40;
        ctx.strokeRect(-textWidth/2, -25, textWidth, 50);
        
        ctx.font = 'black 24px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sText, 0, 0);
        
        ctx.restore();
      }
    });

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  }, [pageAnnotations, width, height]);

  useEffect(() => { redraw(); }, [redraw]);

  const getNormalizedPos = (e: React.MouseEvent | React.TouchEvent): NormalizedPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = ('touches' in e) ? e.touches[0].clientX : e.clientX;
    const clientY = ('touches' in e) ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) / width, y: (clientY - rect.top) / height };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'hand' || !canvasRef.current) return;
    const pos = getNormalizedPos(e);
    
    if (tool === 'stamp') {
      const newAnn: AnnotationItem = {
        id: crypto.randomUUID(),
        type: 'stamp',
        color: stampText === 'APROVADO' ? '#10b981' : '#ef4444',
        lineWidth: 4,
        startPoint: pos,
        stampText: stampText
      };
      onAnnotationsChange([...pageAnnotations, newAnn]);
      return;
    }

    setIsDrawing(true);
    if (tool === 'rect' || tool === 'circle') setStartPoint(pos);
    else setCurrentPoints([pos]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === 'hand' || !canvasRef.current) return;
    const pos = getNormalizedPos(e);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (tool === 'pencil' || tool === 'marker' || tool === 'eraser') {
      ctx.beginPath();
      ctx.strokeStyle = tool === 'marker' ? `${color}66` : color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      const lastPoint = currentPoints[currentPoints.length - 1];
      if (lastPoint) {
        ctx.moveTo(lastPoint.x * width, lastPoint.y * height);
        ctx.lineTo(pos.x * width, pos.y * height);
        ctx.stroke();
      }
      setCurrentPoints(prev => [...prev, pos]);
    }
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getNormalizedPos(e);
    const newAnn: AnnotationItem = {
      id: crypto.randomUUID(),
      type: tool as AnnotationType,
      color: color,
      lineWidth: lineWidth,
    };
    if (tool === 'pencil' || tool === 'marker' || tool === 'eraser') newAnn.points = [...currentPoints, pos];
    else if (tool === 'rect' || tool === 'circle') { newAnn.startPoint = startPoint!; newAnn.endPoint = pos; }
    onAnnotationsChange([...pageAnnotations, newAnn]);
    setIsDrawing(false);
    setCurrentPoints([]);
    setStartPoint(null);
    redraw();
  };

  return (
    <canvas
      ref={canvasRef} width={width} height={height}
      className={`absolute inset-0 z-20 ${tool === 'hand' ? 'pointer-events-none' : 'cursor-crosshair'}`}
      onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
      onMouseLeave={() => setIsDrawing(false)}
      onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
    />
  );
};
