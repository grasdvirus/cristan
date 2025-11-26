
'use client';

import { useEffect, useRef, useState } from 'react';
import { generatePresentationAudio } from '@/ai/flows/generate-presentation-audio';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Loader2, Play, Pause } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from '@/hooks/use-mobile';


type PresentationAudio = {
  text: string;
};

const TalkingHeadIcon = () => (
    <div className="flex items-end gap-1 h-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round h-7 w-7 text-primary">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
        <div className="flex items-end gap-0.5 h-4">
            <span className="voice-wave-bar" style={{ animationDelay: '0s' }}></span>
            <span className="voice-wave-bar" style={{ animationDelay: '0.2s' }}></span>
            <span className="voice-wave-bar" style={{ animationDelay: '0.4s' }}></span>
        </div>
    </div>
);


export function AudioPlayer() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { firestore } = useFirebase();
  const isMobile = useIsMobile();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

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
  }, [audioData]);

  useEffect(() => {
    // Show tooltip on mobile if not interacted with yet
    if (isMobile && !userInteracted && !isLoading && audioUrl) {
      setTooltipOpen(true);
    } else {
      setTooltipOpen(false);
    }
  }, [isMobile, userInteracted, isLoading, audioUrl]);


  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (!userInteracted) {
        setUserInteracted(true);
        setTooltipOpen(false);
    }
    
    if (isPlaying) {
      audio.pause();
    } else {
      if(audio.muted) {
        audio.muted = false;
      }
      audio.play().catch(e => console.error("Erreur de lecture audio:", e));
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if(audio) {
        const handleEnded = () => setIsPlaying(false);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }
  }, [audioUrl]);


  if (!audioData?.text) {
    return null;
  }
  
  if (isLoading) {
      return (
        <Button
            variant="ghost"
            size="icon"
            disabled={true}
            className="btn-neumorphic-light dark:btn-neumorphic-dark rounded-full w-12 h-12"
        >
            <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
      )
  }

  if (!audioUrl) {
      return null;
  }
  
  return (
    <div className="flex items-center gap-2">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          hidden
          muted // Start muted for autoplay compatibility
          playsInline
        />
      )}
      <TooltipProvider>
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={isLoading || !audioUrl}
              className="btn-neumorphic-light dark:btn-neumorphic-dark rounded-full w-12 h-12"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <TalkingHeadIcon />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
