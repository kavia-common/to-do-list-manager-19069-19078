import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// SSR entry must export default returning Promise<ApplicationRef> in Angular 19
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
