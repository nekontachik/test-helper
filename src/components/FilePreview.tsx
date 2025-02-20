'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  files: Array<{ name: string; type?: string; size?: number }>;
  onRemove: (index: number) => void;
}

export function FilePreview({ files, onRemove }: FilePreviewProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const renderPreview = (file: { name: string; type?: string; size?: number }, index: number) => {
    const isImage = file.type?.startsWith('image/') || false;
    const isPDF = file.type === 'application/pdf';

    if (isImage) {
      const imageUrl = URL.createObjectURL(new File([], file.name, { type: file.type }));
      return (
        <div key={index} className="relative group">
          <Image
            src={imageUrl}
            alt={file.name}
            width={100}
            height={100}
            className="object-cover rounded cursor-pointer"
            onClick={() => setExpandedImage(imageUrl)}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (isPDF) {
      return (
        <div key={index} className="relative group p-4 border rounded">
          <p className="text-sm">{file.name}</p>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {files.map((file, index) => renderPreview(file, index))}
      </div>

      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setExpandedImage(null)}
        >
          <Image
            src={expandedImage}
            alt="Preview"
            width={800}
            height={600}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
} 