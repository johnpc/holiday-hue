import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { bulbOutline, settingsOutline } from 'ionicons/icons';
import './tabBar.css';

/** Bottom tab bar: Lights (the control surface) and Settings. */
const TABS: { label: string; icon: string; to: string }[] = [
  { label: 'Lights', icon: bulbOutline, to: '/lights' },
  { label: 'Settings', icon: settingsOutline, to: '/settings' },
];

export function TabBar({ active = 'Lights' }: { active?: string }) {
  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map(({ label, icon, to }) => {
        const isActive = label === active;
        return (
          <Link
            key={label}
            to={to}
            className={isActive ? 'tab-bar__tab tab-bar__tab--active' : 'tab-bar__tab'}
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
            data-testid={`tab-${label.toLowerCase()}`}
          >
            <IonIcon className="tab-bar__icon" icon={icon} aria-hidden="true" />
            <span className="tab-bar__label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
