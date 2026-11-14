import { PATTERNS } from '../../domain/patterns';

interface Props {
  value: string;
  onChange: (patternId: string) => void;
}

/** Pattern chips (Steady / Twinkle / Alternate / Fade) with a one-line hint. */
export function PatternPicker({ value, onChange }: Props) {
  const current = PATTERNS.find((p) => p.id === value);
  return (
    <div data-testid="pattern-picker">
      <div className="chips" role="radiogroup" aria-label="Pattern">
        {PATTERNS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={p.id === value}
            className={`chip${p.id === value ? ' chip--active' : ''}`}
            data-testid={`pattern-${p.id}`}
            onClick={() => onChange(p.id)}
          >
            <span aria-hidden>{p.emoji}</span> {p.name}
          </button>
        ))}
      </div>
      <p className="hh-muted chips__hint" data-testid="pattern-hint">
        {current?.description ?? ''}
      </p>
    </div>
  );
}
