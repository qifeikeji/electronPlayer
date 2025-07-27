# Electron Video Player

A modern, feature-rich media player built with Electron, and React, designed for a smooth desktop video and audio playback experience.

## Description

This application provides a robust media playback solution, focusing on intuitive user interaction and a streamlined interface. It supports a variety of video and audio formats, enabling users to control their media effortlessly through on-screen controls and keyboard shortcuts. The UI dynamically appears and disappears based on user activity, ensuring an immersive viewing experience. The player includes essential features such as play/pause, seeking, volume control (with mute), playlist navigation, full-screen mode, and a screenshot utility for videos. It also intelligently saves playback progress and user settings to local storage, ensuring a consistent experience across sessions.

## Features

*   **Media Playback:** Supports common video (MP4, WebM, Ogg) and audio (MP3, WAV, AAC, FLAC, Ogg) formats.
*   **Intuitive Controls:**
    *   Play/Pause, Rewind/Forward (10 seconds).
    *   Next/Previous track in a playlist.
    *   Volume control with mute/unmute functionality.
    *   Seek bar for precise navigation.
*   **Dynamic UI:** Media controls and header appear only on hover over the bottom of the player, providing an uncluttered viewing experience.
*   **Full-Screen Mode:** Toggle full-screen playback for an immersive view.
*   **Screenshot Capture:** Take screenshots of video frames (not available for audio).
*   **Playlist Management:** Open individual files or entire folders to create and manage playlists.
*   **Persistence:** Saves volume, mute status, current playlist, and last played position to local storage.
*   **Keyboard Shortcuts:** Comprehensive shortcuts for all media controls (Space for play/pause, Arrow keys for seek/volume, 'm' for mute, 's' for screenshot, 'p' for previous, 'n' for next, 'f' for full screen).
*   **Custom Application Icon:** A custom icon for a native desktop application feel.

## Technologies Used

*   **Electron:** For building cross-platform desktop applications.
*   **React:** For building interactive UI components.
*   **Tailwind CSS:** For utility-first styling.

## Getting Started

To run this application locally, follow these steps:

1.  **Clone the repository:**
    \`\`\`bash
    git clone <your-repository-url>
    cd electron-player
    \`\`\`
2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`
3.  **Run the application in development mode:**
    \`\`\`bash
    npm run start
    # or
    yarn dev
    \`\`\`
    This will start the Vite development server and then launch the Electron application.

4.  **Build for production (optional):**
    \`\`\`bash
    npm run electron:build
    # or
    yarn build
    \`\`\`
    This will create a production-ready build of your Electron application in the `dist` directory.

## Usage

*   **Open File/Folder:** Use the `File` menu in the application's menu bar to open individual media files or entire folders to create a playlist.
*   **Playback:** Use the on-screen controls or keyboard shortcuts to manage playback.
*   **Hover for Controls:** Move your mouse to the bottom of the player area to reveal the media controls.
*   **Full Screen:** Double-click the video area or press `F` to toggle full-screen mode.
*   **Screenshot:** Press `S` or click the camera icon to take a screenshot of the current video frame.
