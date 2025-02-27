'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileInfo {
  name: string;
  type?: string;
  size?: number;
  url?: string;
  id: string;
}

interface FilePreviewProps {
  files: FileInfo[];
  removeUrl: string;
  onRemoveComplete?: () => void;
}

export function FilePreview({ files, removeUrl, onRemoveComplete }: FilePreviewProps): JSX.Element {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [fileIds, setFileIds] = useState<string[]>(files.map(file => file.id));

  const handleRemove = async (fileId: string): Promise<void> => {
    try {
      const response = await fetch(`${removeUrl}/${fileId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setFileIds(prev => prev.filter(id => id !== fileId));
        if (onRemoveComplete) {
          // This function will only be called client-side
          onRemoveComplete();
        }
      }
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  };

  const renderPreview = (file: FileInfo, _index: number): JSX.Element | null => {
    // Skip rendering removed files
    if (!fileIds.includes(file.id)) return null;
    
    const isImage = file.type?.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const imageUrl = file.url || (file.type ? URL.createObjectURL(new File([], file.name, { type: file.type })) : null);

    if (isImage && imageUrl) {
      return (
        <div key={file.id} className="relative group">
          <Image
            src={imageUrl}
            alt={file.name}
            width={100}
            height={100}
            className="object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setExpandedImage(imageUrl)}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemove(file.id)}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (isPDF) {
      return (
        <div key={file.id} className="relative group p-4 border rounded bg-gray-50 hover:bg-gray-100 transition-colors">
          <p className="text-sm truncate">{file.name}</p>
          {file.size && <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemove(file.id)}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {files.map((file, _index) => renderPreview(file, _index))}
      </div>

      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setExpandedImage(null)}
          role="dialog"
          aria-label="Expanded image preview"
        >
          <Image
            src={expandedImage}
            alt="Preview"
            width={800}
            height={600}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            priority
          />
        </div>
      )}
    </div>
  );
} 