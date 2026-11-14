import { ALL_LIGHTS } from '../../domain/scene';
import { useLights } from './lightsApi';
import { groupRooms } from './rooms';

interface Props {
  value: string;
  onChange: (target: string) => void;
}

/** All lights, or one room — rooms come from the inventory the runner mirrored. */
export function TargetPicker({ value, onChange }: Props) {
  const { data: lights = [] } = useLights();
  const rooms = groupRooms(lights);
  const options = [{ id: ALL_LIGHTS, name: 'All lights', count: lights.length }, ...rooms];
  return (
    <div className="chips" role="radiogroup" aria-label="Which lights" data-testid="target-picker">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          className={`chip${o.id === value ? ' chip--active' : ''}`}
          data-testid={`target-${o.id}`}
          onClick={() => onChange(o.id)}
        >
          {o.name} <span className="chip__count">{o.count}</span>
        </button>
      ))}
    </div>
  );
}
