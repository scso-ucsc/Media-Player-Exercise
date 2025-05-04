// IMPORTS
import {useRef, useState, useEffect} from "react";
import data from "./data/playlists.json"; //Importing JSON data to "data" variable

// GLOBAL DECLARATIONS
const playlists: Playlist[] = data.playlists; // Playlist[] object called playlists

// TYPE DECLARATIONS
type Track = {
  name: string;
  url: string;
  duration: number;
}

type Playlist = {
  name: string;
  artist: string;
  year: number;
  tracks: Track[];
}

const formatTime = (time: number) => { // Function to format time
  if (!time || isNaN(time)){
    return "0:00";
  } else{
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}

function App() {
  const audioRef = useRef<HTMLAudioElement>(null); // useRef to reference the audio DOM element
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0); // useState creates pieces of state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Initial state is 100%
  const [progress, setProgress] = useState(0); // Progress of the audio
  const [duration, setDuration] = useState(0); // Duration of the audio

  const currentTrack = playlists[currentPlaylistIndex].tracks[currentTrackIndex];

  const play = () => { // Function to play the audio
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const pause = () => { // Function to pause the audio
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = () => { // Function to enable user toggle between play/pause
    if(isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const nextPlaylist = () => {
    setCurrentPlaylistIndex((prevIndex) => 
      (prevIndex + 1) % playlists.length); // Modulo loops back to the first playlist if met
    setCurrentTrackIndex(0); // Reset track index to 0 when changing playlists
  }

  const previousPlaylist = () => {
    setCurrentPlaylistIndex((prevIndex) =>
      (prevIndex - 1 + playlists.length) % playlists.length); // Modulo loops back to the last playlist if met
    setCurrentTrackIndex(0); // Reset track index to 0 when changing playlists
  }

  const nextTrack = () => {
    setCurrentTrackIndex((prevIndex) =>
      (prevIndex + 1) % playlists[currentPlaylistIndex].tracks.length // Modulo loops back to the first track if met
    );
  };

  const previousTrack = () => {
    setCurrentTrackIndex((prevIndex) =>
      (prevIndex - 1 + playlists[currentPlaylistIndex].tracks.length) % playlists[currentPlaylistIndex].tracks.length // Modulo loops back to the last track if met
    );
  };

  // useEffect Functions
  useEffect(() => { //This function runs whenever the currentTrackIndex
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrackIndex, currentPlaylistIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if(isPlaying) {
        audio.play();
      }
      else {
        audio.pause();
      }
    }
  }, [isPlaying]); // This function runs whenever the isPlaying changes

  useEffect(() => { // This function runs whenever the volume changes
    if (audioRef.current) {
      audioRef.current.volume = volume; // Set the volume of the audio
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        setProgress(audio.currentTime);
        setDuration(audio.duration);
      };

      audio.addEventListener('timeupdate', updateProgress); // Update the progress of the audio
      audio.addEventListener('loadmetadata', updateProgress);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadmetadata', updateProgress);
      };
    }
  }, []);

  return (
    <div className = "container">
      <div className = "album-art">
        🎵
      </div>

      <div className = "track-info">
        <h1 className = {isPlaying ? 'title-play' : 'title-paused'}>
          {currentTrack.name}
        </h1>
        <p>
          {playlists[currentPlaylistIndex].artist} •{' '}
          {playlists[currentPlaylistIndex].name} ({playlists[currentPlaylistIndex].year})
        </p>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <input
          type = "range"
          min = {0}
          max = {duration || 0}
          step = "0.01"
          value = {progress}
          onChange = {(e) => {
            const newTime = parseFloat(e.target.value);
            setProgress(newTime);
            if (audioRef.current) {
              audioRef.current.currentTime = newTime; // Set the current time of the audio
            }
          }} 
          style = {{width: '80%', maxWidth: '400px'}}
        />
        <div style = {{marginTop: '0.25rem', fontSize: '0.75rem', color: '#ccc'}}>
          {formatTime(progress)} / {formatTime(duration)}
        </div>
      </div>

      <audio
        ref={audioRef}
        onEnded={nextTrack} // When the audio ends, it will call the nextTrack function
      >
        <source src={currentTrack.url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className = "play-pause-wrapper">
        <button onClick={togglePlayPause} className = "play-pause-button">
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>

      <div className = "button-row">
        <button onClick={previousTrack} className = "button">Previous Track</button>
        <button onClick={nextTrack} className = "button">Next Track</button>
      </div>

      <div className = "button-row">
        <button onClick={previousPlaylist} className = "button">Previous Playlist</button>
        <button onClick={nextPlaylist} className = "button">Next Playlist</button>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
        <label htmlFor="volume" style = {{whiteSpace: 'nowrap'}}>🔉</label>
        <input
          id = "volume"
          type = "range"
          min = "0"
          max = "1"
          step = "0.01"
          value = {volume}
          onChange = {(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}

export default App;