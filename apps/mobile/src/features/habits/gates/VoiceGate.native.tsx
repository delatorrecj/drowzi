import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ExpoSpeechRecognitionModule as SpeechModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { useHabitCompletion } from '@/src/features/habits/hooks/useHabitCompletion';
import { passageMatches } from '@/src/features/voice/passageMatch';
import { AppText, Button, color } from '@/src/ui';
import { Waveform } from '@/src/ui/motion';

// tsconfig moduleSuffixes (.native/.web) makes tsc resolve this package's .web
// type, which omits the native control methods. At runtime Metro loads the real
// native module — cast to the surface we actually call.
const Speech = SpeechModule as unknown as {
  start(opts: { lang?: string; interimResults?: boolean; continuous?: boolean }): void;
  stop(): void;
  abort(): void;
  requestPermissionsAsync(): Promise<{ granted: boolean }>;
};

export function VoiceGate({ alarm, onVerified }: HabitGateProps) {
  const passage = 'passageText' in alarm.habitConfig ? alarm.habitConfig.passageText : '';
  const { done, doneRef, finish } = useHabitCompletion(alarm, onVerified);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results[0]?.transcript ?? '';
    setTranscript(text);
    if (!doneRef.current && passageMatches(text, passage)) {
      Speech.stop();
      setListening(false);
      void finish();
    }
  });
  useSpeechRecognitionEvent('error', (e) => {
    setError(e.message || e.error);
    setListening(false);
  });
  useSpeechRecognitionEvent('end', () => setListening(false));

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');
    const perm = await Speech.requestPermissionsAsync();
    if (!perm.granted) {
      setError('Microphone permission denied.');
      return;
    }
    Speech.start({ lang: 'en-US', interimResults: true, continuous: true });
    setListening(true);
  }, []);

  // Stop capture if the gate unmounts mid-listen.
  useEffect(() => () => Speech.abort(), []);

  return (
    <View style={styles.wrap}>
      <AppText variant="bodyStrong" color={color.text} style={styles.copy}>
        Read your passage aloud to turn off the alarm.
      </AppText>
      {passage ? (
        <AppText variant="body" color={color.textMuted} style={styles.quote}>
          {passage}
        </AppText>
      ) : null}

      {listening ? (
        <View style={styles.listening}>
          <Waveform />
          <AppText variant="caption" color={color.textMuted}>
            Listening…
          </AppText>
        </View>
      ) : null}

      {transcript ? (
        <AppText variant="caption" color={color.textMuted} style={styles.transcript}>
          “{transcript}”
        </AppText>
      ) : null}
      {error ? (
        <AppText variant="caption" color={color.alarm} style={styles.transcript}>
          {error}
        </AppText>
      ) : null}

      <Button
        title={done ? 'Verified' : listening ? 'Listening…' : 'Start listening'}
        variant="danger"
        onPress={() => void start()}
        disabled={listening || done}
      />

      {__DEV__ ? (
        <Button
          title="Mark verified (dev)"
          variant="secondary"
          onPress={() => void finish()}
          disabled={done}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  copy: { textAlign: 'center' },
  quote: { fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 8 },
  listening: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  transcript: { textAlign: 'center' },
});
