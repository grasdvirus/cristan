'use client';

import { useEffect, useRef, useState } from 'react';
import { generateAndPlayAudio } from '@/app/actions/generate-audio';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { firestore } = useFirebase();
  const isMobile = useIsMobile();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const audioDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'presentationAudio', 'main');
  }, [firestore]);

  const { data: audioData, isLoading: isAudioDataLoading } = useDoc<PresentationAudio>(audioDocRef);
  
  useEffect(() => {
    if (isMobile && !userInteracted && !isAudioDataLoading && audioData?.text) {
        setTooltipOpen(true);
    } else {
        setTooltipOpen(false);
    }
  }, [isMobile, userInteracted, isAudioDataLoading, audioData]);
  
  const togglePlay = async () => {
    if (!userInteracted) {
      setUserInteracted(true);
      setTooltipOpen(false);
    }

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    
    if (audioData?.text) {
      setIsLoading(true);
      try {
        const audioBlob = await generateAndPlayAudio(audioData.text);
        
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob);
          audioRef.current.play().catch(e => console.error("Erreur de lecture audio:", e));
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Erreur lors de la génération ou de la lecture de l'audio :", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if(audio) {
        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }
  }, [audioRef.current]);


  if (isAudioDataLoading) {
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

  if (!audioData?.text) {
      return null;
  }
  
  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} hidden playsInline />
      <TooltipProvider>
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={isLoading}
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
          </TooltipTrigger>
          <TooltipContent>
            <TalkingHeadIcon />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
