import { useRef, useEffect } from "react";

let audioContext: AudioContext;
export const useAudio = (src?: string) => {
  const audioBufferRef = useRef<AudioBuffer>();
  const audioBufferSourceNodeRef = useRef<AudioBufferSourceNode>();
  const isPlaying = useRef(false);

  // check if audio context already exists
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (!audioBufferRef.current) {
    fetch(src)
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => {
        return audioContext.decodeAudioData(arrayBuffer);
      })
      .then((audioBuffer) => (audioBufferRef.current = audioBuffer));
  }

  //  setup window 'click' event to resume a suspended AudioContext
  const onClick = () => {
    if (audioContext?.state === 'suspended') {
      audioContext.resume();
    }
  };

  useEffect(() => {
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('click', onClick);
    };
  }, []);

  const play = () => {
    if (audioBufferRef.current == null) {
      return;
    }

    if (audioContext.state === 'suspended') {
      // we can't resume audio context in this function
      console.warn('AudioContext is suspended.');
      return;
    }

    if (audioBufferSourceNodeRef.current != null && isPlaying.current) {
      // we are already playing
      return;
    }

    // create new audio buffer source node and play!
    isPlaying.current = true;
    audioBufferSourceNodeRef.current = new AudioBufferSourceNode(audioContext, {
      buffer: audioBufferRef.current,
    });
    audioBufferSourceNodeRef.current.onended = () => {
      isPlaying.current = false;
    };
    audioBufferSourceNodeRef.current.connect(audioContext.destination);
    audioBufferSourceNodeRef.current.start(audioContext.currentTime);
  };

  const stop = () => {
    audioBufferSourceNodeRef.current?.stop();
    isPlaying.current = false;
  };

  return {
    play,
    stop,
  };
};
