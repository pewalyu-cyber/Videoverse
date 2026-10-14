import React from 'react';

/**
 * Headless YouTube Audio Stream Engine
 * Mounts the YouTube iframe API container invisibly in the background.
 * Completely removes any visual video element, player box, or video dock from the UI,
 * ensuring a pure, premium audio listening experience with zero cheap video artifacts.
 */
export const YouTubeVideoDock: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed -left-[9999px] -top-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden"
    >
      <div id="videoverse-yt-iframe" className="w-1 h-1" />
    </div>
  );
};
