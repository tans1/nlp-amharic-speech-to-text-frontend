import { useEffect, useState } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import './App.css';
import ReactAudioPlayer from 'react-audio-player';


function App() {
  const recorderControls = useAudioRecorder();

  const [audioUrl, setAudioUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (recorderControls.isRecording && recorderControls.recordingTime >= 10) {
      recorderControls.stopRecording();
    }
  }, [recorderControls.isRecording, recorderControls.recordingTime, recorderControls]);

  useEffect(() => {
    if (recorderControls.recordingBlob) {
      const url = URL.createObjectURL(recorderControls.recordingBlob);
      setAudioUrl(url);

      handleUpload(recorderControls.recordingBlob);
    }
  }, [recorderControls.recordingBlob]);

  const startRecording = () => {
    setStatusMessage('');
    setAudioUrl(null);
    recorderControls.startRecording();
  };

  const stopRecording = () => {
    if (recorderControls.isRecording) {
      recorderControls.stopRecording();
    }
  };

  const handleUpload = async (blob) => {
    setUploading(true);
    setStatusMessage('Uploading audio...');

    try {
      const formData = new FormData();
      formData.append('file', blob, 'recording.wav');

      const response = await fetch('http://localhost:8080', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setStatusMessage('Uploaded successfully!');
    } catch (error) {
      setStatusMessage('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h1>Audio Recorder</h1>

      <div className="recorder-controls">
        <button onClick={startRecording} disabled={recorderControls.isRecording}>
          Record
        </button>
        <button onClick={stopRecording} disabled={!recorderControls.isRecording}>
          Stop
        </button>
      </div>

      {recorderControls.isRecording && (
        <div className="timer">Recording: {recorderControls.recordingTime}s</div>
      )}

      {audioUrl && (
        <div className="audio-preview">
          <ReactAudioPlayer
            src={audioUrl}
            controls
          />
        </div>
      )}

      {uploading && <p className="uploading">{statusMessage}</p>}
      {!uploading && statusMessage && <p className="status">{statusMessage}</p>}
    </div>
  );
}

export default App;
