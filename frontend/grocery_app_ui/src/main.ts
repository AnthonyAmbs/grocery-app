import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        (req, next) => next(req.clone({ withCredentials: true }))
      ])
    )
  ]
})
.catch(err => console.error(err));
