
'use client';

import { Image as ImageIcon, Link } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NeumorphicCard } from '../neumorphic-card';
import { Input } from '../ui/input';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const isValidUrl = value && (value.startsWith('http://') || value.startsWith('https://'));

  return (
    <div>
      {isValidUrl ? (
        <NeumorphicCard inset className="relative w-full h-48 rounded-lg overflow-hidden p-2">
          <Image
            src={value}
            alt="Aperçu de l'image"
            fill
            className="object-contain rounded-md"
          />
        </NeumorphicCard>
      ) : (
        <NeumorphicCard
          inset
          className={cn(
            'w-full h-48 flex items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 transition-colors',
            disabled ? 'cursor-not-allowed opacity-50' : ''
          )}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-10 h-10" />
             <p className="text-sm">Aucune image</p>
             <p className="text-xs">Collez une URL ci-dessous.</p>
          </div>
        </NeumorphicCard>
      )}
       <Input 
        placeholder="https://exemple.com/image.png" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-2"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Utilisez un service comme <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="underline">Imgur</a> pour héberger vos images.
      </p>
    </div>
  );
}
