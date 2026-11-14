import { IonRouterOutlet } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { ResetPassword } from './features/auth/ResetPassword';
import { SignIn } from './features/auth/SignIn';
import { SignUp } from './features/auth/SignUp';
import { Control } from './features/control/Control';
import { RunnerStatusCard } from './features/control/RunnerStatusCard';
import { HouseholdGate } from './features/household/HouseholdGate';
import { Settings } from './features/settings/Settings';
import { NotFound } from './features/shell/NotFound';

/** App routes. Everything that touches the lights sits behind the HouseholdGate. */
export function AppRoutes() {
  return (
    <IonRouterOutlet>
      <Route exact path="/lights">
        <HouseholdGate>
          <Control />
        </HouseholdGate>
      </Route>
      <Route exact path="/settings">
        <HouseholdGate>
          <Settings extra={<RunnerStatusCard />} />
        </HouseholdGate>
      </Route>
      <Route exact path="/signin">
        <SignIn />
      </Route>
      <Route exact path="/signup">
        <SignUp />
      </Route>
      <Route exact path="/reset">
        <ResetPassword />
      </Route>
      <Route exact path="/">
        <Redirect to="/lights" />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </IonRouterOutlet>
  );
}
