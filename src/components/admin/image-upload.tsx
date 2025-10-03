
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NeumorphicCard } from '../neumorphic-card';

interface ImageUploadProps {
  value: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.webp'] },
    disabled,
  });

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
  }

  return (
    <div>
        {value ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                    src={value}
                    alt="Aperçu de l'image"
                    fill
                    className="object-contain"
                />
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={handleRemove}
                        className="p-1.5 bg-destructive/80 text-destructive-foreground rounded-full shadow-md hover:bg-destructive transition-colors"
                        aria-label="Supprimer l'image"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        ) : (
            <NeumorphicCard 
                inset 
                {...getRootProps()} 
                className={cn(
                    'w-full h-48 flex items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 cursor-pointer transition-colors',
                    isDragActive ? 'border-primary bg-accent' : '',
                    disabled ? 'cursor-not-allowed opacity-50' : ''
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {isUploading ? (
                        <p>Chargement...</p>
                    ) : (
                        <>
                            <UploadCloud className="w-10 h-10" />
                            <p className="text-sm">
                                {isDragActive ? 'Déposez pour téléverser' : "Glissez-déposez ou cliquez ici"}
                            </p>
                            <p className="text-xs">Formats supportés : JPG, PNG, GIF, WEBP</p>
                        </>
                    )}
                </div>
            </NeumorphicCard>
        )}
    </div>
  );
}
