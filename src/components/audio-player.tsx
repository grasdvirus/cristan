
'use client';

import { useEffect, useRef, useState } from 'react';
import { generatePresentationAudio } from '@/ai/flows/generate-presentation-audio';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Loader2, Play, Pause } from 'lucide-react';
import { useToast } from './ui/use-toast';

type PresentationAudio = {
  text: string;
};

export function AudioPlayer() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const audioDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'presentationAudio', 'main');
  }, [firestore]);

  const { data: audioData } = useDoc<PresentationAudio>(audioDocRef);

  useEffect(() => {
    if (!audioData?.text) {
      setIsLoading(false);
      return;
    }

    const generateAudio = async () => {
      try {
        const result = await generatePresentationAudio(audioData.text);
        if (result.media) {
          setAudioUrl(result.media);
        } else {
          throw new Error('Aucun média audio retourné.');
        }
      } catch (error) {
        console.error('Erreur lors de la génération de l\'audio, le lecteur ne sera pas affiché:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateAudio();
  }, [audioData, toast]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play().catch(e => console.error("Erreur de lecture audio:", e));
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if(audioUrl && audio) {
        audio.play().catch(e => console.log('Autoplay a été bloqué par le navigateur.'));
        setIsPlaying(!audio.paused);
        
        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }
  }, [audioUrl]);

  if (!audioData?.text || !audioUrl) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          hidden
        />
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        disabled={isLoading || !audioUrl}
        className="btn-neumorphic-light dark:btn-neumorphic-dark rounded-full w-12 h-12"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
