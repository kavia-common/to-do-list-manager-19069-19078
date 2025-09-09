# Bug: Angular frontend fails to start — "Port 3000 is not ready"

- Component: to_do_frontend (Angular)
- Error message: "Web container setup failed: Port 3000 is not ready for to_do_frontend (angular)"
- Environment: Frontend preview container
- Expected behavior: The Angular dev server should listen on port 3000 and become ready for HTTP requests.
- Actual behavior: The preview system reports that port 3000 is not ready; the container never becomes healthy/ready.

## Detailed description

When attempting to start the Angular frontend preview for the to-do app, the container fails its readiness check with the error:

"Web container setup failed: Port 3000 is not ready for to_do_frontend (angular)"

This indicates that the process inside the container did not bind to port 3000 within the expected time window, or it started on a different port/interface, or it crashed during boot.

The project is configured to use Angular 19 with a dev server defined in angular.json:
- serve port: 3000
- host: 0.0.0.0
- disableHostCheck: true
And package.json runs: `ng serve --no-hmr --disable-host-check`

SSR is also configured (server.ts) to default to port 4000 when used. The preview relies on `ng serve` to bind to port 3000; if the server process doesn't start or crashes, the readiness check will fail.

## Possible causes

1) Port conflict or misbinding
- Another process is already using port 3000, or the dev server is binding to a different port (e.g., default 4200) or to localhost only (not 0.0.0.0).
- A mismatch between angular.json "serve" options and the `ng serve` script flags can lead to binding to an unexpected interface/port.

2) Angular dev server startup failure
- Missing or incompatible node modules (npm install not run, or partial install).
- Version mismatch across Angular packages (must all be 19.2.1 — currently they are consistent).
- Node version incompatibility with Angular 19 toolchain.
- Build errors at startup preventing the dev server from launching (TypeScript config or code errors).

3) HMR/host check flags incompatibility
- The script includes `--no-hmr` and `--disable-host-check`. New Angular/CLI versions may ignore or warn on deprecated flags, but atypical flag handling could still cause startup aborts in strict environments.

4) SSR server confusion
- The SSR server (Express in src/server.ts) defaults to port 4000. If the preview expects the dev server on 3000 but an SSR process is started instead, the readiness probe on 3000 will fail.

5) Bind address or proxying issues
- The container runtime may require the dev server to bind 0.0.0.0; if for any reason the dev server binds only to localhost (127.0.0.1), external readiness checks may fail.

6) Angular CLI config defaults overridden
- If angular.json defaultConfiguration is "production" for build and serve resolves incorrectly, `ng serve` may not start a dev server as expected.

## Troubleshooting steps

1) Verify dev server command and port
- Ensure the script used by the preview runs: `npm start` -> `ng serve --no-hmr --disable-host-check`
- Confirm angular.json serve options include:
  - "options": { "port": 3000, "host": "0.0.0.0" }
- If needed, make the port explicit in the script:
  - `"start": "ng serve --port 3000 --host 0.0.0.0 --no-hmr"`

2) Install dependencies
- Run `npm ci` or `npm install` in to_do_frontend to ensure all dependencies are present and consistent.
- Confirm all @angular/* package versions are exactly 19.2.1 (no ranges) and match across core/common/forms/router/etc., as currently configured.

3) Check Node.js version compatibility
- Use a Node version compatible with Angular 19 (Node 18 LTS or 20 LTS).
- If the container uses an incompatible Node version, adjust the base image or environment accordingly.

4) Inspect startup logs
- Run `npm start` locally or in the container and collect logs.
- Look for:
  - Port already in use errors
  - Build/TypeScript errors
  - CLI warnings about invalid/unknown flags (e.g., --disable-host-check)
  - Any indication it started on a different port (e.g., 4200)

5) Avoid SSR confusion
- Ensure the preview is not starting the SSR script (`serve:ssr:angular`); it listens on port 4000. The readiness probe targets port 3000. Use `ng serve` for the preview.

6) Reduce flags and align with current CLI
- Try a minimal start script:
  - `"start": "ng serve --port 3000 --host 0.0.0.0"`
- Remove `--disable-host-check` if unnecessary; binding to 0.0.0.0 is sufficient in containerized preview.

7) Confirm the serve configuration is picked up
- In some environments, the CLI may not honor options from angular.json. Make the port and host explicit in the start script (see step 1).

8) Ensure no proxy or firewall interference
- If a reverse proxy is in front, confirm it routes to container:3000 and health checks target the right path.

## Acceptance criteria for resolution

- `npm start` runs the Angular dev server without errors.
- The process binds to 0.0.0.0:3000 and responds to HTTP requests.
- Preview system reports the container as ready.
- No critical CLI errors or port conflicts remain in logs.

## Notes

- Current codebase uses Angular 19.2.1 throughout with matching versions, which is correct and should not be changed unless a logged incompatibility is found.
- SSR entry (main.server.ts) correctly exports a default bootstrap returning a Promise<ApplicationRef; this does not affect dev server startup as long as `ng serve` is used for preview.
