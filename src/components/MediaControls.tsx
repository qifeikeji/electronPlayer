import type React from "react";
import { formatTime } from "../utils/formatTime";
import {
  PreviousIcon,
  RewindIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  NextIcon,
  VolumeIcon,
  MuteIcon,
  CameraIcon,
  FullScreenIcon, // Added FullScreenIcon
  MinimizeScreenIcon, // Added MinimizeScreenIcon
} from "./Icons";

interface MediaControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isAudio: boolean;
  isPlayerFullScreen: boolean; // New prop for full screen state
  onTogglePlayPause: () => void;
  onSkip: (seconds: number) => void;
  onSeek: (value: number) => void;
  onChangeVolume: (value: number) => void;
  onToggleMute: () => void;
  onPlayPrevious: () => void;
  onPlayNext: () => void;
  onTakeScreenshot: () => void;
  onToggleFullScreen: () => void; // New prop for full screen toggle
}

const MediaControls: React.FC<MediaControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  canGoPrevious,
  canGoNext,
  isAudio,
  isPlayerFullScreen, // Destructure new prop
  onTogglePlayPause,
  onSkip,
  onSeek,
  onChangeVolume,
  onToggleMute,
  onPlayPrevious,
  onPlayNext,
  onTakeScreenshot,
  onToggleFullScreen, // Destructure new prop
}) => {
  const buttonClass =
    "p-1.5 rounded-full text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";
  const primaryButtonClass =
    "p-2 rounded-full bg-sky-600 text-white hover:bg-sky-700 shadow-md transition-colors transform hover:scale-105";
  const iconClass = "w-4 h-4";
  const primaryIconClass = "w-5 h-5";

  return (
    <div className="flex flex-col p-2 bg-zinc-900 bg-opacity-80 backdrop-blur-sm w-full">
      {/* Progress Bar */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={(e) => onSeek(Number.parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-sky-500 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-sky-500 [&::-moz-range-thumb]:shadow-sm"
        aria-label="Seek media"
      />

      {/* All Controls on one line */}
      <div className="flex items-center justify-between mt-1">
        {/* Left side: Current Time */}
        <span className="text-xs text-zinc-400 font-mono">
          {formatTime(currentTime)}
        </span>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPlayPrevious}
            disabled={!canGoPrevious}
            className={buttonClass}
            aria-label="Previous"
          >
            <PreviousIcon className={iconClass} />
          </button>

          <button
            onClick={() => onSkip(-10)}
            className={buttonClass}
            aria-label="Rewind 10 seconds"
          >
            <RewindIcon className={iconClass} />
          </button>

          <button
            onClick={onTogglePlayPause}
            className={primaryButtonClass}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PauseIcon className={primaryIconClass} />
            ) : (
              <PlayIcon className={primaryIconClass} />
            )}
          </button>

          <button
            onClick={() => onSkip(10)}
            className={buttonClass}
            aria-label="Forward 10 seconds"
          >
            <ForwardIcon className={iconClass} />
          </button>

          <button
            onClick={onPlayNext}
            disabled={!canGoNext}
            className={buttonClass}
            aria-label="Next"
          >
            <NextIcon className={iconClass} />
          </button>
        </div>

        {/* Right side: Volume, Screenshot, Duration, Full Screen */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 w-24">
            <button
              onClick={onToggleMute}
              className={buttonClass}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <MuteIcon className={iconClass} />
              ) : (
                <VolumeIcon className={iconClass} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) =>
                onChangeVolume(Number.parseFloat(e.target.value))
              }
              className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-sky-500 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-sky-500 [&::-moz-range-thumb]:shadow-sm"
              aria-label="Volume control"
            />
          </div>
          <button
            onClick={onTakeScreenshot}
            className="p-1.5 rounded-full bg-purple-700 text-white hover:bg-purple-800 shadow-md transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={isAudio}
            aria-label="Take Screenshot"
          >
            <CameraIcon className={iconClass} />
          </button>
          <span className="text-xs text-zinc-400 font-mono">
            {formatTime(duration)}
          </span>
          <button
            onClick={onToggleFullScreen}
            className={buttonClass}
            aria-label={
              isPlayerFullScreen ? "Exit full screen" : "Enter full screen"
            }
          >
            {isPlayerFullScreen ? (
              <MinimizeScreenIcon className={iconClass} />
            ) : (
              <FullScreenIcon className={iconClass} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaControls;
