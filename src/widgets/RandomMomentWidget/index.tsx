import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetMomentData } from '../../utils/widgetBridge';

interface Props {
  moment: WidgetMomentData | null;
}

export function RandomMomentWidget({ moment }: Props) {
  if (!moment) {
    return (
      <FlexWidget
        style={{ height: 'match_parent', width: 'match_parent', backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' }}
      >
        <TextWidget text="No moments yet" style={{ fontSize: 14, color: '#666666' }} />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#FAFAFA',
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: moment.color,
      }}
    >
      <TextWidget text={moment.emoji} style={{ fontSize: 40 }} />
      <TextWidget text={moment.title} style={{ fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginTop: 8 }} />
      <TextWidget text={moment.elapsed} style={{ fontSize: 14, color: '#1A1A1A', marginTop: 4 }} />
    </FlexWidget>
  );
}
