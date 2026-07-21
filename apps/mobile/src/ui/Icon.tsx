import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { color } from '@/src/ui/tokens';

/** Ported 1:1 from website/components/SiteIcons.tsx (24x24, stroke 1.75). */
export type IconName =
  | 'motion'
  | 'barcode'
  | 'voice'
  | 'puzzle'
  | 'swipe'
  | 'snooze'
  | 'alarm-bell'
  | 'camera'
  | 'figure'
  | 'mascot-sleepy'
  | 'mascot-awake'
  | 'mascot-focused'
  | 'mascot-pumped'
  | 'mascot-legendary';

type Props = {
  name: IconName;
  size?: number;
  stroke?: string;
};

export function Icon({ name, size = 28, stroke = color.text }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name](stroke)}
    </Svg>
  );
}

const ICONS: Record<IconName, (stroke: string) => ReactNode> = {
  motion: () => (
    <>
      <Circle cx={12} cy={5} r={2} />
      <Path d="M8 11l4-2 4 2v3l-4 2-4-2v-3z" />
      <Path d="M6 20l3-4h6l3 4" />
    </>
  ),
  barcode: () => (
    <>
      <Path d="M4 6v12M7 6v12M10 6v12M13 6v12M16 6v12M20 6v12" />
      <Path d="M3 6h18M3 18h18" strokeWidth={1.25} />
    </>
  ),
  voice: () => (
    <>
      <Rect x={9} y={3} width={6} height={11} rx={3} />
      <Path d="M6 10a6 6 0 0 0 12 0" />
      <Path d="M12 17v3M9 20h6" />
    </>
  ),
  puzzle: () => <Path d="M8 4h3a1.5 1.5 0 0 1 3 0h3v3a1.5 1.5 0 0 1 0 3v3a1.5 1.5 0 0 1-3 0H8v-3a1.5 1.5 0 0 1 0-3V4z" />,
  swipe: () => (
    <>
      <Path d="M5 12h11" />
      <Path d="M13 8l4 4-4 4" />
      <Path d="M5 8v8" strokeWidth={2} />
    </>
  ),
  snooze: () => (
    <>
      <Circle cx={12} cy={13} r={7} />
      <Path d="M12 10v4l2.5 2" />
      <Path d="M9 4l-1.5-2M15 4l1.5-2" />
    </>
  ),
  'alarm-bell': () => (
    <>
      <Path d="M12 4a5 5 0 0 0-5 5v3l-2 2h14l-2-2V9a5 5 0 0 0-5-5z" />
      <Path d="M10 18a2 2 0 0 0 4 0" />
    </>
  ),
  camera: () => (
    <>
      <Rect x={3} y={7} width={18} height={12} rx={2} />
      <Circle cx={12} cy={13} r={3} />
      <Path d="M8 7V5h8v2" />
    </>
  ),
  figure: () => (
    <>
      <Circle cx={12} cy={5} r={2.5} />
      <Path d="M12 8v5" />
      <Path d="M8 20l4-7 4 7" />
      <Path d="M9 14h6" />
    </>
  ),
  'mascot-sleepy': () => (
    <>
      <Circle cx={12} cy={11} r={6} />
      <Path d="M9 10h1M14 10h1" />
      <Path d="M10 14h4" />
      <Path d="M8 5l-2-1M16 5l2-1" />
    </>
  ),
  'mascot-awake': (stroke) => (
    <>
      <Circle cx={12} cy={11} r={6} />
      <Circle cx={9.5} cy={10} r={1} fill={stroke} stroke="none" />
      <Circle cx={14.5} cy={10} r={1} fill={stroke} stroke="none" />
      <Path d="M10 14h4" />
    </>
  ),
  'mascot-focused': () => (
    <>
      <Circle cx={12} cy={11} r={6} />
      <Path d="M8.5 9.5h2M13.5 9.5h2" strokeWidth={2} />
      <Path d="M10 14h4" />
    </>
  ),
  'mascot-pumped': () => (
    <>
      <Circle cx={12} cy={11} r={6} />
      <Path d="M8 9l2 1 2-2 2 2 2-1" />
      <Path d="M9 15h6" strokeWidth={2} />
    </>
  ),
  'mascot-legendary': (stroke) => (
    <>
      <Circle cx={12} cy={11} r={6} />
      <Path d="M12 5l1 2h2l-1.5 1.5.5 2L12 9.5 9.5 10.5l.5-2L8.5 7h2L12 5z" fill={stroke} stroke="none" />
      <Path d="M10 14h4" />
    </>
  ),
};
