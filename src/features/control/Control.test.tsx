import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SCENE, type SceneState } from '../../domain/scene';

const ctl = vi.hoisted(() => ({
  scene: {} as SceneState,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  set: vi.fn(),
}));
vi.mock('./useControl', () => ({ useControl: () => ctl }));
vi.mock('./lightsApi', () => ({
  useLights: () => ({ data: [{ id: '1', name: 'Tree', roomId: 'R1', roomName: 'Living Room' }] }),
  useRunnerStatus: () => ({ data: { lastHeartbeatAt: new Date().toISOString() } }),
}));

import { Control } from './Control';

const renderControl = () =>
  render(
    <MemoryRouter>
      <Control />
    </MemoryRouter>,
  );

describe('Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctl.scene = { ...DEFAULT_SCENE };
    ctl.isLoading = false;
    ctl.isError = false;
  });

  it('renders the scene and writes a theme tap', () => {
    renderControl();
    expect(screen.getByTestId('theme-christmas')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByTestId('theme-candy-cane'));
    expect(ctl.set).toHaveBeenCalledWith({ themeId: 'candy-cane' });
    fireEvent.click(screen.getByTestId('pattern-fade'));
    expect(ctl.set).toHaveBeenCalledWith({ patternId: 'fade' });
    fireEvent.click(screen.getByTestId('target-R1'));
    expect(ctl.set).toHaveBeenCalledWith({ target: 'R1' });
    expect(screen.getByTestId('runner-status')).toHaveTextContent('Online · 1 lights');
    expect(screen.queryByTestId('color-picker')).toBeNull();
    const ionChange = (el: Element, detail: object) =>
      fireEvent(el, new CustomEvent('ionChange', { bubbles: true, detail }));
    ionChange(screen.getByTestId('power-toggle'), { checked: false });
    expect(ctl.set).toHaveBeenCalledWith({ on: false });
    ionChange(screen.getByTestId('speed-range'), { value: 8 });
    expect(ctl.set).toHaveBeenCalledWith({ speed: 8 });
    ionChange(screen.getByTestId('brightness-range'), { value: 33 });
    expect(ctl.set).toHaveBeenCalledWith({ brightness: 33 });
  });

  it('shows the color picker for the solid theme', () => {
    ctl.scene = { ...DEFAULT_SCENE, themeId: 'solid', customColor: '#1e6fff' };
    renderControl();
    fireEvent.click(screen.getByTestId('swatch-ff8c00'));
    expect(ctl.set).toHaveBeenCalledWith({ customColor: '#ff8c00' });
    fireEvent.change(screen.getByTestId('color-input'), { target: { value: '#00ff00' } });
    expect(ctl.set).toHaveBeenCalledWith({ customColor: '#00ff00' });
  });

  it('shows the error state with retry', () => {
    ctl.isError = true;
    renderControl();
    fireEvent.click(screen.getByTestId('load-retry'));
    expect(ctl.refetch).toHaveBeenCalled();
  });

  it('shows the loading state', () => {
    ctl.isLoading = true;
    renderControl();
    expect(screen.getByTestId('load-loading')).toBeInTheDocument();
  });
});
