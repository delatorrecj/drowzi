# Onboarding Strategy & Flow: The Sleepy Bear Experience (ONBOARDING.MD)

## 1. The Strategy: Radical Simplicity
To reduce friction for the groggy user, the onboarding process is condensed into **three high-impact questions**. This "3-Question Pivot" allows the app to calibrate the mascot’s behavior, the UI intensity, and the habit-gate mechanism without causing decision fatigue.

---

## 2. The 3-Question Personalization Flow

### Question 1: The Relationship Dynamic (Tone Calibration)
* **Prompt:** "How do you want us to handle your mornings?"
* **Choice A: The Supportive Companion.** * *Philosophy:* Empathetic Productivity.
    * *UI Impact:* Uses the **Honey Gold (#F7D302)** palette and soft-breathing animations.
    * *Mascot Tone:* Focuses on Pose 6 (Groggy Stir) and Pose 4 (Defeated) to show shared struggle.
* **Choice B: The Challenger.**
    * *Philosophy:* The Personal Trainer.
    * *UI Impact:* Uses high-contrast **Awakening Yellow (#F4C430)** and **Action Red (#E63946)**.
    * *Mascot Tone:* Focuses on Pose 3 (Partial Wake) and Pose 2 (Alarm Block).

### Question 2: The Sleep Inertia Root (Task Categorization)
* **Prompt:** "What keeps you in bed the longest?"
* **Choice A: Physical Heaviness.** * *Logic:* Targets biological sleep inertia.
    * *Impact:* Defaults the habit-gate to the **Physical** category (e.g., 10 push-ups).
* **Choice B: Mental Fog.**
    * *Logic:* Targets cognitive alertness.
    * *Impact:* Defaults the habit-gate to the **Cognitive** category (e.g., reading a motivational passage).
* **Choice C: The 'One More Minute' Loop.**
    * *Logic:* Targets environmental comfort.
    * *Impact:* Defaults the habit-gate to the **Environmental** category (e.g., scanning a kitchen barcode).

### Question 3: The Verification Anchor (Habit Stacking)
* **Prompt:** "What is the one thing you *must* do every morning anyway?"
* **Input:** The user selects a specific anchor (e.g., "Grab my toothpaste", "Open the coffee bag").
* **Impact:** Sets the specific object for camera/sensor verification. This utilizes **Habit Stacking** by tying the alarm's "off switch" to a mandatory daily routine.

---

## 3. Onboarding Walkthrough Guide

| Step | User Interaction | Visual/Mascot State | UI Palette |
| :--- | :--- | :--- | :--- |
| **0. Welcome** | App Launch | **Pose 5 (Curled Side Sleep)** | Warm Night Neutrals |
| **1. Tone** | Selects "The Challenger" | Mascot shifts to **Pose 3 (Partial Wake)** | Shifts to **#F4C430** |
| **2. Category** | Selects "Environmental Loop" | Mascot shifts to **Pose 6 (Groggy Stir)** | Accents of **#654321** |
| **3. Anchor** | Scans Coffee Bag Barcode | Mascot gives a slight "Action" bounce | Confirm Green / Gold |
| **4. Ready** | First Alarm Set | Mascot settles into **Pose 1 (Default Sleep)** | Dimmed "Night Mode" |

---

## 4. User Story: "The First Stir"

**Persona:** Alex, a chronic snoozer who has abandoned every "puzzle alarm" in the past.

**The Experience:**
1.  **Opening:** Alex opens the app at 10:00 PM. They aren't met with a data form, but a sleeping bear. 
2.  **Engagement:** When Alex selects **"The Challenger"**, the bear opens one eye (**Partial Wake**). The color shifts to a bright, energetic yellow that feels like a commitment.
3.  **The Hook:** Alex identifies that they stay in bed because they can't stop the "one more minute" loop. The app suggests scanning an item in another room.
4.  **Verification:** Alex walks to the kitchen and scans their coffee bag. The app confirms: *"Toll Set. To stop tomorrow's alarm, you must meet the bear at the coffee maker."*
5.  **Closure:** Alex feels a sense of controlled accountability. The bear goes back to sleep, and the screen dims to a soft purple, signaling it’s time for Alex to do the same.

---

## 5. Design Principles for Onboarding
* **No Scrolling:** Every question must fit on a single screen to maintain focus.
* **Animated Transitions:** Transitions between questions should feel "heavy" and deliberate, matching the **Sleepy Bear** motion guidelines.
* **Immediate Value:** The user must interact with their "Verification Anchor" during onboarding so they know exactly how to "pay the toll" the following morning.
