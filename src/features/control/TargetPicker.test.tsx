import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  lights: [] as { roomId: string | null; roomName: string | null }[],
}));
vi.mock('./lightsApi', () => ({ useLights: () => ({ data: api.lights }) }));

import { TargetPicker } from './TargetPicker';

describe('TargetPicker', () => {
  it('explains when the runner has not mirrored any lights yet', () => {
    render(<TargetPicker value="all" onChange={vi.fn()} />);
    expect(screen.getByTestId('target-empty')).toBeInTheDocument();
  });
  it('lists all lights plus each room with counts and emits the choice', () => {
    api.lights = [
      { roomId: 'R1', roomName: 'Den' },
      { roomId: 'R1', roomName: 'Den' },
      { roomId: null, roomName: null },
    ];
    const onChange = vi.fn();
    render(<TargetPicker value="all" onChange={onChange} />);
    expect(screen.getByTestId('target-all')).toHaveTextContent('All lights 3');
    expect(screen.getByTestId('target-R1')).toHaveTextContent('Den 2');
    fireEvent.click(screen.getByTestId('target-R1'));
    expect(onChange).toHaveBeenCalledWith('R1');
  });
});
