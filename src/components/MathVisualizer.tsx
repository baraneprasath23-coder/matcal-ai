import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { X, Maximize2, Minimize2, Download, Share2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { FunctionPlotter } from './FunctionPlotter';

interface MathVisualizerProps {
  type: 'geometry' | 'argand' | 'function';
  data: any;
  onClose: () => void;
}

export const MathVisualizer: React.FC<MathVisualizerProps> = ({ type, data, onClose }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!svgRef.current || type === 'function') return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    if (type === 'geometry') {
      renderGeometry(svg, data, width, height);
    } else if (type === 'argand') {
      renderArgand(svg, data, width, height, margin);
    }
  }, [type, data]);

  const renderGeometry = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: any, width: number, height: number) => {
    const { shape, params } = data;
    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    if (shape === 'circle') {
      const radius = Math.min(width, height) / 4;
      g.append('circle')
        .attr('r', radius)
        .attr('fill', 'rgba(59, 130, 246, 0.2)')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2);
      
      // Radius line
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius)
        .attr('y2', 0)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4');
      
      g.append('text')
        .attr('x', radius / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ef4444')
        .attr('font-size', '12px')
        .text(`r = ${params.r || '?'}`);
    } else if (shape === 'triangle') {
      const size = 150;
      const points: [number, number][] = [
        [0, -size / 2],
        [-size / 2, size / 2],
        [size / 2, size / 2]
      ];
      
      g.append('polygon')
        .attr('points', points.map(p => p.join(',')).join(' '))
        .attr('fill', 'rgba(168, 85, 247, 0.2)')
        .attr('stroke', '#a855f7')
        .attr('stroke-width', 2);
      
      // Labels
      g.append('text').attr('x', 0).attr('y', -size / 2 - 10).attr('text-anchor', 'middle').attr('fill', 'white').text('A');
      g.append('text').attr('x', -size / 2 - 10).attr('y', size / 2 + 10).attr('text-anchor', 'middle').attr('fill', 'white').text('B');
      g.append('text').attr('x', size / 2 + 10).attr('y', size / 2 + 10).attr('text-anchor', 'middle').attr('fill', 'white').text('C');
    } else if (shape === 'rectangle') {
      const w = 200;
      const h = 120;
      g.append('rect')
        .attr('x', -w / 2)
        .attr('y', -h / 2)
        .attr('width', w)
        .attr('height', h)
        .attr('fill', 'rgba(249, 115, 22, 0.2)')
        .attr('stroke', '#f97316')
        .attr('stroke-width', 2);
      
      g.append('text').attr('x', 0).attr('y', -h / 2 - 10).attr('text-anchor', 'middle').attr('fill', 'white').text(`w = ${params.w || '?'}`);
      g.append('text').attr('x', w / 2 + 10).attr('y', 0).attr('text-anchor', 'start').attr('dominant-baseline', 'middle').attr('fill', 'white').text(`h = ${params.h || '?'}`);
    } else if (shape === 'ellipse') {
      const rx = params.rx || 120;
      const ry = params.ry || 80;
      g.append('ellipse')
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', 'rgba(236, 72, 153, 0.2)')
        .attr('stroke', '#ec4899')
        .attr('stroke-width', 2);
      
      g.append('text').attr('x', 0).attr('y', -ry - 10).attr('text-anchor', 'middle').attr('fill', 'white').text(`rx = ${rx}, ry = ${ry}`);
    } else if (shape === 'polygon') {
      const sides = params.sides || 5;
      const radius = params.radius || 100;
      const points: [number, number][] = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * 2 * Math.PI - Math.PI / 2;
        points.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
      }
      
      g.append('polygon')
        .attr('points', points.map(p => p.join(',')).join(' '))
        .attr('fill', 'rgba(34, 197, 94, 0.2)')
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 2);
      
      // Draw lines from center to vertices
      points.forEach(p => {
        g.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', p[0])
          .attr('y2', p[1])
          .attr('stroke', 'rgba(255,255,255,0.1)')
          .attr('stroke-width', 1);
      });

      g.append('text')
        .attr('x', 0)
        .attr('y', radius + 25)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(`${sides}-sided Regular Polygon`);
      
      g.append('text')
        .attr('x', 0)
        .attr('y', radius + 40)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,255,255,0.4)')
        .attr('font-size', '10px')
        .text(`Radius: ${radius}`);
    } else if (shape === 'line') {
      const length = params.length || 200;
      const angle = (params.angle || 0) * (Math.PI / 180);
      const x2 = length * Math.cos(angle);
      const y2 = length * Math.sin(angle);

      g.append('line')
        .attr('x1', -x2/2)
        .attr('y1', -y2/2)
        .attr('x2', x2/2)
        .attr('y2', y2/2)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#arrowhead)');

      svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', '9')
        .attr('refY', '5')
        .attr('markerWidth', '6')
        .attr('markerHeight', '6')
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', '#3b82f6');

      g.append('text')
        .attr('x', 0)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(`Length: ${length}, Angle: ${params.angle || 0}°`);
    }
  };

  const renderArgand = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: any, width: number, height: number, margin: any) => {
    const complexNumbers = Array.isArray(data) ? data : [data];
    
    const xScale = d3.scaleLinear()
      .domain([-10, 10])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([-10, 10])
      .range([height - margin.bottom, margin.top]);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0, ${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .attr('color', 'rgba(255,255,255,0.2)');
    
    svg.append('g')
      .attr('transform', `translate(${xScale(0)}, 0)`)
      .call(d3.axisLeft(yScale).ticks(10))
      .attr('color', 'rgba(255,255,255,0.2)');

    // Labels
    svg.append('text')
      .attr('x', width - 10)
      .attr('y', yScale(0) - 10)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(255,255,255,0.5)')
      .attr('font-size', '10px')
      .text('Real');

    svg.append('text')
      .attr('x', xScale(0) + 10)
      .attr('y', 20)
      .attr('text-anchor', 'start')
      .attr('fill', 'rgba(255,255,255,0.5)')
      .attr('font-size', '10px')
      .text('Imaginary');

    // Plot points
    complexNumbers.forEach((num, i) => {
      const { re, im, label } = num;
      const color = d3.schemeCategory10[i % 10];

      // Vector line from origin
      svg.append('line')
        .attr('x1', xScale(0))
        .attr('y1', yScale(0))
        .attr('x2', xScale(re))
        .attr('y2', yScale(im))
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '2');

      // Point
      svg.append('circle')
        .attr('cx', xScale(re))
        .attr('cy', yScale(im))
        .attr('r', 5)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

      // Label
      svg.append('text')
        .attr('x', xScale(re) + 8)
        .attr('y', yScale(im) - 8)
        .attr('fill', color)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(label || `${re} + ${im}i`);
    });
  };

  return (
    <div className={cn(
      "bg-[#151619] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col transition-all duration-300",
      isFullscreen ? "fixed inset-4 z-[100]" : "w-full"
    )}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Maximize2 size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">
              {type === 'geometry' ? 'Geometric Diagram' : type === 'argand' ? 'Argand Plane' : 'Mathematical Visualization'}
            </h3>
            <p className="text-[10px] text-white/40">Visual aid for conceptual understanding</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center bg-black/40 relative overflow-hidden">
        {type === 'function' ? (
          <div className="w-full h-full min-h-[300px]">
            <FunctionPlotter expression={data.expression} />
          </div>
        ) : (
          <svg 
            ref={svgRef} 
            viewBox="0 0 600 400" 
            className="w-full h-full max-h-[500px]"
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
      </div>

      <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
            <Info size={12} />
            Interactive Diagram
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all">
            <Download size={16} />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all">
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
