import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SCENE } from '../../domain/scene';
import { PowerRow } from './PowerRow';
import { Preview } from './Preview';
import { Sliders } from './Sliders';

/** Ionic web components in jsdom: drive the React onIonChange prop directly. */
const ionChange = (el: Element, detail: object) =>
  fireEvent(el, new CustomEvent('ionChange', { bubbles: true, detail }));

describe('PowerRow', () => {
  it('reflects state and emits toggles', () => {
    const onChange = vi.fn();
    render(<PowerRow on={true} onChange={onChange} />);
    expect(screen.getByTestId('power-row')).toHaveTextContent('Lights are on');
    ionChange(screen.getByTestId('power-toggle'), { checked: false });
    expect(onChange).toHaveBeenCalledWith(false);
  });
  it('shows the off copy', () => {
    render(<PowerRow on={false} onChange={vi.fn()} />);
    expect(screen.getByTestId('power-row')).toHaveTextContent('Lights are off');
  });
});

describe('Sliders', () => {
  it('emits numeric speed and brightness on release', () => {
    const onSpeed = vi.fn();
    const onBrightness = vi.fn();
    render(<Sliders speed={5} brightness={80} onSpeed={onSpeed} onBrightness={onBrightness} />);
    ionChange(screen.getByTestId('speed-range'), { value: 7 });
    ionChange(screen.getByTestId('brightness-range'), { value: '40' });
    expect(onSpeed).toHaveBeenCalledWith(7);
    expect(onBrightness).toHaveBeenCalledWith(40);
  });
});

describe('Preview', () => {
  it('lights every bulb when on', () => {
    render(<Preview scene={{ ...DEFAULT_SCENE, patternId: 'steady' }} />);
    expect(screen.getAllByTestId('preview-bulb').every((b) => b.dataset.lit === 'true')).toBe(true);
  });
  it('lights none when off', () => {
    render(<Preview scene={{ ...DEFAULT_SCENE, on: false }} />);
    expect(screen.getByTestId('preview')).toHaveAttribute('data-on', 'false');
    expect(screen.getAllByTestId('preview-bulb').every((b) => b.dataset.lit === 'false')).toBe(
      true,
    );
  });
});
