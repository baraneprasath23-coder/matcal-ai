import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator as CalcIcon, History as HistoryIcon, Sparkles, X, Trash2, ChevronRight, Loader2, Copy, Check, Mic, MicOff, Brain, Settings2, Globe, Camera, PenTool, Image as ImageIcon, RotateCcw, BookOpen, LineChart as ChartIcon, Binary, Ruler, Atom, Hash, QrCode, DollarSign, Box, ArrowUp, Delete, Maximize2 } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { cn } from '../lib/utils';
import { Calculation, AIResponse } from '../types';
import { solveMathProblem } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import * as math from 'mathjs';
import { FunctionPlotter } from './FunctionPlotter';
import { MathVisualizer } from './MathVisualizer';
import { MATH_FORMULAS } from '../constants/formulas';
import { PHYSICAL_CONSTANTS, UNIT_CATEGORIES } from '../constants/calculator';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<Calculation[]>([]);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [calcMode, setCalcMode] = useState<'basic' | 'scientific' | 'programmer' | 'financial'>('basic');
  const [isAiMode, setIsAiMode] = useState(false);
  const [isHyp, setIsHyp] = useState(false);
  const [baseMode, setBaseMode] = useState<'DEC' | 'HEX' | 'BIN' | 'OCT'>('DEC');
  const [showConstants, setShowConstants] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [selectedUnitCategory, setSelectedUnitCategory] = useState<string>(UNIT_CATEGORIES[0].name);
  const [unitFrom, setUnitFrom] = useState<string>(UNIT_CATEGORIES[0].units[0]);
  const [unitTo, setUnitTo] = useState<string>(UNIT_CATEGORIES[0].units[1]);
  const [unitInputValue, setUnitInputValue] = useState<string>('1');
  const [unitOutputValue, setUnitOutputValue] = useState<string>('');
  const [showEqSolver, setShowEqSolver] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showMatrixSolver, setShowMatrixSolver] = useState(false);
  const [showVectorCalc, setShowVectorCalc] = useState(false);
  const [showStatsCalc, setShowStatsCalc] = useState(false);
  const [showBaseConverter, setShowBaseConverter] = useState(false);
  const [showFinanceCalc, setShowFinanceCalc] = useState(false);
  const [showGeometryCalc, setShowGeometryCalc] = useState(false);
  const [isDegree, setIsDegree] = useState(true);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [matrixADims, setMatrixADims] = useState({ rows: 3, cols: 3 });
  const [matrixBDims, setMatrixBDims] = useState({ rows: 3, cols: 3 });
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<{ query: string, result: string, visualization?: Calculation['visualization'] } | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [visualization, setVisualization] = useState<Calculation['visualization'] | null>(null);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'listening' | 'stopped' | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  // Multimodal states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasActive, setIsCanvasActive] = useState(false);
  const [showPlot, setShowPlot] = useState(false);
  const [plotExpression, setPlotExpression] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            setHistory(data);
          }
        }
        setServerStatus('online');
      } catch (error) {
        console.error('Failed to fetch history from server:', error);
        setServerStatus('offline');
        // Fallback to localStorage
        const saved = localStorage.getItem('calc_history');
        if (saved) setHistory(JSON.parse(saved));
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
    
    // Sync with server
    const syncHistory = async () => {
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(history)
        });
        setServerStatus('online');
      } catch (error) {
        setServerStatus('offline');
      }
    };
    if (history.length > 0) syncHistory();
  }, [history]);

  useEffect(() => {
    const checkApiKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setAiQuery(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
        setVoiceStatus('stopped');
        setTimeout(() => setVoiceStatus(null), 2000);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (voiceStatus !== 'stopped') {
          setVoiceStatus('stopped');
          setTimeout(() => setVoiceStatus(null), 2000);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceStatus(null);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Canvas Drawing Logic
  useEffect(() => {
    if (isCanvasActive && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
    }
  }, [isCanvasActive]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setSelectedImage(dataUrl);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setSelectedImage(null);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
      setVoiceStatus('listening');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic calculator logic
  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setDisplay(prev => prev + ' ' + op + ' ');
  };

  const handleFunction = (fn: string) => {
    const constants = ['pi', 'e'];
    const noParen = ['Ran#', 'RanInt', 'ENG', 'HEX', 'DEC', 'BIN', 'OCT'];
    const logicGates = ['AND', 'OR', 'XOR', 'NOT', 'LSH', 'RSH', 'MOD'];
    
    if (fn === 'Ran#') {
      setDisplay(prev => (prev === '0' ? Math.random().toFixed(3) : prev + Math.random().toFixed(3)));
      return;
    }
    if (fn === 'RanInt') {
      const rand = Math.floor(Math.random() * 100).toString();
      setDisplay(prev => (prev === '0' ? rand : prev + rand));
      return;
    }
    if (fn === 'hyp') {
      setIsHyp(!isHyp);
      return;
    }
    if (fn === 'ENG') {
      try {
        const val = parseFloat(display);
        if (!isNaN(val)) {
          setDisplay(val.toExponential().replace(/e\+?(-?\d+)/, (_, p1) => {
            const exp = parseInt(p1);
            const shift = exp % 3;
            const newExp = exp - shift;
            const newVal = val / Math.pow(10, newExp);
            return ` × 10^${newExp}`;
          }));
        }
      } catch (e) {}
      return;
    }

    if (logicGates.includes(fn)) {
      setDisplay(prev => prev + ' ' + fn + ' ');
      return;
    }

    let finalFn = fn;
    if (isHyp) {
      if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(fn)) {
        finalFn = fn + 'h';
      }
      setIsHyp(false);
    }

    setDisplay(prev => {
      const value = (constants.includes(finalFn) || noParen.includes(finalFn)) ? finalFn : finalFn + '(';
      return prev === '0' ? value : prev + value;
    });
  };

  const clear = () => {
    setDisplay('0');
    setExplanation(null);
  };

  const calculateBasic = () => {
    try {
      let expression = display.replace(/×/g, '*').replace(/÷/g, '/');
      
      // Handle degrees for trig functions
      if (isDegree) {
        expression = expression.replace(/(sin|cos|tan|asin|acos|atan)\(([^)]+)\)/g, (match, fn, val) => {
          if (fn.startsWith('a')) {
            // Inverse trig: result is in radians, convert to degrees
            return `(180 / pi * ${fn}(${val}))`;
          }
          // Normal trig: input is in degrees, convert to radians
          return `${fn}(${val} * pi / 180)`;
        });
      }
      
      // Handle Programmer mode logic gates
      if (calcMode === 'programmer') {
        expression = expression
          .replace(/AND/g, '&')
          .replace(/OR/g, '|')
          .replace(/XOR/g, '^')
          .replace(/NOT/g, '~')
          .replace(/LSH/g, '<<')
          .replace(/RSH/g, '>>')
          .replace(/MOD/g, '%');
      }

      // Handle Base-N prefixes for evaluation
      if (calcMode === 'programmer' && baseMode !== 'DEC') {
        const prefix = baseMode === 'HEX' ? '0x' : baseMode === 'BIN' ? '0b' : '0o';
        const numRegex = baseMode === 'HEX' ? /[0-9A-F]+/g : baseMode === 'BIN' ? /[01]+/g : /[0-7]+/g;
        expression = expression.replace(numRegex, (match) => {
          if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pi'].some(fn => match.toLowerCase().includes(fn))) return match;
          // Don't prefix if it's already a hex/bin/oct prefix or part of a function name
          if (match.startsWith('0x') || match.startsWith('0b') || match.startsWith('0o')) return match;
          return prefix + match;
        });
      }

      const evalResult = math.evaluate(expression);
      let result = evalResult.toString();

      // Format result back to base if in Programmer mode
      if (calcMode === 'programmer' && baseMode !== 'DEC' && typeof evalResult === 'number') {
        if (baseMode === 'HEX') result = evalResult.toString(16).toUpperCase();
        else if (baseMode === 'BIN') result = evalResult.toString(2);
        else if (baseMode === 'OCT') result = evalResult.toString(8);
      }

      const newCalc: Calculation = {
        id: Date.now().toString(),
        query: display,
        result,
        timestamp: Date.now(),
        type: 'basic'
      };
      setHistory(prev => [newCalc, ...prev]);
      setLastCalculation({ query: display, result });
      setDisplay(result);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleAiSolve = async () => {
    if (!aiQuery.trim() && !selectedImage) return;
    setIsSolving(true);
    setExplanation(null);
    
    try {
      let imageData = null;
      if (selectedImage) {
        imageData = {
          data: selectedImage.split(',')[1],
          mimeType: selectedImage.split(',')[0].split(':')[1].split(';')[0]
        };
      }

      const response = await solveMathProblem(aiQuery, isThinkingMode, isSearchEnabled, imageData);
      const newCalc: Calculation = {
        id: Date.now().toString(),
        query: aiQuery || "Image Problem",
        result: response.answer,
        explanation: response.explanation,
        visualization: response.visualization,
        timestamp: Date.now(),
        type: 'ai'
      };
      setHistory(prev => [newCalc, ...prev]);
      setLastCalculation({ query: aiQuery || "Image Problem", result: response.answer, visualization: response.visualization });
      setDisplay(response.answer);
      setExplanation(response.explanation);
      setVisualization(response.visualization || null);
      setAiQuery('');
      setSelectedImage(null);
      setIsCanvasActive(false);
      setIsAiMode(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSolving(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Unit Conversion Logic
  useEffect(() => {
    if (showConverter) {
      try {
        const val = parseFloat(unitInputValue);
        if (isNaN(val)) {
          setUnitOutputValue('Invalid Input');
          return;
        }

        // Handle temperature differently if needed, but mathjs handles it
        // Note: mathjs uses 'degC', 'degF', 'K'
        const from = unitFrom.replace('°', 'deg');
        const to = unitTo.replace('°', 'deg');
        
        const result = math.evaluate(`${val} ${from} to ${to}`);
        // mathjs result is a Unit object, we want the numeric value
        const numericValue = typeof result === 'number' ? result : result.toNumber(to);
        
        setUnitOutputValue(numericValue.toLocaleString(undefined, { maximumFractionDigits: 6 }));
      } catch (e) {
        setUnitOutputValue('Error');
      }
    }
  }, [unitInputValue, unitFrom, unitTo, showConverter]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const basicKeys = ['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.', '(', ')'];
  const scientificKeys = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', '^', 'sqrt', 'pi', 'e', 'Plot', 'hyp', 'ENG', 'Pol', 'Rec', 'Ran#', 'RanInt'];
  const programmerKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'AND', 'OR', 'XOR', 'NOT', 'LSH', 'RSH', 'MOD', 'DEC', 'HEX', 'BIN', 'OCT'];
  const financialKeys = ['TVM', 'ROI', 'Margin', 'Loan', 'Tax+', 'Tax-', 'Interest', 'CashFlow', 'Amort'];
  const proKeys = ['d/dx', '∫', 'lim', 'Σ', 'matrix', 'det', 'inv', 'transpose', 'solve'];

  const baseKeys = {
    DEC: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    HEX: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    BIN: ['0', '1'],
    OCT: ['0', '1', '2', '3', '4', '5', '6', '7']
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar: Topics & Modes */}
        <div className="lg:col-span-3 flex flex-col gap-4 sticky top-8 h-[calc(100vh-4rem)]">
          <div className="bg-[#151619] rounded-3xl border border-white/10 p-4 flex flex-col gap-2 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <CalcIcon size={14} className="text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">MATCAL AI Menu</span>
            </div>
            
            {/* Modes Section */}
            <div className="mb-4">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-4 mb-2">Calculator Modes</p>
              <div className="space-y-1">
                {[
                  { id: 'basic', label: 'Basic Mode', icon: <CalcIcon size={14} />, color: 'blue' },
                  { id: 'scientific', label: 'Scientific', icon: <Atom size={14} />, color: 'purple' },
                  { id: 'programmer', label: 'Programmer', icon: <Binary size={14} />, color: 'rose' },
                  { id: 'financial', label: 'Financial', icon: <DollarSign size={14} />, color: 'emerald' },
                ].map((mode) => (
                  <button 
                    key={mode.id}
                    onClick={() => {
                      setCalcMode(mode.id as any);
                      setIsAiMode(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-3",
                      calcMode === mode.id && !isAiMode ? `bg-${mode.color}-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]` : "text-white/60 hover:bg-white/5"
                    )}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                ))}
                <button 
                  onClick={() => setIsAiMode(!isAiMode)}
                  className={cn(
                    "w-full px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-3",
                    isAiMode ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-white/60 hover:bg-white/5"
                  )}
                >
                  <Sparkles size={14} />
                  AI Mode
                </button>
                <button 
                  onClick={() => setIsDegree(!isDegree)}
                  className={cn(
                    "w-full px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between",
                    "text-white/60 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw size={14} />
                    {isDegree ? 'Degrees' : 'Radians'}
                  </div>
                  <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded uppercase">{isDegree ? 'Deg' : 'Rad'}</span>
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-4">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-4 mb-2">Features & Tools</p>
              <div className="space-y-1">
                <button 
                  onClick={() => setVisualization({ type: 'geometry', data: { shape: 'circle', params: { r: 5 } } })}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <Maximize2 size={14} />
                  Visualizer
                </button>
                <button 
                  onClick={() => setShowTopics(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <BookOpen size={14} />
                  Syllabus
                </button>
                <button 
                  onClick={() => setShowFormulas(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <Settings2 size={14} />
                  Formulas
                </button>
                <button 
                  onClick={() => setShowMatrixSolver(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <Box size={14} />
                  Matrix
                </button>
                <button 
                  onClick={() => setShowVectorCalc(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <ChevronRight size={14} />
                  Vector
                </button>
                <button 
                  onClick={() => setShowStatsCalc(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <Hash size={14} />
                  Stats
                </button>
                <button 
                  onClick={() => setShowBaseConverter(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <Binary size={14} />
                  Base
                </button>
                <button 
                  onClick={() => setShowFinanceCalc(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <DollarSign size={14} />
                  Finance
                </button>
                <button 
                  onClick={() => setShowGeometryCalc(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <Ruler size={14} />
                  Geometry
                </button>
                <button 
                  onClick={() => setShowConverter(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <Globe size={14} />
                  Converter
                </button>
                <button 
                  onClick={() => setShowQr(true)}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <QrCode size={14} />
                  QR Share
                </button>
                <button 
                  onClick={() => {
                    setPlotExpression(display);
                    setShowPlot(true);
                  }}
                  className="w-full px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 transition-all flex items-center gap-3"
                >
                  <ChartIcon size={14} />
                  Plot
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Calculator Section */}
        <div className="lg:col-span-6 bg-[#151619] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-bottom border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <CalcIcon size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">MATCAL AI</h1>
            </div>
          </div>

          {/* Display Area */}
          <div className="flex-1 p-8 flex flex-col justify-end items-end min-h-[250px] bg-black/20 relative">
            <AnimatePresence mode="wait">
              {!isAiMode ? (
                <motion.div 
                  key="basic-display"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full text-right relative group"
                >
                  <button 
                    onClick={copyToClipboard}
                    className="absolute -top-12 right-0 p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Copy result"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                  <div className="text-white/40 text-sm font-mono mb-2 overflow-x-auto no-scrollbar whitespace-nowrap">
                    {display === '0' ? '' : display}
                  </div>
                  <div className="text-6xl font-light tracking-tighter overflow-x-auto no-scrollbar whitespace-nowrap">
                    {display}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="ai-input"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setIsThinkingMode(!isThinkingMode)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                        isThinkingMode ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-white/40 border border-transparent"
                      )}
                    >
                      <Brain size={12} />
                      Thinking {isThinkingMode ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                        isSearchEnabled ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-white/40 border border-transparent"
                      )}
                    >
                      <Globe size={12} />
                      Search {isSearchEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {isCanvasActive ? (
                    <div className="relative bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-4">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-40 cursor-crosshair"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button onClick={clearCanvas} className="p-2 bg-black/40 rounded-lg hover:bg-black/60 text-white/60">
                          <RotateCcw size={14} />
                        </button>
                        <button onClick={() => setIsCanvasActive(false)} className="p-2 bg-black/40 rounded-lg hover:bg-black/60 text-white/60">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : selectedImage ? (
                    <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden border border-blue-500/30">
                      <img src={selectedImage} alt="Problem" className="w-full h-full object-contain bg-black/40" />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <textarea
                      autoFocus
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask anything... or use the tools below to draw or upload a photo."
                      className="w-full bg-transparent text-2xl font-light tracking-tight outline-none resize-none placeholder:text-white/20 h-32"
                    />
                  )}

                  <div className="flex justify-between mt-4 items-center">
                    <div className="flex gap-2">
                      <label className="p-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 cursor-pointer transition-all" title="Upload Photo">
                        <ImageIcon size={18} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <button 
                        onClick={() => setIsCanvasActive(true)}
                        className={cn(
                          "p-2 rounded-xl transition-all flex items-center justify-center",
                          isCanvasActive ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                        title="Draw Problem"
                      >
                        <PenTool size={18} />
                      </button>
                    </div>

                    <div className="flex gap-2 items-center">
                      <AnimatePresence mode="wait">
                        {voiceStatus && (
                          <motion.div
                            key={voiceStatus}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mr-2",
                              voiceStatus === 'listening' ? "text-red-400" : "text-green-400"
                            )}
                          >
                            {voiceStatus === 'listening' ? (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                Listening...
                              </>
                            ) : (
                              <>
                                <Check size={12} />
                                Stopped
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={toggleVoiceInput}
                        className={cn(
                          "p-2 rounded-xl transition-all flex items-center justify-center relative",
                          isListening ? "bg-red-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                        title={isListening ? "Stop listening" : "Voice input"}
                      >
                        {isListening && (
                          <motion.div
                            layoutId="pulse"
                            className="absolute inset-0 rounded-xl bg-red-500/40"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        )}
                        {isListening ? <MicOff size={18} className="relative z-10" /> : <Mic size={18} className="relative z-10" />}
                      </button>
                      <button
                        onClick={handleAiSolve}
                        disabled={isSolving || (!aiQuery.trim() && !selectedImage)}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all"
                      >
                        {isSolving ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        Solve
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad */}
          {!isAiMode && (
            <div className="p-6 flex flex-col gap-3 bg-black/10">
              {/* Mode Specific Keys */}
              {calcMode === 'scientific' && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {scientificKeys.map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key === 'Plot') {
                          setPlotExpression(display);
                          setShowPlot(true);
                        } else {
                          handleFunction(key);
                        }
                      }}
                      className={cn(
                        "h-10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95",
                        key === 'Plot' ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              )}

              {calcMode === 'programmer' && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {programmerKeys.map((key) => {
                    const isHexKey = ['A', 'B', 'C', 'D', 'E', 'F'].includes(key);
                    const isDisabled = isHexKey && baseMode !== 'HEX';
                    
                    return (
                      <button
                        key={key}
                        disabled={isDisabled}
                        onClick={() => {
                          if (['DEC', 'HEX', 'BIN', 'OCT'].includes(key)) {
                            setBaseMode(key as any);
                          } else {
                            handleFunction(key);
                          }
                        }}
                        className={cn(
                          "h-10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95",
                          baseMode === key ? "bg-rose-500 text-white" : 
                          isDisabled ? "opacity-20 cursor-not-allowed bg-white/5" :
                          "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        )}
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              )}

              {calcMode === 'financial' && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {financialKeys.map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (['TVM', 'Loan', 'Interest', 'CashFlow', 'Amort'].includes(key)) {
                          setShowFinanceCalc(true);
                        } else {
                          handleFunction(key);
                        }
                      }}
                      className="h-10 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all active:scale-95"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              )}

              {/* Standard Keys Grid */}
              <div className="grid grid-cols-4 gap-3">
                {basicKeys.map((key) => {
                  const isNumber = !isNaN(Number(key)) || key === '.';
                  const isOperator = ['÷', '×', '-', '+', '=', '(', ')'].includes(key);
                  const isSpecial = ['C', '⌫'].includes(key);
                  
                  // Disable non-base keys in programmer mode
                  const isDisabled = calcMode === 'programmer' && isNumber && !baseKeys[baseMode].includes(key);

                  return (
                    <button
                      key={key}
                      disabled={isDisabled}
                      onClick={() => {
                        if (key === 'C') clear();
                        else if (key === '⌫') setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                        else if (key === '=') calculateBasic();
                        else if (isOperator) handleOperator(key);
                        else handleNumber(key);
                      }}
                      className={cn(
                        "h-14 rounded-2xl text-lg font-medium transition-all active:scale-95 flex items-center justify-center",
                        key === '=' ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20" :
                        isOperator ? "bg-white/5 hover:bg-white/10 text-blue-400" :
                        key === 'C' ? "bg-red-500/10 hover:bg-red-500/20 text-red-400" :
                        isDisabled ? "opacity-20 cursor-not-allowed" :
                        "bg-white/5 hover:bg-white/10 text-white/90"
                      )}
                    >
                      {key === '⌫' ? <Delete size={20} /> : key}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Explanation, Plot & History */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Math Visualizer Card */}
          <AnimatePresence>
            {visualization && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full"
              >
                <MathVisualizer 
                  type={visualization.type} 
                  data={visualization.data} 
                  onClose={() => setVisualization(null)} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Function Plotter Card */}
          <AnimatePresence>
            {showPlot && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#151619] rounded-3xl border border-green-500/30 p-6 shadow-xl flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-400">
                    <ChartIcon size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Function Visualizer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setVisualization({ type: 'function', data: { expression: plotExpression } })}
                      className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                      title="Open in Visualizer"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button 
                      onClick={() => setShowPlot(false)}
                      className="text-white/20 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Expression</span>
                  <div className="bg-white/5 rounded-xl p-3 font-mono text-sm text-green-400 border border-white/5">
                    {plotExpression || 'No expression'}
                  </div>
                </div>
                <div className="flex-1 min-h-[300px]">
                  <FunctionPlotter expression={plotExpression} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Explanation Card */}
          <AnimatePresence>
            {explanation && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#151619] rounded-3xl border border-blue-500/30 p-6 shadow-xl max-h-[400px] overflow-y-auto custom-scrollbar"
              >
                <div className="flex items-center justify-between mb-4 text-blue-400">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">AI Tutor Insights</span>
                  </div>
                  {lastCalculation?.visualization && (
                    <button 
                      onClick={() => setVisualization(lastCalculation.visualization)}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Maximize2 size={12} />
                      Visualize
                    </button>
                  )}
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Section */}
          <div className="flex-1 bg-[#151619] rounded-3xl border border-white/10 p-6 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-white/60">
                <HistoryIcon size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Recent Activity</span>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full ml-2",
                  serverStatus === 'online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                  serverStatus === 'offline' ? "bg-red-500" : "bg-amber-500 animate-pulse"
                )} />
              </div>
              {history.length > 0 && (
                <button 
                  onClick={() => setHistory([])}
                  className="text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 text-sm italic">
                  No activity yet
                </div>
              ) : (
                history.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.id}
                    className="group bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition-all cursor-pointer relative"
                    onClick={() => {
                      setDisplay(item.result);
                      if (item.explanation) setExplanation(item.explanation);
                      if (item.visualization) setVisualization(item.visualization);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs text-white/40 font-mono truncate max-w-[80%]">
                        {item.query}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-medium text-white/90">
                        {item.result}
                      </div>
                      {item.type === 'ai' && (
                        <Sparkles size={12} className="text-blue-400" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Geometry Calculator Modal */}
      <AnimatePresence>
        {showGeometryCalc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Box size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Geometry Calculator</h2>
                </div>
                <button onClick={() => setShowGeometryCalc(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 2D Shapes */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest">2D Shapes (Area)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input type="number" id="geo-r" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm" placeholder="Radius" />
                        <button 
                          onClick={() => {
                            const r = parseFloat((document.getElementById('geo-r') as HTMLInputElement).value || '0');
                            const area = Math.PI * r * r;
                            const circum = 2 * Math.PI * r;
                            setExplanation(`### Circle\n\n- **Radius:** ${r}\n- **Area:** ${area.toFixed(4)}\n- **Circumference:** ${circum.toFixed(4)}`);
                            setVisualization({ type: 'geometry', data: { shape: 'circle', params: { r } } });
                            setShowGeometryCalc(false);
                          }}
                          className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500 hover:text-white transition-all"
                        >
                          Circle
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" id="geo-w" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm" placeholder="Width" />
                        <input type="number" id="geo-h" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm" placeholder="Height" />
                        <button 
                          onClick={() => {
                            const w = parseFloat((document.getElementById('geo-w') as HTMLInputElement).value || '0');
                            const h = parseFloat((document.getElementById('geo-h') as HTMLInputElement).value || '0');
                            const area = w * h;
                            setExplanation(`### Rectangle\n\n- **Width:** ${w}\n- **Height:** ${h}\n- **Area:** ${area.toFixed(4)}`);
                            setVisualization({ type: 'geometry', data: { shape: 'rectangle', params: { w, h } } });
                            setShowGeometryCalc(false);
                          }}
                          className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500 hover:text-white transition-all"
                        >
                          Rectangle
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" id="geo-sides" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm" placeholder="Sides" />
                        <input type="number" id="geo-radius" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm" placeholder="Radius" />
                        <button 
                          onClick={() => {
                            const sides = parseInt((document.getElementById('geo-sides') as HTMLInputElement).value || '5');
                            const radius = parseFloat((document.getElementById('geo-radius') as HTMLInputElement).value || '100');
                            // Area of regular polygon: (n * s^2) / (4 * tan(pi/n))
                            // s = 2 * r * sin(pi/n)
                            const s = 2 * radius * Math.sin(Math.PI / sides);
                            const area = (sides * Math.pow(s, 2)) / (4 * Math.tan(Math.PI / sides));
                            setExplanation(`### Regular Polygon\n\n- **Sides:** ${sides}\n- **Circumradius:** ${radius}\n- **Side Length:** ${s.toFixed(4)}\n- **Area:** ${area.toFixed(4)}`);
                            setVisualization({ type: 'geometry', data: { shape: 'polygon', params: { sides, radius } } });
                            setShowGeometryCalc(false);
                          }}
                          className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500 hover:text-white transition-all"
                        >
                          Polygon
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3D Shapes */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">3D Shapes (Volume)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input type="number" id="geo-sr" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm" placeholder="Radius" />
                        <button 
                          onClick={() => {
                            const r = parseFloat((document.getElementById('geo-sr') as HTMLInputElement).value || '0');
                            const vol = (4/3) * Math.PI * Math.pow(r, 3);
                            const sa = 4 * Math.PI * r * r;
                            setExplanation(`### Sphere\n\n- **Radius:** ${r}\n- **Volume:** ${vol.toFixed(4)}\n- **Surface Area:** ${sa.toFixed(4)}`);
                            setShowGeometryCalc(false);
                          }}
                          className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all"
                        >
                          Sphere
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" id="geo-cr" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm" placeholder="Radius" />
                        <input type="number" id="geo-ch" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm" placeholder="Height" />
                        <button 
                          onClick={() => {
                            const r = parseFloat((document.getElementById('geo-cr') as HTMLInputElement).value || '0');
                            const h = parseFloat((document.getElementById('geo-ch') as HTMLInputElement).value || '0');
                            const vol = Math.PI * r * r * h;
                            const sa = 2 * Math.PI * r * (r + h);
                            setExplanation(`### Cylinder\n\n- **Radius:** ${r}\n- **Height:** ${h}\n- **Volume:** ${vol.toFixed(4)}\n- **Surface Area:** ${sa.toFixed(4)}`);
                            setShowGeometryCalc(false);
                          }}
                          className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all"
                        >
                          Cylinder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsAiMode(true);
                    setAiQuery(`Explain the derivation of formulas for the volume and surface area of a sphere, cone, and cylinder. Provide visual descriptions and examples.`);
                    setShowGeometryCalc(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  AI Geometry Guide
                </button>
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-xs text-white/40">Calculate properties of 2D and 3D shapes. AI Guide provides conceptual derivations.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finance Calculator Modal */}
      <AnimatePresence>
        {showFinanceCalc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Finance Calculator</h2>
                </div>
                <button onClick={() => setShowFinanceCalc(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Principal (P)</label>
                    <input type="number" id="fin-p" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none" placeholder="1000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Rate (r %)</label>
                    <input type="number" id="fin-r" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none" placeholder="5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Time (t years)</label>
                    <input type="number" id="fin-t" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none" placeholder="2" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Compounding (n)</label>
                    <input type="number" id="fin-n" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none" placeholder="1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      const p = parseFloat((document.getElementById('fin-p') as HTMLInputElement).value || '0');
                      const r = parseFloat((document.getElementById('fin-r') as HTMLInputElement).value || '0') / 100;
                      const t = parseFloat((document.getElementById('fin-t') as HTMLInputElement).value || '0');
                      const si = p * r * t;
                      const total = p + si;
                      setExplanation(`### Simple Interest\n\n- **Principal:** $${p}\n- **Interest Earned:** $${si.toFixed(2)}\n- **Total Amount:** $${total.toFixed(2)}`);
                      setShowFinanceCalc(false);
                    }}
                    className="px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all text-xs font-bold"
                  >
                    Simple Interest
                  </button>
                  <button 
                    onClick={() => {
                      const p = parseFloat((document.getElementById('fin-p') as HTMLInputElement).value || '0');
                      const r = parseFloat((document.getElementById('fin-r') as HTMLInputElement).value || '0') / 100;
                      const t = parseFloat((document.getElementById('fin-t') as HTMLInputElement).value || '0');
                      const n = parseFloat((document.getElementById('fin-n') as HTMLInputElement).value || '1');
                      const amount = p * Math.pow(1 + r/n, n * t);
                      const ci = amount - p;
                      setExplanation(`### Compound Interest\n\n- **Principal:** $${p}\n- **Interest Earned:** $${ci.toFixed(2)}\n- **Total Amount:** $${amount.toFixed(2)}`);
                      setShowFinanceCalc(false);
                    }}
                    className="px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold"
                  >
                    Compound Interest
                  </button>
                </div>
                
                <button 
                  onClick={() => {
                    const p = (document.getElementById('fin-p') as HTMLInputElement).value;
                    const r = (document.getElementById('fin-r') as HTMLInputElement).value;
                    const t = (document.getElementById('fin-t') as HTMLInputElement).value;
                    const n = (document.getElementById('fin-n') as HTMLInputElement).value;
                    setIsAiMode(true);
                    setAiQuery(`Explain the difference between simple and compound interest for a principal of $${p}, rate of ${r}%, and time of ${t} years (compounded ${n} times per year). Show the formulas and calculations.`);
                    setShowFinanceCalc(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  AI Comparison
                </button>
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-xs text-white/40">Calculate interest and compare simple vs compound growth with AI.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Base Converter Modal */}
      <AnimatePresence>
        {showBaseConverter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Binary size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Base Converter</h2>
                </div>
                <button onClick={() => setShowBaseConverter(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  {['Decimal', 'Binary', 'Octal', 'Hex'].map((base) => (
                    <div key={base} className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{base}</label>
                      <input 
                        type="text"
                        id={`base-${base.toLowerCase()}`}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-mono text-sm focus:border-indigo-500/50 outline-none transition-all"
                        placeholder={`Enter ${base} value`}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          if (!val) return;
                          try {
                            let dec;
                            if (base === 'Decimal') dec = parseInt(val, 10);
                            else if (base === 'Binary') dec = parseInt(val, 2);
                            else if (base === 'Octal') dec = parseInt(val, 8);
                            else if (base === 'Hex') dec = parseInt(val, 16);

                            if (isNaN(dec)) return;

                            if (base !== 'Decimal') (document.getElementById('base-decimal') as HTMLInputElement).value = dec.toString(10);
                            if (base !== 'Binary') (document.getElementById('base-binary') as HTMLInputElement).value = dec.toString(2);
                            if (base !== 'Octal') (document.getElementById('base-octal') as HTMLInputElement).value = dec.toString(8);
                            if (base !== 'Hex') (document.getElementById('base-hex') as HTMLInputElement).value = dec.toString(16).toUpperCase();
                          } catch(e) {}
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    const dec = (document.getElementById('base-decimal') as HTMLInputElement).value;
                    const bin = (document.getElementById('base-binary') as HTMLInputElement).value;
                    const oct = (document.getElementById('base-octal') as HTMLInputElement).value;
                    const hex = (document.getElementById('base-hex') as HTMLInputElement).value;
                    setIsAiMode(true);
                    setAiQuery(`Explain the conversion of decimal ${dec} to binary (${bin}), octal (${oct}), and hexadecimal (${hex}). Show the step-by-step process for each.`);
                    setShowBaseConverter(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  AI Explanation
                </button>
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-xs text-white/40">Type in any field to convert to all other bases instantly.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Statistics Calculator Modal */}
      <AnimatePresence>
        {showStatsCalc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500 rounded-lg">
                    <Hash size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Statistics Calculator</h2>
                </div>
                <button onClick={() => setShowStatsCalc(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Data Set (comma separated)</label>
                  <textarea 
                    id="stats-input"
                    placeholder="e.g., 10, 20, 30, 40, 50"
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-mono focus:border-rose-500/50 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      const input = (document.getElementById('stats-input') as HTMLTextAreaElement).value;
                      const data = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
                      if (data.length === 0) return;
                      try {
                        const mean = math.mean(data);
                        const median = math.median(data);
                        const std = math.std(data);
                        const variance = math.variance(data);
                        setExplanation(`### Statistics Report\n\n- **Mean:** ${mean}\n- **Median:** ${median}\n- **Standard Deviation:** ${std}\n- **Variance:** ${variance}\n\n**Data Set:** [${data.join(', ')}]`);
                        setShowStatsCalc(false);
                      } catch(e) { setDisplay('Error'); }
                    }}
                    className="px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold"
                  >
                    Calculate All
                  </button>
                  <button 
                    onClick={() => {
                      const input = (document.getElementById('stats-input') as HTMLTextAreaElement).value;
                      const data = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
                      setIsAiMode(true);
                      setAiQuery(`Analyze this data set: [${data.join(', ')}]. Provide mean, median, mode, standard deviation, and a brief interpretation of the distribution.`);
                      setShowStatsCalc(false);
                    }}
                    className="px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} />
                    AI Analysis
                  </button>
                </div>
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-xs text-white/40">Enter numbers separated by commas. AI Analysis provides deeper statistical insights.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Vector Calculator Modal */}
      <AnimatePresence>
        {showVectorCalc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <ChevronRight size={20} className="text-white rotate-45" />
                  </div>
                  <h2 className="text-xl font-semibold">Vector Calculator</h2>
                </div>
                <button onClick={() => setShowVectorCalc(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Vector A */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Vector A</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['x', 'y', 'z'].map((axis) => (
                        <div key={axis} className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase text-center block">{axis}</label>
                          <input 
                            type="number"
                            id={`vec-a-${axis}`}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-center font-mono text-sm focus:border-emerald-500/50 outline-none transition-all"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vector B */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Vector B</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['x', 'y', 'z'].map((axis) => (
                        <div key={axis} className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase text-center block">{axis}</label>
                          <input 
                            type="number"
                            id={`vec-b-${axis}`}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-center font-mono text-sm focus:border-blue-500/50 outline-none transition-all"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={() => {
                      const getVec = (id: string) => [
                        parseFloat((document.getElementById(`${id}-x`) as HTMLInputElement).value || '0'),
                        parseFloat((document.getElementById(`${id}-y`) as HTMLInputElement).value || '0'),
                        parseFloat((document.getElementById(`${id}-z`) as HTMLInputElement).value || '0')
                      ];
                      try {
                        const a = getVec('vec-a');
                        const b = getVec('vec-b');
                        const result = math.dot(a, b);
                        setDisplay(result.toString());
                      } catch(e) { setDisplay('Error'); }
                    }}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-xs font-bold"
                  >
                    Dot Product
                  </button>
                  <button 
                    onClick={() => {
                      const getVec = (id: string) => [
                        parseFloat((document.getElementById(`${id}-x`) as HTMLInputElement).value || '0'),
                        parseFloat((document.getElementById(`${id}-y`) as HTMLInputElement).value || '0'),
                        parseFloat((document.getElementById(`${id}-z`) as HTMLInputElement).value || '0')
                      ];
                      try {
                        const a = getVec('vec-a');
                        const b = getVec('vec-b');
                        const result = math.cross(a, b);
                        setDisplay(JSON.stringify(result));
                      } catch(e) { setDisplay('Error'); }
                    }}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-xs font-bold"
                  >
                    Cross Product
                  </button>
                  <button 
                    onClick={() => {
                      const getVec = (id: string) => [
                        parseFloat((document.getElementById(`${id}-x`) as HTMLInputElement).value || '0'),
                        parseFloat((document.getElementById(`${id}-y`) as HTMLInputElement).value || '0'),
                        parseFloat((document.getElementById(`${id}-z`) as HTMLInputElement).value || '0')
                      ];
                      try {
                        const a = getVec('vec-a');
                        const result = math.norm(a);
                        setDisplay(result.toString());
                      } catch(e) { setDisplay('Error'); }
                    }}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-xs font-bold"
                  >
                    Magnitude (A)
                  </button>
                  <button 
                    onClick={() => {
                      const getVec = (id: string) => [
                        parseFloat((document.getElementById(`${id}-x`) as HTMLInputElement).value || '0'),
                        parseFloat((document.getElementById(`${id}-y`) as HTMLInputElement).value || '0'),
                        parseFloat((document.getElementById(`${id}-z`) as HTMLInputElement).value || '0')
                      ];
                      const a = getVec('vec-a');
                      const b = getVec('vec-b');
                      setIsAiMode(true);
                      setAiQuery(`Explain the vector operations between Vector A = [${a}] and Vector B = [${b}]. Calculate dot product, cross product, and the angle between them.`);
                      setShowVectorCalc(false);
                    }}
                    className="px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} />
                    AI Insights
                  </button>
                </div>
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-xs text-white/40">Enter vector components (x, y, z) and select an operation. AI Insights provides geometric explanations.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Matrix Solver Modal */}
      <AnimatePresence>
        {showMatrixSolver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <ChartIcon size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Matrix Solver</h2>
                </div>
                <button onClick={() => setShowMatrixSolver(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Matrix A */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Matrix A</h3>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min="1" max="5" 
                          className="w-12 bg-white/5 border border-white/10 rounded p-1 text-center text-xs"
                          value={matrixADims.rows}
                          onChange={(e) => setMatrixADims({ ...matrixADims, rows: parseInt(e.target.value) || 1 })}
                        />
                        <span className="text-xs text-white/40">×</span>
                        <input 
                          type="number" 
                          min="1" max="5" 
                          className="w-12 bg-white/5 border border-white/10 rounded p-1 text-center text-xs"
                          value={matrixADims.cols}
                          onChange={(e) => setMatrixADims({ ...matrixADims, cols: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                    <div 
                      className="grid gap-2" 
                      style={{ gridTemplateColumns: `repeat(${matrixADims.cols}, minmax(0, 1fr))` }}
                      id="matrix-a-grid"
                    >
                      {[...Array(matrixADims.rows * matrixADims.cols)].map((_, i) => (
                        <input 
                          key={i}
                          type="number"
                          className="bg-white/5 border border-white/10 rounded-lg p-3 text-center font-mono text-sm focus:border-blue-500/50 outline-none transition-all"
                          placeholder="0"
                          data-index={i}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Matrix B */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest">Matrix B</h3>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min="1" max="5" 
                          className="w-12 bg-white/5 border border-white/10 rounded p-1 text-center text-xs"
                          value={matrixBDims.rows}
                          onChange={(e) => setMatrixBDims({ ...matrixBDims, rows: parseInt(e.target.value) || 1 })}
                        />
                        <span className="text-xs text-white/40">×</span>
                        <input 
                          type="number" 
                          min="1" max="5" 
                          className="w-12 bg-white/5 border border-white/10 rounded p-1 text-center text-xs"
                          value={matrixBDims.cols}
                          onChange={(e) => setMatrixBDims({ ...matrixBDims, cols: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                    <div 
                      className="grid gap-2" 
                      style={{ gridTemplateColumns: `repeat(${matrixBDims.cols}, minmax(0, 1fr))` }}
                      id="matrix-b-grid"
                    >
                      {[...Array(matrixBDims.rows * matrixBDims.cols)].map((_, i) => (
                        <input 
                          key={i}
                          type="number"
                          className="bg-white/5 border border-white/10 rounded-lg p-3 text-center font-mono text-sm focus:border-purple-500/50 outline-none transition-all"
                          placeholder="0"
                          data-index={i}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button 
                    onClick={() => {
                      const getMatrix = (id: string, rows: number, cols: number) => {
                        const inputs = document.querySelectorAll(`#${id}-grid input`);
                        const data: number[][] = [];
                        for(let r=0; r<rows; r++) {
                          data[r] = [];
                          for(let c=0; c<cols; c++) {
                            data[r][c] = parseFloat((inputs[r*cols + c] as HTMLInputElement).value || '0');
                          }
                        }
                        return data;
                      };
                      try {
                        const a = getMatrix('matrix-a', matrixADims.rows, matrixADims.cols);
                        const b = getMatrix('matrix-b', matrixBDims.rows, matrixBDims.cols);
                        const result = math.add(a, b);
                        setDisplay(JSON.stringify(result));
                      } catch(e) { setDisplay('Error'); }
                    }}
                    className="px-6 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all font-bold text-xs"
                  >
                    A + B
                  </button>
                  <button 
                    onClick={() => {
                      const getMatrix = (id: string, rows: number, cols: number) => {
                        const inputs = document.querySelectorAll(`#${id}-grid input`);
                        const data: number[][] = [];
                        for(let r=0; r<rows; r++) {
                          data[r] = [];
                          for(let c=0; c<cols; c++) {
                            data[r][c] = parseFloat((inputs[r*cols + c] as HTMLInputElement).value || '0');
                          }
                        }
                        return data;
                      };
                      try {
                        const a = getMatrix('matrix-a', matrixADims.rows, matrixADims.cols);
                        const b = getMatrix('matrix-b', matrixBDims.rows, matrixBDims.cols);
                        const result = math.subtract(a, b);
                        setDisplay(JSON.stringify(result));
                      } catch(e) { setDisplay('Error'); }
                    }}
                    className="px-6 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all font-bold text-xs"
                  >
                    A - B
                  </button>
                  <button 
                    onClick={() => {
                      const getMatrix = (id: string, rows: number, cols: number) => {
                        const inputs = document.querySelectorAll(`#${id}-grid input`);
                        const data: number[][] = [];
                        for(let r=0; r<rows; r++) {
                          data[r] = [];
                          for(let c=0; c<cols; c++) {
                            data[r][c] = parseFloat((inputs[r*cols + c] as HTMLInputElement).value || '0');
                          }
                        }
                        return data;
                      };
                      try {
                        const a = getMatrix('matrix-a', matrixADims.rows, matrixADims.cols);
                        const b = getMatrix('matrix-b', matrixBDims.rows, matrixBDims.cols);
                        const result = math.multiply(a, b);
                        setDisplay(JSON.stringify(result));
                      } catch(e) { setDisplay('Error'); }
                    }}
                    className="px-6 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all font-bold text-xs"
                  >
                    A × B
                  </button>
                  <button 
                    onClick={() => {
                      const getMatrix = (id: string, rows: number, cols: number) => {
                        const inputs = document.querySelectorAll(`#${id}-grid input`);
                        const data: number[][] = [];
                        for(let r=0; r<rows; r++) {
                          data[r] = [];
                          for(let c=0; c<cols; c++) {
                            data[r][c] = parseFloat((inputs[r*cols + c] as HTMLInputElement).value || '0');
                          }
                        }
                        return data;
                      };
                      try {
                        const a = getMatrix('matrix-a', matrixADims.rows, matrixADims.cols);
                        const result = math.det(a);
                        setDisplay(result.toString());
                      } catch(e) { setDisplay('Error'); }
                    }}
                    className="px-6 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all font-bold text-xs"
                  >
                    det(A)
                  </button>
                  <button 
                    onClick={() => {
                      const getMatrix = (id: string, rows: number, cols: number) => {
                        const inputs = document.querySelectorAll(`#${id}-grid input`);
                        const data: number[][] = [];
                        for(let r=0; r<rows; r++) {
                          data[r] = [];
                          for(let c=0; c<cols; c++) {
                            data[r][c] = parseFloat((inputs[r*cols + c] as HTMLInputElement).value || '0');
                          }
                        }
                        return data;
                      };
                      try {
                        const a = getMatrix('matrix-a', matrixADims.rows, matrixADims.cols);
                        const result = math.inv(a);
                        setDisplay(JSON.stringify(result));
                      } catch(e) { setDisplay('Error'); }
                    }}
                    className="px-6 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all font-bold text-xs"
                  >
                    inv(A)
                  </button>
                  <button 
                    onClick={() => {
                      const getMatrix = (id: string, rows: number, cols: number) => {
                        const inputs = document.querySelectorAll(`#${id}-grid input`);
                        const data: number[][] = [];
                        for(let r=0; r<rows; r++) {
                          data[r] = [];
                          for(let c=0; c<cols; c++) {
                            data[r][c] = parseFloat((inputs[r*cols + c] as HTMLInputElement).value || '0');
                          }
                        }
                        return data;
                      };
                      const a = getMatrix('matrix-a', matrixADims.rows, matrixADims.cols);
                      const b = getMatrix('matrix-b', matrixBDims.rows, matrixBDims.cols);
                      setIsAiMode(true);
                      setAiQuery(`Explain this matrix operation: Matrix A = ${JSON.stringify(a)}, Matrix B = ${JSON.stringify(b)}. Solve for A * B and find the determinant of A.`);
                      setShowMatrixSolver(false);
                    }}
                    className="px-6 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all font-bold text-xs flex items-center gap-2"
                  >
                    <Sparkles size={14} />
                    AI Insights
                  </button>
                </div>
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-xs text-white/40">Enter matrix values and select an operation to compute. Use AI Insights for step-by-step explanations.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center p-8 gap-6"
            >
              <div className="flex items-center gap-3 self-start">
                <div className="p-2 bg-rose-500 rounded-lg">
                  <QrCode size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold">Share Calculation</h2>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-inner flex items-center justify-center">
                <QRCodeCanvas 
                  id="qr-code-canvas"
                  value={lastCalculation && lastCalculation.result === display ? `${lastCalculation.query} = ${lastCalculation.result}` : display} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-white/80 font-mono break-all max-h-20 overflow-y-auto px-2">
                  {lastCalculation && lastCalculation.result === display ? `${lastCalculation.query} = ${lastCalculation.result}` : display}
                </p>
                <p className="text-xs text-white/40">Scan this code to share your current calculation or result.</p>
              </div>

              <div className="w-full flex flex-col gap-2">
                <button 
                  onClick={() => {
                    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
                    if (canvas) {
                      const url = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.download = 'calculation-qr.png';
                      link.href = url;
                      link.click();
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all font-bold flex items-center justify-center gap-2"
                >
                  Download QR
                </button>
                <button 
                  onClick={() => setShowQr(false)}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Constants Modal */}
      <AnimatePresence>
        {showConstants && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Atom size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Scientific Constants</h2>
                </div>
                <button onClick={() => setShowConstants(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar">
                {PHYSICAL_CONSTANTS.map((c) => (
                  <button
                    key={c.symbol}
                    onClick={() => {
                      setDisplay(prev => prev === '0' ? c.value.toString() : prev + c.value.toString());
                      setShowConstants(false);
                    }}
                    className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-lg font-bold text-indigo-400">{c.symbol}</span>
                      <span className="text-[10px] text-white/20 uppercase tracking-widest">{c.unit}</span>
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white">{c.name}</span>
                    <span className="text-xs text-white/40 font-mono mt-1">{c.value.toExponential(4)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unit Converter Modal */}
      <AnimatePresence>
        {showConverter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Ruler size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Unit Converter</h2>
                </div>
                <button onClick={() => setShowConverter(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
                {/* Sidebar: Categories */}
                <div className="w-full sm:w-48 bg-white/5 border-r border-white/5 overflow-x-auto sm:overflow-y-auto flex sm:flex-col p-2 gap-1 custom-scrollbar">
                  {UNIT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setSelectedUnitCategory(cat.name);
                        setUnitFrom(cat.units[0]);
                        setUnitTo(cat.units[1] || cat.units[0]);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-medium transition-all text-left whitespace-nowrap",
                        selectedUnitCategory === cat.name 
                          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Input Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">From</label>
                        <span className="text-[10px] font-bold text-indigo-400">{selectedUnitCategory}</span>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            value={unitInputValue}
                            onChange={(e) => setUnitInputValue(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-2xl font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="0"
                          />
                        </div>
                        <select
                          value={unitFrom}
                          onChange={(e) => setUnitFrom(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors min-w-[100px]"
                        >
                          {UNIT_CATEGORIES.find(c => c.name === selectedUnitCategory)?.units.map(u => (
                            <option key={u} value={u} className="bg-[#151619]">{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center -my-2">
                      <button 
                        onClick={() => {
                          const temp = unitFrom;
                          setUnitFrom(unitTo);
                          setUnitTo(temp);
                          setUnitInputValue(unitOutputValue.replace(/,/g, ''));
                        }}
                        className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-indigo-500 hover:border-indigo-400 transition-all group"
                      >
                        <RotateCcw size={16} className="text-white/40 group-hover:text-white transition-colors" />
                      </button>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">To</label>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <div className="w-full bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-4 text-2xl font-bold text-indigo-400 flex items-center">
                            {unitOutputValue}
                          </div>
                        </div>
                        <select
                          value={unitTo}
                          onChange={(e) => setUnitTo(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors min-w-[100px]"
                        >
                          {UNIT_CATEGORIES.find(c => c.name === selectedUnitCategory)?.units.map(u => (
                            <option key={u} value={u} className="bg-[#151619]">{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Common Units Quick Select */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Common Units</h4>
                    <div className="flex flex-wrap gap-2">
                      {UNIT_CATEGORIES.find(c => c.name === selectedUnitCategory)?.units.map((u) => (
                        <button
                          key={u}
                          onClick={() => setUnitTo(u)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            unitTo === u 
                              ? "bg-indigo-500 text-white" 
                              : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                          )}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Equation Solver Modal */}
      <AnimatePresence>
        {showEqSolver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Binary size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Equation Solver</h2>
                </div>
                <button onClick={() => setShowEqSolver(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-white/60">Select equation type to solve using AI Tutor:</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Linear System (2x2)",
                    "Linear System (3x3)",
                    "Quadratic Equation (ax² + bx + c = 0)",
                    "Cubic Equation (ax³ + bx² + cx + d = 0)",
                    "Simultaneous Equations"
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setIsAiMode(true);
                        setAiQuery(`Solve ${type}: `);
                        setShowEqSolver(false);
                      }}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-left transition-all group"
                    >
                      <span className="text-sm font-medium text-white/80 group-hover:text-white">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTopics && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Course Syllabus</h2>
                </div>
                <button 
                  onClick={() => setShowTopics(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {MATH_FORMULAS.map((topic, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-medium text-blue-400 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-xs">{index + 1}</span>
                      {topic.title}
                    </h3>
                    <div className="pl-8 text-sm text-white/70 leading-relaxed prose prose-invert max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {topic.content}
                      </ReactMarkdown>
                    </div>
                    {index < MATH_FORMULAS.length - 1 && <div className="h-px bg-white/5 pt-4" />}
                  </div>
                ))}
              </div>
              <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-xs text-white/40">MATCAL AI Comprehensive Syllabus & Reference Guide</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Formulas Modal */}
      <AnimatePresence>
        {showFormulas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#151619] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Formula Reference Sheet</h2>
                </div>
                <button 
                  onClick={() => setShowFormulas(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {MATH_FORMULAS.map((topic, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-[10px]">{index + 1}</span>
                      {topic.title}
                    </h3>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {topic.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-xs text-white/40">Comprehensive formula sheet for advanced mathematics.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="mt-8 text-white/20 text-[10px] uppercase tracking-[0.2em] flex items-center gap-4">
        <span>MATCAL AI Pro</span>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <span>Multimodal Computational Engine</span>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-blue-500 text-white rounded-full shadow-2xl hover:bg-blue-600 transition-all z-50 flex items-center justify-center"
            title="Scroll to top"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
