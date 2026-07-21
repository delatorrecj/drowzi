import { Pressable, View } from 'react-native';

import { AppText, Card, color } from '@/src/ui';
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
            onPress={() => onSelect(ex.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}>
            <Card selected={selected}>
              <AppText variant="bodyStrong">{ex.label}</AppText>
              <AppText variant="caption" color={color.textMuted}>
                {ex.description}
              </AppText>
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}
