import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetMomentData } from '../../utils/widgetBridge';

interface Props {
  moments: WidgetMomentData[];
}

export function MultiMomentWidget({ moments }: Props) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#FAFAFA',
        borderRadius: 0,
        padding: 12,
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <TextWidget
        text="GudMoment"
        style={{ fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' }}
      />
      {moments.slice(0, 5).map((m) => (
        <FlexWidget
          key={m.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 4,
            borderWidth: 2,
            borderColor: '#1A1A1A',
          }}
        >
          <TextWidget text={m.emoji} style={{ fontSize: 18 }} />
          <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
            <TextWidget text={m.title} style={{ fontSize: 13, fontWeight: 'bold', color: '#1A1A1A' }} />
            <TextWidget text={m.elapsed} style={{ fontSize: 11, color: '#666666' }} />
          </FlexWidget>
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}
