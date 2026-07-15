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
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SavedContent } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (content: SavedContent) => Promise<void> | void;
}

// Files up to this size are embedded as data URLs so they survive reloads.
// Larger files only keep their name (browser localStorage is limited to ~5MB).
const MAX_EMBED_SIZE = 1.5 * 1024 * 1024;

const newId = () =>
  `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export default function UploadModal({ isOpen, onClose, onAddContent }: UploadModalProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [textInput, setTextInput] = React.useState('');
  const [linkInput, setLinkInput] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const uploadOptions = [
    {
      id: 'audio',
      label: 'Audio',
      icon: Mic,
      color: 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20',
      action: () => audioInputRef.current?.click(),
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      color: 'text-green-400 bg-green-500/10 hover:bg-green-500/20',
      action: () => cameraInputRef.current?.click(),
    },
    {
      id: 'photos',
      label: 'Photos',
      icon: Image,
      color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20',
      action: () => photoInputRef.current?.click(),
    },
    {
      id: 'files',
      label: 'Files',
      icon: FileText,
      color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20',
      action: () => fileInputRef.current?.click(),
    },
    {
      id: 'text',
      label: 'Text',
      icon: Type,
      color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20',
      action: () => {
        textAreaRef.current?.focus();
        textAreaRef.current?.scrollIntoView({ behavior: 'smooth' });
      },
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
        } catch {
          toast.error('Unable to access clipboard. Please paste manually.');
        }
      },
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

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });

  const getContentType = (mimeType: string): SavedContent['contentType'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    return 'text';
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);

    try {
      for (const file of files) {
        const contentType = getContentType(file.type);

        let fileUrl: string | undefined;
        let contentText = file.name;

        if (contentType === 'text' && file.size <= MAX_EMBED_SIZE) {
          // Plain text files: store their actual content so it's searchable.
          try {
            contentText = `${file.name}\n\n${await readFileAsText(file)}`;
          } catch {
            contentText = file.name;
          }
        } else if (file.size <= MAX_EMBED_SIZE) {
          fileUrl = await readFileAsDataURL(file);
        } else {
          toast(`"${file.name}" is larger than 1.5MB — saving its name only (local storage limit).`, { icon: 'ℹ️' });
        }

        const newContent: SavedContent = {
          id: newId(),
          contentText,
          contentType,
          sourceApp: 'Upload',
          timestamp: new Date(),
          tags: [],
          summary: '',
          fileUrl,
          userId: 'local',
          category: 'articles',
          isFavorite: false,
          metadata: { fileSize: file.size },
        };

        await onAddContent(newContent);
      }
      onClose();
    } catch (error) {
      console.error('Failed to process files:', error);
      toast.error('Failed to process one or more files');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    try {
      const newContent: SavedContent = {
        id: newId(),
        contentText: textInput.trim(),
        contentType: 'text',
        sourceApp: 'Note',
        timestamp: new Date(),
        tags: [],
        summary: '',
        userId: 'local',
        category: 'personal',
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
    const raw = linkInput.trim();
    if (!raw) return;

    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    let hostname: string;
    try {
      hostname = new URL(withProtocol).hostname;
    } catch {
      toast.error('That does not look like a valid URL');
      return;
    }

    setIsProcessing(true);
    try {
      const newContent: SavedContent = {
        id: newId(),
        contentText: withProtocol,
        contentType: 'link',
        sourceApp: hostname,
        timestamp: new Date(),
        tags: [],
        summary: '',
        userId: 'local',
        category: 'articles',
        isFavorite: false,
      };

      await onAddContent(newContent);
      setLinkInput('');
      onClose();
    } catch (error) {
      console.error('Failed to add link:', error);
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
          <p className="text-gray-500 text-xs lg:text-sm">
            Images, videos, audio, PDFs and text files — stored locally on your device
          </p>
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
            ref={textAreaRef}
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
                onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
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
              <span className="text-white font-medium">Organizing your content...</span>
            </div>
            <p className="text-gray-400 text-xs text-center">
              Tagging, summarizing, and categorizing — all on your device
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
