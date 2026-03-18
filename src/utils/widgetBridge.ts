import { SharedGroupPreferences } from 'react-native-shared-group-preferences';
import { Platform } from 'react-native';
import { getAllMoments } from '../db/moments';
import { formatElapsedTime } from './timeCalculator';

const WIDGET_DATA_KEY = 'gudmoment_widget_data';
const APP_GROUP = 'group.com.gudmoment.shared'; // iOS App Group

export interface WidgetMomentData {
  id: string;
  title: string;
  emoji: string;
  color: string;
  elapsed: string;
  date: string;
  time: string | null;
}

export async function updateWidgetData(): Promise<void> {
  const moments = await getAllMoments();
  const widgetData: WidgetMomentData[] = moments.map((m) => ({
    id: m.id,
    title: m.title,
    emoji: m.emoji,
    color: m.color,
    elapsed: formatElapsedTime(new Date(m.time ? `${m.date}T${m.time}Z` : `${m.date}T00:00:00Z`)),
    date: m.date,
    time: m.time,
  }));

  try {
    await SharedGroupPreferences.setItem(
      WIDGET_DATA_KEY,
      JSON.stringify(widgetData),
      Platform.OS === 'ios' ? APP_GROUP : undefined
    );
  } catch {
    // Widget data update is best-effort; don't crash the app
    console.warn('Failed to update widget data');
  }
}

export async function getWidgetData(): Promise<WidgetMomentData[]> {
  try {
    const data = await SharedGroupPreferences.getItem(
      WIDGET_DATA_KEY,
      Platform.OS === 'ios' ? APP_GROUP : undefined
    );
    if (!data) return [];
    return JSON.parse(data as string);
  } catch {
    return [];
  }
}
