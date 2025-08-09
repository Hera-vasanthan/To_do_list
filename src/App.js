const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

const AI_API_URL = 'https://your-company-ai-api/transcribe'; // Replace this
const AI_API_KEY = 'your_api_key_here'; // Replace this

app.post('/transcribe', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video uploaded' });

    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);

    const response = await axios.post(
      AI_API_URL,
      fileStream,
      {
        headers: {
          'Content-Type': req.file.mimetype,
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    fs.unlinkSync(filePath);

    res.json({ transcript: response.data.transcript || 'No transcript from AI' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to transcribe', details: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
    setTranscript('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      alert('Please select a video file');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const res = await axios.post('http://localhost:5000/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTranscript(res.data.transcript);
    } catch (err) {
      alert('Error during transcription');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto', fontFamily: 'Arial' }}>
      <h2>Video Transcription</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Transcribing...' : 'Transcribe Video'}
        </button>
      </form>
      {transcript && (
        <div style={{ marginTop: 20, backgroundColor: '#f0f0f0', padding: 15 }}>
          <h3>Transcript:</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{transcript}</p>
        </div>
      )}
    </div>
  );
  }
app.get('/transcripts/:filename', (req, res) => {
  const filename = req.params.filename;
  const transcriptPath = path.join(__dirname, 'transcripts', filename);

  if (fs.existsSync(transcriptPath)) {
    res.download(transcriptPath, filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Could not download file');
      }
    });
  } else {
    res.status(404).send('File not found');
  }
});

const [downloadFile, setDownloadFile] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!videoFile) return alert('Please select a video file');

  setLoading(true);
  setTranscript('');
  setDownloadFile('');

  const formData = new FormData();
  formData.append('video', videoFile);

  try {
    const res = await axios.post('http://localhost:5000/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setTranscript(res.data.transcript);
    setDownloadFile(res.data.transcriptFileName);  // save filename for download
  } catch (err) {
    alert('Error during transcription');
    console.error(err);
  }
  setLoading(false);
};
{downloadFile && (
  <a
    href={`http://localhost:5000/transcripts/${downloadFile}`}
    download={downloadFile}
    style={{
      display: 'inline-block',
      marginTop: 15,
      padding: '8px 12px',
      backgroundColor: '#007bff',
      color: '#fff',
      textDecoration: 'none',
      borderRadius: 4,
    }}
  >
    Download Transcript
  </a>
)}
