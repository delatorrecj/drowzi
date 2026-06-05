export const mascotAssets = {
  // Aliases retained for onboarding/dashboard compatibility
  idle: require('./mascot.png'),
  excited: require('./mascot-pumped.png'),
  surprised: require('./mascot-awake.png'),
  thinking: require('./mascot-groggy.png'),
  thinking2: require('./mascot-focused.png'),
  legendary: require('./mascot-legendary.png'),

  // Mobile Specific / Existing Assets
  awake: require('./mascot-awake.png'),
  groggy: require('./mascot-groggy.png'),
  pumped: require('./mascot-pumped.png'),
  focused: require('./mascot-focused.png'),
  defeated: require('./mascot-defeated.png'),
  alarmThrow: require('./mascot-alarm-throw.png'),
  sleeping: require('./mascot-sleeping-standing.png'),
  sleepStanding: require('./mascot-sleep-standing.png'),
  mascot: require('./mascot.png'),

  // Media
  intro: require('./mascot-intro.mp4'),
};

export type MascotMood = keyof typeof mascotAssets;
