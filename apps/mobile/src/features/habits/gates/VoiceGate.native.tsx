import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ExpoSpeechRecognitionModule as SpeechModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { useHabitCompletion } from '@/src/features/habits/hooks/useHabitCompletion';
import { passageMatches } from '@/src/features/voice/passageMatch';
import { fonts } from '@/src/shared/theme';

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
      <Text style={styles.copy}>Read your passage aloud to turn off the alarm.</Text>
      {passage ? <Text style={styles.quote}>{passage}</Text> : null}

      {transcript ? <Text style={styles.transcript}>“{transcript}”</Text> : null}
      {error ? <Text style={styles.warn}>{error}</Text> : null}

      <Pressable
        style={[styles.primary, (listening || done) && styles.primaryMuted]}
        onPress={() => void start()}
        disabled={listening || done}>
        <Text style={styles.primaryLabel}>
          {done ? 'Verified' : listening ? 'Listening…' : 'Start listening'}
        </Text>
      </Pressable>

      <Pressable style={styles.demo} onPress={() => void finish()} disabled={done}>
        <Text style={styles.demoLabel}>Mark verified (dev)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  copy: {
    fontSize: 17,
    fontFamily: fonts.bodySemiBold,
    color: '#654321',
    textAlign: 'center',
  },
  quote: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
    color: '#654321',
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  transcript: {
    fontSize: 14,
    color: '#654321',
    opacity: 0.85,
    textAlign: 'center',
  },
  warn: { fontSize: 13, color: '#B23A48', textAlign: 'center' },
  primary: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#E63946',
    alignItems: 'center',
  },
  primaryMuted: { opacity: 0.6 },
  primaryLabel: { color: '#fff', fontSize: 16, fontFamily: fonts.bodyBold },
  demo: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4C430',
    alignItems: 'center',
  },
  demoLabel: { fontWeight: '700', color: '#654321' },
});
