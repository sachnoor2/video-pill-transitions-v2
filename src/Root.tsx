import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import manifest from './manifest.json';

const last = manifest.scenes[manifest.scenes.length - 1];

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Film"
      component={Film}
      durationInFrames={last.start + last.dur}
      fps={manifest.fps}
      width={manifest.width}
      height={manifest.height}
    />
  );
};
