export const SITE = {
  appStoreUrl: "#download",   // replace with real App Store link
  playStoreUrl: "#download",  // replace with real Play Store link
  githubUrl: "https://github.com/delatorrecj/drowzi",
  privacyUrl: "/privacy",
};

export const COPY = {
  nav: {
    brand: "Drowzi",
    cta: "Download Free",
  },
  hero: {
    headline: ["Your alarm won't stop.", "Until you do."],
    sub: "The first alarm app that uses your phone's camera, mic, and sensors to verify you've actually done your morning habit. Not a puzzle. Not a swipe. The habit is the off-switch.",
    badge: "Free · iOS & Android",
  },
  problem: {
    eyebrow: "The Problem",
    headline: "Sleep inertia wins every morning.",
    body: [
      "Your brain is in a low-arousal state for 15–30 minutes after waking. Willpower is offline. The intentions you made the night before collapse the moment the alarm goes off.",
      "Puzzle alarms make you solve a math problem. Swipe alarms let you dismiss with muscle memory. Neither changes your physical or mental state. They're all just noise.",
    ],
    failures: [
      {
        icon: "🧩",
        label: "Math puzzles",
        caption: "Short-term memory. Back asleep in 2 minutes.",
      },
      {
        icon: "👆",
        label: "Swipe to dismiss",
        caption: "Pure muscle reflex. Zero real effort.",
      },
      {
        icon: "😴",
        label: "Traditional snooze",
        caption: "Infinite delay. Infinite failure.",
      },
    ],
  },
  howItWorks: {
    eyebrow: "The Solution",
    headline: "The habit is the off-switch.",
    sub: "Choose your habit. Register it once. The alarm does not stop until it's verified.",
    gates: [
      {
        icon: "💪",
        title: "Motion Gate",
        body: "Camera counts your push-ups, squats, or jumping jacks. Rep target must be reached. No exceptions.",
        image: "/images/phone-motion-gate.png",
      },
      {
        icon: "📦",
        title: "Barcode Gate",
        body: "Register any item in your home — coffee bag, toothpaste, supplement bottle. You have to walk there to scan it.",
        image: "/images/phone-barcode-gate.png",
      },
      {
        icon: "🎤",
        title: "Voice Gate",
        body: "Read a motivational passage aloud. Voice recognition confirms you said it — clearly, fully, intentionally.",
        image: "/images/phone-voice-gate.png",
      },
    ],
  },
  science: {
    eyebrow: "The Science",
    headline: ["This isn't willpower.", "It's architecture."],
    proofs: [
      {
        title: "Habit Stacking",
        body: "Behavioral psychology: tying a new behavior to an unavoidable cue makes it automatic. The alarm is the cue. The habit is the response. Drowzi digitally enforces this loop.",
      },
      {
        title: "Environmental Shift",
        body: "Chronobiology: moving to a new physical space rapidly signals to your circadian system that sleep is over. Walking to the kitchen defeats grogginess faster than any alarm sound.",
      },
      {
        title: "Micro-Commitments",
        body: "10 push-ups. A barcode scan. A spoken sentence. Small wins build momentum. Lower barriers drive compliance. You stay consistent because it's achievable — every single morning.",
      },
    ],
  },
  mascot: {
    headline: "You grow. Drowzi grows with you.",
    body: "Every morning you complete your habit, Drowzi evolves. Miss a day, it goes back to sleep. The streak is the product.",
    caption: "30-day streak unlocks Legendary form. Don't break the chain.",
    states: [
      { label: "Day 0", state: "Sleepy" },
      { label: "Day 7", state: "Awake" },
      { label: "Day 14", state: "Focused" },
      { label: "Day 21", state: "Pumped" },
      { label: "Day 30", state: "Legendary" },
    ],
  },
  cta: {
    headline: ["Your alarm goes off tomorrow.", "What are you going to do about it?"],
    badge: "Free · iOS 16+ · Android 12+",
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Drowzi. All rights reserved.`,
  },
};
