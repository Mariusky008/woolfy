import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Text,
  HStack,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { FaMicrophone, FaStop, FaTrash, FaPlay, FaPause } from 'react-icons/fa';

interface MessageRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export const MessageRecorder: React.FC<MessageRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const toast = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      // Démarrer le timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      mediaRecorder.current.addEventListener('stop', () => {
        clearInterval(timer);
        stream.getTracks().forEach(track => track.stop());
      });

    } catch (error) {
      toast({
        title: "Erreur d'enregistrement",
        description: "Impossible d'accéder au microphone",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioElement.current && audioUrl) {
      audioElement.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioElement.current) {
      audioElement.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setDuration(0);
    }
  };

  return (
    <Box>
      <HStack spacing={4}>
        {!isRecording && !audioUrl && (
          <IconButton
            aria-label="Démarrer l'enregistrement"
            icon={<FaMicrophone />}
            colorScheme="red"
            onClick={startRecording}
          />
        )}
        {isRecording && (
          <IconButton
            aria-label="Arrêter l'enregistrement"
            icon={<FaStop />}
            colorScheme="red"
            onClick={stopRecording}
          />
        )}
        {audioUrl && (
          <>
            <IconButton
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
              icon={isPlaying ? <FaPause /> : <FaPlay />}
              colorScheme="purple"
              onClick={isPlaying ? pauseAudio : playAudio}
            />
            <IconButton
              aria-label="Supprimer"
              icon={<FaTrash />}
              colorScheme="red"
              variant="ghost"
              onClick={deleteRecording}
            />
          </>
        )}
        <Text>{duration}s</Text>
      </HStack>
      {isRecording && (
        <Progress
          size="xs"
          isIndeterminate
          colorScheme="red"
          mt={2}
        />
      )}
      {audioUrl && (
        <audio
          ref={audioElement}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      )}
    </Box>
  );
};

export default MessageRecorder; 