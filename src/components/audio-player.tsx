'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Loader2, Play, Pause } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from '@/hooks/use-mobile';


const TalkingHeadIcon = () => (
    <div className="flex items-end gap-1 h-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round h-7 w-7 text-primary">
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useIsMobile();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    // We create the audio element and set its source.
    // This will be done only once.
    audioRef.current = new Audio('/uploads/presentations.wav');
    const audio = audioRef.current;

    const handleCanPlay = () => setCanPlay(true);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    // This is a safety check in case the file doesn't load.
    audio.addEventListener('error', () => {
        console.error("Erreur: Le fichier audio '/uploads/presentations.wav' n'a pas pu être chargé.");
        setCanPlay(false);
    });

    return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (isMobile && !userInteracted && canPlay) {
      setTooltipOpen(true);
    } else {
      setTooltipOpen(false);
    }
  }, [isMobile, userInteracted, canPlay]);
  
  const togglePlay = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      setTooltipOpen(false);
    }

    const audio = audioRef.current;
    if (!audio || !canPlay) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(e => console.error("Erreur de lecture audio:", e));
      setIsPlaying(true);
    }
  };

  if (!canPlay) {
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
  
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={!canPlay}
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
