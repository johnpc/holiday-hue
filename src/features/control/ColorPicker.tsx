import { isHexColor } from '../../domain/color';

const PRESETS = ['#ff1a1a', '#ff8c00', '#ffd300', '#1fbf4a', '#1e6fff', '#c51fa0', '#fff4e0'];

interface Props {
  value: string;
  onChange: (hex: string) => void;
}

/** Custom color for the Solid theme: quick swatches + a native color input. */
export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="color-picker" data-testid="color-picker">
      <div className="chips" role="radiogroup" aria-label="Preset colors">
        {PRESETS.map((hex) => (
          <button
            key={hex}
            type="button"
            role="radio"
            aria-checked={hex === value}
            aria-label={hex}
            className={`swatch${hex === value ? ' swatch--active' : ''}`}
            style={{ background: hex }}
            data-testid={`swatch-${hex.slice(1)}`}
            onClick={() => onChange(hex)}
          />
        ))}
      </div>
      <label className="color-picker__custom">
        <span className="hh-muted">Any color</span>
        <input
          type="color"
          value={value}
          aria-label="Custom color"
          data-testid="color-input"
          onChange={(e) => {
            if (isHexColor(e.target.value)) onChange(e.target.value);
          }}
        />
      </label>
    </div>
  );
}
