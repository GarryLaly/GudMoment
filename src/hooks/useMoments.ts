import { useContext } from 'react';
import { MomentsContext } from '../context/MomentsContext';

export function useMoments() {
  const ctx = useContext(MomentsContext);
  if (!ctx) throw new Error('useMoments must be used within MomentsProvider');
  return ctx;
}
