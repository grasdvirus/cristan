'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { NeumorphicCard } from '../neumorphic-card';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { getYoutubeThumbnailUrl } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success) {
        onChange(result.url);
        toast({ variant: "success", title: 'Téléversement réussi!' });
      } else {
        throw new Error(result.error || 'Unknown upload error');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erreur de téléversement',
        description: error.message || 'Impossible de téléverser le fichier.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: disabled || isUploading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };
  
  const displayUrl = getYoutubeThumbnailUrl(value) || value;
  const isYoutube = value.includes('youtube.com') || value.includes('youtu.be');

  return (
    <div>
      <NeumorphicCard
        inset
        {...getRootProps()}
        className={cn(
          'w-full h-48 flex items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 transition-colors cursor-pointer',
          isDragActive && 'border-primary',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50',
          isYoutube && 'pointer-events-none'
        )}
      >
        <input {...getInputProps()} />
        {value && !isUploading ? (
          <div className="relative w-full h-full">
            <Image src={displayUrl} alt="Aperçu" layout="fill" className="object-contain rounded-md" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-background/50 rounded-full p-1 text-destructive hover:bg-background z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-2 w-full px-4">
             <p className="text-sm text-muted-foreground">Téléversement...</p>
             <Progress value={uploadProgress} className="w-full" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="w-10 h-10" />
            <p className="text-sm">Glissez-déposez ou cliquez pour téléverser</p>
            <p className="text-xs">Taille max : 4MB</p>
          </div>
        )}
      </NeumorphicCard>
      {isYoutube && (
          <p className="text-xs text-muted-foreground mt-1">Aperçu généré depuis l'URL YouTube. Pour changer l'image, supprimez d'abord l'URL.</p>
      )}
    </div>
  );
}