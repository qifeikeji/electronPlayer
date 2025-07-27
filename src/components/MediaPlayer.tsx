import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { AudioIcon, NoMediaIcon } from "./Icons"; // Removed FullScreenIcon, MinimizeScreenIcon

interface MediaPlayerProps {
  src: string | null;
  isAudio: boolean;
  volume: number;
  isMuted: boolean;
  onLoadedMetadata: (duration: number) => void;
  onTimeUpdate: (currentTime: number) => void;
  onVolumeChange: (volume: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onTogglePlayPause: () => void; // Still needed for click-to-play/pause on video element
}

export interface MediaPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoElement: () => HTMLVideoElement | null;
}

const MediaPlayer = forwardRef<MediaPlayerRef, MediaPlayerProps>(
  (
    {
      src,
      isAudio,
      volume,
      isMuted,
      onLoadedMetadata,
      onTimeUpdate,
      onVolumeChange,
      onPlay,
      onPause,
      onEnded,
      onTogglePlayPause,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      play: () =>
        videoRef.current?.play().catch((e) => console.error("Play error:", e)),
      pause: () => videoRef.current?.pause(),
      seek: (time: number) => {
        if (videoRef.current) videoRef.current.currentTime = time;
      },
      setVolume: (vol: number) => {
        if (videoRef.current) videoRef.current.volume = vol;
      },
      getCurrentTime: () => videoRef.current?.currentTime || 0,
      getDuration: () => videoRef.current?.duration || 0,
      getVideoElement: () => videoRef.current,
    }));

    useEffect(() => {
      if (videoRef.current && src) {
        videoRef.current.src = src;
        videoRef.current.load();
        videoRef.current.volume = volume;
        videoRef.current.muted = isMuted;
        videoRef.current
          .play()
          .catch((e) => console.error("Playback error:", e));
      }
    }, [src]);

    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.volume = volume;
        videoRef.current.muted = isMuted;
      }
    }, [volume, isMuted]);

    const handleLoadedMetadata = () => {
      if (videoRef.current) onLoadedMetadata(videoRef.current.duration);
    };
    const handleTimeUpdate = () => {
      if (videoRef.current) onTimeUpdate(videoRef.current.currentTime);
    };
    const handleVolumeChange = () => {
      if (videoRef.current) onVolumeChange(videoRef.current.volume);
    };

    const fileName = src ? src.split("/").pop() : "No media selected";

    return (
      <div className="relative w-full flex-grow bg-black overflow-hidden flex items-center justify-center">
        {src ? (
          isAudio ? (
            <div className="flex flex-col items-center justify-center w-full h-full bg-zinc-800 text-zinc-400 text-2xl p-4">
              <AudioIcon className="mb-6 text-teal-400 w-24 h-24" />
              <p className="text-xl font-semibold text-zinc-200">
                Audio Playback
              </p>
              <p className="text-base mt-2 text-center px-4 break-all text-zinc-400">
                {fileName}
              </p>
              <video
                ref={videoRef}
                className="hidden"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onVolumeChange={handleVolumeChange}
                onPlay={onPlay}
                onPause={onPause}
                onEnded={onEnded}
                muted={isMuted}
              />
            </div>
          ) : (
            <div
              className="relative w-full h-full flex items-center justify-center bg-black"
              onClick={onTogglePlayPause}
              // Double click for full screen is still handled here
              onDoubleClick={() => window.electronAPI?.toggleFullScreen()}
            >
              <video
                ref={videoRef}
                width="100%"
                height="100%"
                className="object-contain"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onVolumeChange={handleVolumeChange}
                onPlay={onPlay}
                onPause={onPause}
                onEnded={onEnded}
                muted={isMuted}
              />
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-zinc-800 text-zinc-400 text-2xl p-4">
            <NoMediaIcon className="mb-6 text-sky-400 w-24 h-24" />
            <p className="text-xl font-semibold text-zinc-200">
              No media selected
            </p>
            <p className="text-base mt-2 text-center">
              Select a file from{" "}
              <span className="font-medium text-sky-300">File → Open File</span>{" "}
              or a folder from{" "}
              <span className="font-medium text-sky-300">
                File → Open Folder
              </span>
            </p>
          </div>
        )}
      </div>
    );
  }
);

MediaPlayer.displayName = "MediaPlayer";

export default MediaPlayer;
