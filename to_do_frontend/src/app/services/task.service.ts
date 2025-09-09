import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Task } from '../models/task.model';
import { Observable, catchError, map, throwError } from 'rxjs';

/**
 * PUBLIC_INTERFACE
 * TaskService provides CRUD operations for tasks via REST API.
 * Base URL defaults to '/api/tasks' which is assumed to be proxied to the backend.
 * Methods:
 *  - list(): Observable<Task[]> - fetch all tasks
 *  - create(task: Partial<Task>): Observable<Task> - create a new task
 *  - update(id: number, updates: Partial<Task>): Observable<Task> - update a task
 *  - delete(id: number): Observable<void> - delete a task
 *  - toggleComplete(id: number, completed: boolean): Observable<Task> - shortcut to toggle completion
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  // No env var required; assuming same-origin backend with /api prefix.
  private readonly baseUrl = '/api/tasks';

  /** Map unknown backend shapes into the Task interface and normalize dates. */
  private normalize(task: any): Task {
    return {
      id: task.id ?? task._id ?? task.taskId,
      title: String(task.title ?? ''),
      description: task.description ?? '',
      dueDate: task.dueDate ?? null,
      completed: Boolean(task.completed),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  /** PUBLIC_INTERFACE */
  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl).pipe(
      map((arr: any[]) => (Array.isArray(arr) ? arr.map((t) => this.normalize(t)) : [])),
      catchError(this.handleError('Fetching tasks failed'))
    );
  }

  /** PUBLIC_INTERFACE */
  create(task: Partial<Task>): Observable<Task> {
    const payload = {
      title: task.title?.trim() ?? '',
      description: task.description?.trim() ?? '',
      dueDate: task.dueDate ?? null,
      completed: !!task.completed,
    };
    return this.http.post<Task>(this.baseUrl, payload).pipe(
      map((t: any) => this.normalize(t)),
      catchError(this.handleError('Creating task failed'))
    );
  }

  /** PUBLIC_INTERFACE */
  update(id: number, updates: Partial<Task>): Observable<Task> {
    const payload: any = { ...updates };
    if (typeof payload.title === 'string') payload.title = payload.title.trim();
    if (typeof payload.description === 'string') payload.description = payload.description.trim();

    return this.http.patch<Task>(`${this.baseUrl}/${id}`, payload).pipe(
      map((t: any) => this.normalize(t)),
      catchError(this.handleError('Updating task failed'))
    );
  }

  /** PUBLIC_INTERFACE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError('Deleting task failed'))
    );
  }

  /** PUBLIC_INTERFACE */
  toggleComplete(id: number, completed: boolean): Observable<Task> {
    return this.update(id, { completed });
  }

  /** Transform HTTP errors to user-friendly messages while preserving details for debugging. */
  private handleError(context: string) {
    return (error: HttpErrorResponse) => {
      console.error(context, error);
      const message =
        error.error?.message ??
        error.statusText ??
        'Unexpected error occurred. Please try again.';
      return throwError(() => new Error(`${context}: ${message}`));
    };
  }
}
