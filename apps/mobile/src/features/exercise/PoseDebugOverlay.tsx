import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import type { ExerciseDebug } from '@/src/features/exercise/detectorTypes';
import { BLAZEPOSE, landmarkScore, type PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import type { PosePoint } from '@/src/features/pushup/poseTypes';

const B = BLAZEPOSE;
/** BlazePose skeleton bones (index pairs) — torso, arms, legs. */
const BONES: [number, number][] = [
  [B.leftShoulder, B.rightShoulder],
  [B.leftShoulder, B.leftHip],
  [B.rightShoulder, B.rightHip],
  [B.leftHip, B.rightHip],
  [B.leftShoulder, B.leftElbow],
  [B.leftElbow, B.leftWrist],
  [B.rightShoulder, B.rightElbow],
  [B.rightElbow, B.rightWrist],
  [B.leftHip, B.leftKnee],
  [B.leftKnee, B.leftAnkle],
  [B.leftAnkle, B.leftFootIndex],
  [B.rightHip, B.rightKnee],
  [B.rightKnee, B.rightAnkle],
  [B.rightAnkle, B.rightFootIndex],
];

type Props = {
  landmarks: PoseLandmarks33 | null;
  debug: ExerciseDebug | null;
  trackingLost: boolean;
};

/**
 * Debug-only overlay: draws every landmark as a dot, highlights the joints the
 * detector is measuring this frame, and shows the live metric vs the active/rest
 * thresholds so you can see exactly why a rep does or doesn't count.
 * Coords are MediaPipe-normalized (0..1), scaled to the measured box size.
 * ponytail: plain Views instead of react-native-svg — no new native dep.
 */
export function PoseDebugOverlay({ landmarks, debug, trackingLost }: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) =>
    setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const chain = debug?.chain ?? null;
  const metricText =
    debug && debug.metric !== null ? `${Math.round(debug.metric)}${debug.unit}` : '—';
  const pct = Math.round((debug?.repProgress ?? 0) * 100);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={onLayout}>
      {box.w > 0 && landmarks
        ? BONES.map(([ai, bi], i) => {
            const a = landmarks[ai];
            const b = landmarks[bi];
            if (!a || !b || landmarkScore(a) < 0.3 || landmarkScore(b) < 0.3) return null;
            return <Segment key={`bone-${i}`} a={a} b={b} w={box.w} h={box.h} color="rgba(255,255,255,0.45)" thickness={2} />;
          })
        : null}

      {box.w > 0 && landmarks
        ? landmarks.map((pt, i) => {
            if (!pt || landmarkScore(pt) < 0.3) return null;
            const inChain = chain?.some((c) => c === pt) ?? false;
            return (
              <Dot
                key={i}
                pt={pt}
                w={box.w}
                h={box.h}
                r={inChain ? 6 : 3}
                color={inChain ? '#00E5FF' : 'rgba(255,255,255,0.5)'}
              />
            );
          })
        : null}

      {box.w > 0 && chain && chain.length >= 3 ? (
        <>
          <Segment a={chain[0]} b={chain[1]} w={box.w} h={box.h} />
          <Segment a={chain[1]} b={chain[2]} w={box.w} h={box.h} />
        </>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.line}>
          {debug?.metricLabel ?? 'metric'}: <Text style={styles.val}>{metricText}</Text>
        </Text>
        <Text style={styles.line}>phase: <Text style={styles.val}>{debug?.phase ?? '—'}</Text></Text>
        <Text style={styles.line}>rep depth: <Text style={styles.val}>{pct}%</Text></Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.rule}>{debug?.activeRule ?? ''}</Text>
        <Text style={styles.rule}>{debug?.restRule ?? ''}</Text>
        {trackingLost ? <Text style={styles.lost}>tracking lost</Text> : null}
      </View>
    </View>
  );
}

function Dot({ pt, w, h, r, color }: { pt: PosePoint; w: number; h: number; r: number; color: string }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: pt.x * w - r,
        top: pt.y * h - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        backgroundColor: color,
      }}
    />
  );
}

function Segment({
  a,
  b,
  w,
  h,
  color = '#00E5FF',
  thickness = 3,
}: {
  a: PosePoint;
  b: PosePoint;
  w: number;
  h: number;
  color?: string;
  thickness?: number;
}) {
  const x1 = a.x * w;
  const y1 = a.y * h;
  const x2 = b.x * w;
  const y2 = b.y * h;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <View
      style={{
        position: 'absolute',
        left: (x1 + x2) / 2 - len / 2,
        top: (y1 + y2) / 2 - thickness / 2,
        width: len,
        height: thickness,
        backgroundColor: color,
        transform: [{ rotateZ: `${angle}deg` }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 8,
    gap: 2,
  },
  line: { color: '#fff', fontSize: 12, fontWeight: '600' },
  val: { color: '#00E5FF' },
  barTrack: {
    width: 140,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginVertical: 2,
  },
  barFill: { height: 6, borderRadius: 3, backgroundColor: '#00E5FF' },
  rule: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  lost: { color: '#FF5252', fontSize: 12, fontWeight: '700', marginTop: 2 },
});
