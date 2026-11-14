import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SCENE } from '../../domain/scene';

vi.mock('./lightsApi', () => ({
  useLights: () => ({
    data: [
      { roomId: 'R1', roomName: 'Den' },
      { roomId: 'R1', roomName: 'Den' },
      { roomId: 'R2', roomName: 'Porch' },
    ],
  }),
}));

import { SceneCaption } from './SceneCaption';

describe('SceneCaption', () => {
  it('names the theme, pattern and target with its light count', () => {
    render(<SceneCaption scene={{ ...DEFAULT_SCENE, themeId: 'rainbow', patternId: 'fade' }} />);
    expect(screen.getByTestId('scene-caption')).toHaveTextContent(
      'Rainbow · Fade · All lights (3)',
    );
  });
  it('counts a room target and reads Off when the scene is off', () => {
    render(<SceneCaption scene={{ ...DEFAULT_SCENE, on: false, target: 'R1' }} />);
    expect(screen.getByTestId('scene-caption')).toHaveTextContent('Off · Den (2)');
  });
});
