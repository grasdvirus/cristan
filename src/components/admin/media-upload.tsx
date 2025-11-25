'use client';

import { useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Image as ImageIcon, UploadCloud, X, Video } from 'lucide-react';
import Image from 'next/image';
import { NeumorphicCard } from '../neumorphic-card';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { getYoutubeThumbnailUrl } from '@/lib/utils';

interface MediaUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  accept?: DropzoneOptions['accept'];
  mediaType?: 'image' | 'video';
}

export function MediaUpload({ value, onChange, disabled, accept, mediaType = 'image' }: MediaUploadProps) {
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

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          if (result.success && result.url) {
            onChange(result.url);
            toast({ variant: "success", title: 'Téléversement réussi!' });
          } else {
            throw new Error(result.error || 'Réponse invalide du serveur');
          }
        } catch (e: any) {
            toast({
                title: 'Erreur de réponse du serveur',
                description: e.message || 'La réponse n\'a pas pu être analysée.',
                variant: 'destructive',
            });
        }
      } else {
        let errorMsg = `Le téléversement a échoué avec le statut : ${xhr.status}`;
        try {
            const result = JSON.parse(xhr.responseText);
            if (result.error) {
                errorMsg = result.error;
            }
        } catch (e) {
            // La réponse n'est pas en JSON, on garde le message de base
        }
        toast({
          title: 'Erreur de téléversement',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    };

    xhr.onerror = () => {
        setIsUploading(false);
        toast({
          title: 'Erreur réseau',
          description: "Impossible de se connecter au serveur de téléversement.",
          variant: 'destructive',
        });
    };

    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || { 'image/*': [] },
    disabled: disabled || isUploading,
    multiple: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };
  
  const currentUrl = value || '';
  const displayUrl = getYoutubeThumbnailUrl(currentUrl) || currentUrl;
  const isYoutube = (currentUrl).includes('youtube.com') || (currentUrl).includes('youtu.be');

  const renderPreview = () => {
    if (currentUrl && !isUploading) {
        const isVideo = mediaType === 'video' || /\.(mp4|webm|mov)$/i.test(currentUrl);
        return (
            <div className="relative w-full h-full">
                {isVideo && !isYoutube ? (
                    <video key={currentUrl} controls className="w-full h-full object-contain rounded-md">
                        <source src={currentUrl} type={currentUrl.endsWith('mp4') ? 'video/mp4' : currentUrl.endsWith('webm') ? 'video/webm' : undefined} />
                    </video>
                ) : (
                    <Image src={displayUrl} alt="Aperçu" layout="fill" className="object-contain rounded-md" />
                )}
                 <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute top-1 right-1 bg-background/50 rounded-full p-1 text-destructive hover:bg-background z-10"
                    >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )
    }
    if (isUploading) {
        return (
            <div className="flex flex-col items-center gap-2 w-full px-4">
                <p className="text-sm text-muted-foreground">Téléversement...</p>
                <Progress value={uploadProgress} className="w-full" />
            </div>
        )
    }
    return (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {mediaType === 'video' ? <Video className="w-10 h-10" /> : <ImageIcon className="w-10 h-10" />}
            <UploadCloud className="w-10 h-10" />
            <p className="text-sm">Glissez-déposez ou cliquez pour téléverser</p>
            <p className="text-xs">Taille max : 5Mo</p>
        </div>
    )
  }

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
        {renderPreview()}
      </NeumorphicCard>
      {isYoutube && (
          <p className="text-xs text-muted-foreground mt-1">Aperçu généré depuis l'URL YouTube. Pour changer l'image, supprimez d'abord l'URL.</p>
      )}
    </div>
  );
}
