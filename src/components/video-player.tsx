'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { NeumorphicCard } from './neumorphic-card';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string | undefined>(undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleLoadedMetadata = () => {
        setDuration(video.duration);
        // Set aspect ratio for adaptive frame
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            setAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
        }
    };
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);
  
  useEffect(() => {
    const video = videoRef.current;
    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                video?.play().catch(e => console.error("Autoplay was prevented.", e));
            } else {
                video?.pause();
            }
        },
        { threshold: 0.8 } // 80% visibility
    );

    if (video) {
        // Start muted for autoplay compatibility
        video.muted = true;
        setIsMuted(true);
        observer.observe(video);
    }

    return () => {
        if (video) {
            observer.unobserve(video);
        }
    };
  }, [src]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFs = document.fullscreenElement === containerRef.current;
      setIsFullScreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        if(video.muted) { // Unmute on first manual play
            video.muted = false;
            setIsMuted(false);
        }
        video.play();
      } else {
        video.pause();
      }
    }
  };
  
  const handleProgressChange = (value: number[]) => {
    const video = videoRef.current;
    if (video && isFinite(video.duration)) {
      video.currentTime = (value[0] / 100) * video.duration;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (video) {
        const newVolume = value[0];
        video.volume = newVolume;
        video.muted = newVolume === 0;
    }
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
        video.muted = !video.muted;
    }
  };

  const toggleFullScreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullScreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <NeumorphicCard
      ref={containerRef}
      className={cn(
        "group w-full relative overflow-hidden p-0",
        isFullScreen && "fixed inset-0 z-[100] !rounded-none"
      )}
      style={{ aspectRatio }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain rounded-3xl"
        poster={poster}
        onClick={togglePlay}
        onDoubleClick={toggleFullScreen}
        playsInline
        loop
      >
        <source src={src} type="video/mp4" />
        Votre navigateur ne supporte pas la balise vidéo.
      </video>

      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none rounded-3xl">
        {!isPlaying && (
          <Button
            size="icon"
            variant="ghost"
            className="w-20 h-20 bg-white/20 hover:bg-white/30 text-white pointer-events-auto rounded-full"
            onClick={togglePlay}
          >
            <Play className="w-12 h-12 fill-white" />
          </Button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-3xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-mono">{formatTime(videoRef.current?.currentTime || 0)}</span>
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              className="w-full"
            />
            <span className="text-white text-xs font-mono">{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <Button onClick={togglePlay} size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-full">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <div className="flex items-center gap-2 w-32">
              <Button onClick={toggleMute} size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-full">
                <VolumeIcon className="w-6 h-6" />
              </Button>
              <Slider value={[isMuted ? 0 : volume]} max={1} step={0.05} onValueChange={handleVolumeChange}/>
            </div>
            
            <Button onClick={toggleFullScreen} size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-full">
              {isFullScreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>
    </NeumorphicCard>
  );
}
