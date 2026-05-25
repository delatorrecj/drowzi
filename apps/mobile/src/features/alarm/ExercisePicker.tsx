import { Pressable, Text, View } from 'react-native';

import { alarmSetupStyles as styles } from '@/src/features/alarm/alarmSetupStyles';
import type { ExerciseDefinition } from '@/src/features/exercise/exerciseRegistry';
import type { ExerciseId } from '@/src/shared/types';

type Props = {
  exercises: ExerciseDefinition[];
  selectedId: ExerciseId;
  onSelect: (id: ExerciseId) => void;
};

export function ExercisePicker({ exercises, selectedId, onSelect }: Props) {
  return (
    <View style={{ gap: 10, marginTop: 4 }}>
      {exercises.map((ex) => {
        const selected = ex.id === selectedId;
        return (
          <Pressable
            key={ex.id}
            style={[styles.card, selected && styles.cardSelected]}
            onPress={() => onSelect(ex.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}>
            <Text style={styles.cardTitle}>{ex.label}</Text>
            <Text style={styles.cardBody}>{ex.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
