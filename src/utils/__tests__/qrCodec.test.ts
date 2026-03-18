import { encodeMomentForQR, decodeMomentFromQR, QRPayload } from '../qrCodec';

describe('qrCodec', () => {
  const validPayload: QRPayload = {
    v: 1,
    title: 'Our Wedding',
    date: '2018-01-30',
    time: '10:00:00',
    timezone: 'Asia/Jakarta',
    icon: '💍',
    color: '#FF6B6B',
  };

  it('encodes a moment to a JSON string', () => {
    const encoded = encodeMomentForQR(validPayload);
    expect(typeof encoded).toBe('string');
    const parsed = JSON.parse(encoded);
    expect(parsed.v).toBe(1);
    expect(parsed.title).toBe('Our Wedding');
  });

  it('decodes a valid JSON string back to a payload', () => {
    const encoded = encodeMomentForQR(validPayload);
    const decoded = decodeMomentFromQR(encoded);
    expect(decoded).toEqual(validPayload);
  });

  it('returns null for invalid JSON', () => {
    expect(decodeMomentFromQR('not json')).toBeNull();
  });

  it('returns null for missing required fields', () => {
    expect(decodeMomentFromQR(JSON.stringify({ v: 1 }))).toBeNull();
  });

  it('returns null for unsupported version', () => {
    expect(decodeMomentFromQR(JSON.stringify({ ...validPayload, v: 99 }))).toBeNull();
  });

  it('handles payload without optional time field', () => {
    const noTime = { ...validPayload, time: undefined };
    const encoded = encodeMomentForQR(noTime);
    const decoded = decodeMomentFromQR(encoded);
    expect(decoded?.time).toBeUndefined();
  });

  it('truncates titles longer than 100 characters', () => {
    const longTitle = { ...validPayload, title: 'A'.repeat(120) };
    const encoded = encodeMomentForQR(longTitle);
    const decoded = decodeMomentFromQR(encoded);
    expect(decoded?.title.length).toBe(100);
  });
});
