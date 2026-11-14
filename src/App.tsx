import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Design tokens + role classes — imported BEFORE any feature so feature CSS
 * (which consumes the tokens) always cascades after them. */
import './theme/variables.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './features/auth/AuthProvider';
import { ErrorBoundary } from './features/shell/ErrorBoundary';
import { Toast } from './features/shell/Toast';
import { AppRoutes } from './AppRoutes';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <IonReactRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <Toast />
        </IonReactRouter>
      </AuthProvider>
    </QueryClientProvider>
  </IonApp>
);

export default App;
