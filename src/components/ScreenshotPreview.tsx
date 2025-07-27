import type React from "react";

interface ScreenshotPreviewProps {
  screenshotDataUrl: string | null;
  onDownloadScreenshot: () => void;
}

const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
  screenshotDataUrl,
  onDownloadScreenshot,
}) => {
  if (!screenshotDataUrl) return null;

  return (
    <div className="p-4 bg-zinc-900 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-xl text-center w-64 border border-zinc-700">
      <h2 className="text-base font-bold mb-3 text-sky-300">Screenshot</h2>
      <img
        src={screenshotDataUrl || "/placeholder.svg"}
        alt="Screenshot"
        className="max-w-full h-auto rounded-md mb-3 border border-zinc-700 shadow-md mx-auto"
      />
      <button
        onClick={onDownloadScreenshot}
        className="px-4 py-1.5 bg-green-600 rounded-md hover:bg-green-700 text-white text-sm font-semibold shadow-md transition-colors duration-200 transform hover:scale-105"
      >
        Download
      </button>
    </div>
  );
};

export default ScreenshotPreview;
