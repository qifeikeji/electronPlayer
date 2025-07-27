import type React from "react";

import { useEffect, useRef, useState, useCallback } from "react";
import MediaPlayer, { type MediaPlayerRef } from "./components/MediaPlayer";
import MediaControls from "./components/MediaControls";
import ScreenshotPreview from "./components/ScreenshotPreview";

declare global {
  interface Window {
    electronAPI: {
      onMediaSelected: (callback: (paths: string[]) => void) => void;
      toggleFullScreen: () => Promise<boolean>;
      isFullScreen: () => Promise<boolean>;
    };
  }
}

function App() {
  const mediaPlayerRef = useRef<MediaPlayerRef>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null); // Ref for the main app container

  // Initialize states from localStorage
  const [currentMediaSrc, setCurrentMediaSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedVolume = localStorage.getItem("volume");
      return savedVolume ? Number(savedVolume) : 0.5;
    }
    return 0.5;
  });
  const [lastVolume, setLastVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedLastVolume = localStorage.getItem("lastVolume");
      return savedLastVolume ? Number(savedLastVolume) : 0.5;
    }
    return 0.5;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedMuted = localStorage.getItem("isMuted");
      return savedMuted === "true";
    }
    return false;
  });
  const [playlist, setPlaylist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedPlaylist = localStorage.getItem("playlist");
      return savedPlaylist ? JSON.parse(savedPlaylist) : [];
    }
    return [];
  });
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedIndex = localStorage.getItem("currentFileIndex");
      return savedIndex ? Number(savedIndex) : -1;
    }
    return -1;
  });
  const [lastPlayedSrc, setLastPlayedSrc] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lastPlayedSrc") || null;
    }
    return null;
  });
  const [lastPlayedTime, setLastPlayedTime] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("lastPlayedTime") || "0");
    }
    return 0;
  });

  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(
    null
  );
  const [controlsVisible, setControlsVisible] = useState(false); // State for dynamic controls visibility
  const controlsHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlayerFullScreen, setIsPlayerFullScreen] = useState(false); // State for full screen
  const [isAudio, setIsAudio] = useState(false); // Declare isAudio state

  // Control Handlers
  const handleTogglePlayPause = useCallback(() => {
    if (mediaPlayerRef.current) {
      if (isPlaying) {
        mediaPlayerRef.current.pause();
      } else {
        mediaPlayerRef.current.play();
      }
    }
  }, [isPlaying]);

  const handleSkip = useCallback((seconds: number) => {
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.seek(
        mediaPlayerRef.current.getCurrentTime() + seconds
      );
    }
  }, []);

  const handleSeek = useCallback((value: number) => {
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.seek(value);
    }
  }, []);

  const handleChangeVolume = useCallback(
    (value: number) => {
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.setVolume(value);
        if (value > 0) {
          setLastVolume(value); // Update last non-zero volume
        }
        setIsMuted(value === 0); // Mute if volume is 0
      }
      setVolume(value);
    },
    [setLastVolume]
  );

  const handleToggleMute = useCallback(() => {
    if (mediaPlayerRef.current) {
      const newMutedState = !isMuted;
      if (newMutedState) {
        // Muting: set volume to 0
        mediaPlayerRef.current.setVolume(0);
        setVolume(0);
      } else {
        // Unmuting: restore last non-zero volume, or default to 0.5
        const restoreVolume = lastVolume > 0 ? lastVolume : 0.5;
        mediaPlayerRef.current.setVolume(restoreVolume);
        setVolume(restoreVolume);
      }
      setIsMuted(newMutedState);
    }
  }, [isMuted, lastVolume]);

  const handlePlayPrevious = useCallback(() => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  }, [currentFileIndex]);

  const handlePlayNext = useCallback(() => {
    if (currentFileIndex < playlist.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    } else if (playlist.length > 0) {
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.pause();
        mediaPlayerRef.current.seek(0);
      }
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentFileIndex, playlist.length]);

  const handleTakeScreenshot = useCallback(() => {
    if (mediaPlayerRef.current && canvasRef.current && !isAudio) {
      const video = mediaPlayerRef.current.getVideoElement();
      const canvas = canvasRef.current;
      if (video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/png");
          setScreenshotDataUrl(dataUrl);
        }
      }
    }
  }, [isAudio]);

  const handleDownloadScreenshot = useCallback(() => {
    if (screenshotDataUrl) {
      const a = document.createElement("a");
      a.href = screenshotDataUrl;
      a.download = `screenshot-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [screenshotDataUrl]);

  const handleToggleFullScreen = useCallback(async () => {
    if (!currentMediaSrc) {
      // Prevent full screen if no media is playing
      console.log("Cannot go full screen: No media is playing.");
      return;
    }
    if (window.electronAPI?.toggleFullScreen) {
      const newFsState = await window.electronAPI.toggleFullScreen();
      setIsPlayerFullScreen(newFsState);
    }
  }, [currentMediaSrc]);

  // IPC handler for media selection from Electron
  useEffect(() => {
    window.electronAPI?.onMediaSelected((paths) => {
      console.log("Paths from IPC:", paths);
      const fixedPaths = paths.map((p) => `file:///${p.replace(/\\/g, "/")}`);
      setPlaylist(fixedPaths);
      setCurrentFileIndex(0);
      setScreenshotDataUrl(null);
    });
  }, []);

  // Effect to update current media when playlist or index changes
  useEffect(() => {
    if (
      playlist.length > 0 &&
      currentFileIndex >= 0 &&
      currentFileIndex < playlist.length
    ) {
      const newSrc = playlist[currentFileIndex];
      if (newSrc !== currentMediaSrc) {
        setCurrentMediaSrc(newSrc);
        const isAudioFile = /\.(mp3|wav|aac|flac|ogg)$/i.test(newSrc);
        setIsAudio(isAudioFile); // Use setIsAudio to update isAudio state
        setCurrentTime(0);
        setDuration(0);
      }
    } else {
      // If no media is selected or playlist is empty, clear states and exit full screen
      if (
        currentMediaSrc !== null ||
        isAudio !== false ||
        currentTime !== 0 ||
        duration !== 0 ||
        isPlaying !== false
      ) {
        setCurrentMediaSrc(null);
        setIsAudio(false); // Use setIsAudio to update isAudio state
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
      }
      if (isPlayerFullScreen) {
        // Exit full screen if no media is playing
        handleToggleFullScreen();
      }
    }
  }, [
    playlist,
    currentFileIndex,
    currentMediaSrc,
    isAudio,
    currentTime,
    duration,
    isPlaying,
    isPlayerFullScreen,
    handleToggleFullScreen,
  ]);

  // Media Player Callbacks
  const handleLoadedMetadata = useCallback((newDuration: number) => {
    setDuration(newDuration);
  }, []);

  const handleTimeUpdate = useCallback((newTime: number) => {
    setCurrentTime(newTime);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0); // Sync mute state with actual volume
    if (newVolume > 0) {
      setLastVolume(newVolume); // Update last non-zero volume
    }
  }, []);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    handlePlayNext();
  }, [handlePlayNext]);

  // Dynamic Controls Visibility (Hover/Activity)
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const container = appContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseY = event.clientY - rect.top; // Mouse Y relative to container
      const containerHeight = rect.height;

      const hotZoneHeight = 100; // Define the height of the hover zone at the bottom

      const isInHotZone = mouseY > containerHeight - hotZoneHeight;

      if (isInHotZone || !isPlaying) {
        // Always show if paused or no media
        if (controlsHideTimeoutRef.current) {
          clearTimeout(controlsHideTimeoutRef.current);
        }
        setControlsVisible(true);
        if (isPlaying) {
          // Only hide automatically if playing
          controlsHideTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
          }, 3000);
        }
      } else {
        // If mouse is outside hot zone and playing, hide controls
        if (isPlaying && controlsVisible) {
          setControlsVisible(false);
        }
      }
    },
    [isPlaying, controlsVisible]
  );

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      // Only hide if playing
      setControlsVisible(false);
      if (controlsHideTimeoutRef.current) {
        clearTimeout(controlsHideTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const container = appContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove as any); // Cast to any to satisfy event type
      container.addEventListener("mouseleave", handleMouseLeave);
      // Show controls initially if paused or no media
      if (!isPlaying || !currentMediaSrc) {
        setControlsVisible(true);
      }
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove as any);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (controlsHideTimeoutRef.current) {
        clearTimeout(controlsHideTimeoutRef.current);
      }
    };
  }, [isPlaying, currentMediaSrc, handleMouseMove, handleMouseLeave]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentMediaSrc) return; // Only enable shortcuts if media is loaded

      switch (event.key) {
        case " ": // Spacebar for play/pause
          event.preventDefault(); // Prevent scrolling
          handleTogglePlayPause();
          break;
        case "ArrowLeft": // Left arrow for rewind
          event.preventDefault();
          handleSkip(-10);
          break;
        case "ArrowRight": // Right arrow for forward
          event.preventDefault();
          handleSkip(10);
          break;
        case "ArrowUp": // Up arrow for volume up
          event.preventDefault();
          handleChangeVolume(Math.min(1, volume + 0.05));
          break;
        case "ArrowDown": // Down arrow for volume down
          event.preventDefault();
          handleChangeVolume(Math.max(0, volume - 0.05));
          break;
        case "m": // 'm' for mute/unmute
          event.preventDefault();
          handleToggleMute();
          break;
        case "s": // 's' for screenshot
          if (!isAudio) {
            event.preventDefault();
            handleTakeScreenshot();
          }
          break;
        case "p": // 'p' for previous
          event.preventDefault();
          handlePlayPrevious();
          break;
        case "n": // 'n' for next
          event.preventDefault();
          handlePlayNext();
          break;
        case "f": // 'f' for full screen
          event.preventDefault();
          handleToggleFullScreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentMediaSrc,
    handleTogglePlayPause,
    handleSkip,
    handleChangeVolume,
    handleToggleMute,
    handleTakeScreenshot,
    handlePlayPrevious,
    handlePlayNext,
    isAudio,
    volume,
    handleToggleFullScreen,
  ]);

  // --- Local Storage Effects ---

  // Effect to save volume and mute state
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("volume", volume.toString());
      localStorage.setItem("lastVolume", lastVolume.toString());
      localStorage.setItem("isMuted", isMuted.toString());
    }
  }, [volume, lastVolume, isMuted]);

  // Effect to save playlist and current index
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("playlist", JSON.stringify(playlist));
      localStorage.setItem("currentFileIndex", currentFileIndex.toString());
    }
  }, [playlist, currentFileIndex]);

  // Effect to save current playback position before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (typeof window !== "undefined" && currentMediaSrc) {
        localStorage.setItem("lastPlayedSrc", currentMediaSrc);
        localStorage.setItem("lastPlayedTime", currentTime.toString());
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentMediaSrc, currentTime]);

  // Effect to restore playback position when media loads
  useEffect(() => {
    if (currentMediaSrc && duration > 0 && mediaPlayerRef.current) {
      if (
        currentMediaSrc === lastPlayedSrc &&
        lastPlayedTime > 0 &&
        lastPlayedTime < duration
      ) {
        mediaPlayerRef.current.seek(lastPlayedTime);
        // Clear last played state after seeking to prevent seeking again if user navigates away and back
        setLastPlayedTime(0);
        setLastPlayedSrc(null);
      }
    }
  }, [currentMediaSrc, duration, lastPlayedSrc, lastPlayedTime]);

  return (
    <div
      ref={appContainerRef}
      className="relative flex flex-col items-center w-screen h-screen overflow-hidden bg-black text-white"
    >
      <MediaPlayer
        ref={mediaPlayerRef}
        src={currentMediaSrc}
        isAudio={isAudio}
        volume={volume}
        isMuted={isMuted}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={handleVolumeChange}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onTogglePlayPause={handleTogglePlayPause}
      />

      {/* Media Controls (conditionally visible) */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {currentMediaSrc && (
          <MediaControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            canGoPrevious={currentFileIndex > 0}
            canGoNext={currentFileIndex < playlist.length - 1}
            isAudio={isAudio}
            isPlayerFullScreen={isPlayerFullScreen}
            onTogglePlayPause={handleTogglePlayPause}
            onSkip={handleSkip}
            onSeek={handleSeek}
            onChangeVolume={handleChangeVolume}
            onToggleMute={handleToggleMute}
            onPlayPrevious={handlePlayPrevious}
            onPlayNext={handlePlayNext}
            onTakeScreenshot={handleTakeScreenshot}
            onToggleFullScreen={handleToggleFullScreen}
          />
        )}
      </div>

      {/* Screenshot Preview (conditionally visible, appears above controls) */}
      <div
        className={`absolute bottom-20 right-4 z-30 transition-opacity duration-300 ${
          screenshotDataUrl && controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <ScreenshotPreview
          screenshotDataUrl={screenshotDataUrl}
          onDownloadScreenshot={handleDownloadScreenshot}
        />
      </div>

      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}

export default App;
