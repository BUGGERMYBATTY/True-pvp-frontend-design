import React from 'react';

const audioCache: { [key: string]: HTMLAudioElement } = {};
let isMuted = localStorage.getItem('isMuted') === 'true';

const preloadSounds = () => {
  const sounds = [
    'uiClick', 'matchFound', 'roundStart', 
    'paddleHit', 'wallHit', 'score', 
    'explosion', 'roundWin',
    'gameWin', 'gameLose', 'draw'
  ];
  sounds.forEach(sound => {
    if (!audioCache[sound]) {
      // Assuming .wav for consistency, adjust if different formats are used
      audioCache[sound] = new Audio(`/sounds/${sound}.wav`);
    }
  });
};

// Preload sounds when the module is first loaded
preloadSounds();

export const playSound = (sound: string, volume = 1.0) => {
  if (isMuted) return;
  
  const audio = audioCache[sound];
  if (!audio) {
    console.warn(`Sound not found in cache: ${sound}`);
    return;
  }
  
  audio.volume = volume;
  // Rewind to the start. This allows the sound to be played again even if it's already playing.
  audio.currentTime = 0; 
  audio.play().catch(error => console.error(`Error playing sound "${sound}":`, error));
};

export const toggleMute = (): boolean => {
  isMuted = !isMuted;
  localStorage.setItem('isMuted', String(isMuted));
  return isMuted;
};

export const getMuteState = (): boolean => {
  return isMuted;
};
