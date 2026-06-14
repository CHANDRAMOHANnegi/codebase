import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type SavedLook = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  photoUri?: string;
  faceShape: string;
  styleId: string;
  savedAt: number;
};

const STORAGE_KEY = '@stylemirror/saved_looks';

export function useSavedLooks() {
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as SavedLook[];
          setLooks(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (updated: SavedLook[]) => {
    setLooks(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const saveLook = useCallback(
    async (params: { faceShape: string; styleId: string; styleName: string; photoUri?: string }) => {
      const newLook: SavedLook = {
        id: `look-${Date.now()}`,
        title: params.styleName,
        subtitle: `${params.styleId.replaceAll('_', ' ')} / ${params.faceShape} face`,
        status: 'Ready to share',
        photoUri: params.photoUri,
        faceShape: params.faceShape,
        styleId: params.styleId,
        savedAt: Date.now()
      };
      await persist([newLook, ...looks]);
      return newLook;
    },
    [looks, persist]
  );

  const deleteLook = useCallback(
    async (id: string) => {
      await persist(looks.filter((l) => l.id !== id));
    },
    [looks, persist]
  );

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return { looks, loading, saveLook, deleteLook, clearAll };
}
