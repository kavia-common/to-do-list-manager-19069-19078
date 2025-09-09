# To-Do Frontend (Angular)

This Angular app provides a clean UI to create, list, update, and delete tasks.

Backend API assumptions:
- The frontend calls same-origin REST endpoints at `/api/tasks`.
- Expected endpoints:
  - GET `/api/tasks` -> Task[]
  - POST `/api/tasks` -> Task
  - PATCH `/api/tasks/:id` -> Task
  - DELETE `/api/tasks/:id` -> 204/200
- Task shape: `{ id:number, title:string, description?:string, dueDate?:string|null, completed:boolean, createdAt?:string, updatedAt?:string }`

Development server:

```bash
npm install
npm start
```

Visit http://localhost:3000/ (per angular.json serve config).

Notes:
- No environment variables are required.
- To proxy to a backend during development, configure your dev server or reverse proxy to map `/api` to your backend service.
- SSR entry remains compatible with Angular 19 requirements.

For scaffolding and build guides, see Angular CLI docs.
