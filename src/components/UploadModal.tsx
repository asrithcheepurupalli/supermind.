import React from 'react';
import { 
  X, 
  Upload, 
  Mic, 
  Camera, 
  Image, 
  FileText, 
  Type, 
  Clipboard,
  Link,
  Loader2
} from 'lucide-react';
import { generateTags, generateSummary, suggestCategory, suggestReminderDate } from '../utils/aiUtils';
import toast from 'react-hot-toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (content: any) => void;
}

export default function UploadModal({ isOpen, onClose, onAddContent }: UploadModalProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [textInput, setTextInput] = React.useState('');
  const [linkInput, setLinkInput] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const uploadOptions = [
    { 
      id: 'audio', 
      label: 'Audio', 
      icon: Mic, 
      color: 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20',
      action: () => audioInputRef.current?.click()
    },
    { 
      id: 'camera', 
      label: 'Camera', 
      icon: Camera, 
      color: 'text-green-400 bg-green-500/10 hover:bg-green-500/20',
      action: () => cameraInputRef.current?.click()
    },
    { 
      id: 'photos', 
      label: 'Photos', 
      icon: Image, 
      color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20',
      action: () => photoInputRef.current?.click()
    },
    { 
      id: 'files', 
      label: 'Files', 
      icon: FileText, 
      color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20',
      action: () => fileInputRef.current?.click()
    },
    { 
      id: 'text', 
      label: 'Text', 
      icon: Type, 
      color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20',
      action: () => {
        const textArea = document.querySelector('textarea[placeholder*="Write your thoughts"]') as HTMLTextAreaElement;
        if (textArea) {
          textArea.focus();
          textArea.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    { 
      id: 'paste', 
      label: 'Paste', 
      icon: Clipboard, 
      color: 'text-pink-400 bg-pink-500/10 hover:bg-pink-500/20',
      action: async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            setTextInput(text);
            toast.success('Content pasted from clipboard!');
          }
        } catch (error) {
          toast.error('Unable to access clipboard. Please paste manually.');
        }
      }
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    
    for (const file of files) {
      const contentType = getContentType(file.type);
      const content = file.name;
      
      const tags = generateTags(content, contentType);
      const summary = generateSummary(content, contentType);
      const category = suggestCategory(content, tags);
      const reminderDate = suggestReminderDate(content);

      const newContent = {
        id: Date.now().toString() + Math.random(),
        contentText: content,
        contentType,
        sourceApp: 'Direct Upload',
        timestamp: new Date(),
        tags,
        summary,
        fileUrl: URL.createObjectURL(file),
        reminderDate,
        userId: 'user1',
        category,
        isFavorite: false,
      };

      onAddContent(newContent);
    }
    
    setIsProcessing(false);
    onClose();
  };

  const getContentType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    return 'text';
  };

  const handleFileSelect = async (files: FileList | null, inputType?: string) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    await processFiles(fileArray);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      toast.success('Recording started! (Demo mode - recording not implemented)');
      // In a real app, you would implement actual recording here
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        toast.info('Recording stopped. Feature coming soon!');
      }, 3000);
    } catch (error) {
      toast.error('Microphone access denied or not available');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      toast.success('Camera started! (Demo mode - capture not implemented)');
      // In a real app, you would implement actual camera capture here
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        toast.info('Camera stopped. Feature coming soon!');
      }, 3000);
    } catch (error) {
      toast.error('Camera access denied or not available');
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const tags = generateTags(textInput, 'text');
      const summary = generateSummary(textInput, 'text');
      const category = suggestCategory(textInput, tags);
      const reminderDate = suggestReminderDate(textInput);

      const newContent = {
        id: Date.now().toString() + Math.random(),
        contentText: textInput,
        contentType: 'text' as const,
        sourceApp: 'Direct Input',
        timestamp: new Date(),
        tags,
        summary,
        reminderDate,
        userId: 'user1',
        category,
        isFavorite: false,
      };

      await onAddContent(newContent);
      setTextInput('');
      onClose();
    } catch (error) {
      console.error('Failed to add content:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLinkSubmit = async () => {
    if (!linkInput.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const tags = generateTags(linkInput, 'link');
      const summary = generateSummary(linkInput, 'link');
      const category = suggestCategory(linkInput, tags);

      const newContent = {
        id: Date.now().toString() + Math.random(),
        contentText: linkInput,
        contentType: 'link' as const,
        sourceApp: new URL(linkInput).hostname,
        timestamp: new Date(),
        tags,
        summary,
        userId: 'user1',
        category,
        isFavorite: false,
      };

      await onAddContent(newContent);
      setLinkInput('');
      onClose();
    } catch (error) {
      console.error('Failed to add content:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] lg:max-h-[80vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-white">Add Content</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 touch-manipulation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 lg:p-8 mb-6 lg:mb-8 text-center transition-all duration-300 ${
            dragActive
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <Upload className="mx-auto mb-4 text-gray-400" size={28} />
          <p className="text-gray-300 mb-2 text-sm lg:text-base">Drag and drop files here</p>
          <p className="text-gray-500 text-xs lg:text-sm">Supports images, videos, audio, PDFs, and documents</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
          {uploadOptions.map(option => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                onClick={option.action}
                className={`flex flex-col items-center gap-2 lg:gap-3 p-4 lg:p-6 rounded-xl border border-gray-700/50 transition-all duration-200 touch-manipulation hover:scale-105 active:scale-95 ${option.color}`}
              >
                <IconComponent size={20} className="lg:hidden" />
                <IconComponent size={24} className="hidden lg:block" />
                <span className="font-medium text-sm lg:text-base">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={audioInputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={photoInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Text Input */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-3 text-sm lg:text-base">Add Text Note</label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Write your thoughts, notes, or ideas..."
            className="w-full h-24 lg:h-32 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm lg:text-base"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isProcessing}
            className="mt-3 px-4 lg:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 text-sm lg:text-base touch-manipulation"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </div>
            ) : (
              'Add Note'
            )}
          </button>
        </div>

        {/* Link Input */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-3 text-sm lg:text-base">Add Link</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm lg:text-base"
              />
            </div>
            <button
              onClick={handleLinkSubmit}
              disabled={!linkInput.trim() || isProcessing}
              className="px-4 lg:px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 text-sm lg:text-base touch-manipulation"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Processing...
                </div>
              ) : (
                'Add Link'
              )}
            </button>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-6 text-sm lg:text-base">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="animate-spin text-emerald-400" size={24} />
              <span className="text-white font-medium">Processing with AI...</span>
            </div>
            <p className="text-gray-400 text-xs text-center">
              Analyzing content, generating tags, and creating summary
            </p>
          </div>
        )}
      </div>
    </div>
  );
}