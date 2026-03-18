import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import * as MomentsDB from '../db/moments';
import type { Moment, CreateMomentInput, UpdateMomentInput } from '../db/moments';
import { updateWidgetData } from '../utils/widgetBridge';

interface MomentsState {
  moments: Moment[];
  loading: boolean;
  error: string | null;
}

type MomentsAction =
  | { type: 'SET_MOMENTS'; payload: Moment[] }
  | { type: 'ADD_MOMENT'; payload: Moment }
  | { type: 'UPDATE_MOMENT'; payload: Moment }
  | { type: 'DELETE_MOMENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface MomentsContextValue extends MomentsState {
  loadMoments: () => Promise<void>;
  addMoment: (input: CreateMomentInput) => Promise<Moment>;
  editMoment: (id: string, input: UpdateMomentInput) => Promise<Moment | null>;
  removeMoment: (id: string) => Promise<void>;
}

export const MomentsContext = createContext<MomentsContextValue | null>(null);

function momentsReducer(state: MomentsState, action: MomentsAction): MomentsState {
  switch (action.type) {
    case 'SET_MOMENTS':
      return { ...state, moments: action.payload, loading: false };
    case 'ADD_MOMENT':
      return { ...state, moments: [...state.moments, action.payload] };
    case 'UPDATE_MOMENT':
      return { ...state, moments: state.moments.map((m) => (m.id === action.payload.id ? action.payload : m)) };
    case 'DELETE_MOMENT':
      return { ...state, moments: state.moments.filter((m) => m.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function MomentsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(momentsReducer, { moments: [], loading: true, error: null });

  const loadMoments = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const moments = await MomentsDB.getAllMoments();
      dispatch({ type: 'SET_MOMENTS', payload: moments });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load moments' });
    }
  }, []);

  const addMoment = useCallback(async (input: CreateMomentInput) => {
    const moment = await MomentsDB.createMoment(input);
    dispatch({ type: 'ADD_MOMENT', payload: moment });
    updateWidgetData();
    return moment;
  }, []);

  const editMoment = useCallback(async (id: string, input: UpdateMomentInput) => {
    const moment = await MomentsDB.updateMoment(id, input);
    if (moment) dispatch({ type: 'UPDATE_MOMENT', payload: moment });
    updateWidgetData();
    return moment;
  }, []);

  const removeMoment = useCallback(async (id: string) => {
    await MomentsDB.deleteMoment(id);
    dispatch({ type: 'DELETE_MOMENT', payload: id });
    updateWidgetData();
  }, []);

  useEffect(() => { loadMoments(); }, [loadMoments]);

  return (
    <MomentsContext.Provider value={{ ...state, loadMoments, addMoment, editMoment, removeMoment }}>
      {children}
    </MomentsContext.Provider>
  );
}
