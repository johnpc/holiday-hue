import { THEMES } from '../../domain/themes';

interface Props {
  value: string;
  onChange: (themeId: string) => void;
}

/** Tappable theme cards with their palette swatches. */
export function ThemeGrid({ value, onChange }: Props) {
  return (
    <div className="theme-grid" role="radiogroup" aria-label="Theme" data-testid="theme-grid">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={t.id === value}
          className={`theme-card hh-card${t.id === value ? ' theme-card--active' : ''}`}
          data-testid={`theme-${t.id}`}
          onClick={() => onChange(t.id)}
        >
          <span className="theme-card__emoji" aria-hidden>
            {t.emoji}
          </span>
          <span className="theme-card__name">{t.name}</span>
          <span className="theme-card__swatches" aria-hidden>
            {t.colors.map((c, i) => (
              <span key={i} className="theme-card__swatch" style={{ background: c }} />
            ))}
          </span>
        </button>
      ))}
    </div>
  );
}
