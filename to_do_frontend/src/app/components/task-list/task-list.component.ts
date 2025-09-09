import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { TaskListItemComponent } from '../task-list-item/task-list-item.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { NotificationService } from '../../services/notification.service';

/**
 * PUBLIC_INTERFACE
 * TaskListComponent shows the tasks, supports create/edit/delete/toggle and simple filtering.
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskListItemComponent, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  constructor(private taskService: TaskService, public notifier: NotificationService) {}

  tasks = signal<Task[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // UI state
  showCreate = signal<boolean>(false);
  editing = signal<Task | null>(null);
  query = signal<string>('');
  filter: 'all' | 'open' | 'completed' = 'all';

  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    return this.tasks().filter((t) => {
      if (this.filter === 'open' && t.completed) return false;
      if (this.filter === 'completed' && !t.completed) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
      );
    });
  });

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading.set(true);
    this.error.set(null);
    this.taskService.list().subscribe({
      next: (res) => {
        this.tasks.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load tasks');
        this.loading.set(false);
      },
    });
  }

  startCreate() {
    this.editing.set(null);
    this.showCreate.set(true);
  }

  startEdit(task: Task) {
    this.showCreate.set(false);
    this.editing.set(task);
  }

  cancelForm() {
    this.showCreate.set(false);
    this.editing.set(null);
  }

  createTask(payload: Partial<Task>) {
    this.loading.set(true);
    this.taskService.create(payload).subscribe({
      next: (created) => {
        this.tasks.set([created, ...this.tasks()]);
        this.showCreate.set(false);
        this.notifier.notify('Task created', 'success');
        this.loading.set(false);
      },
      error: (err) => {
        this.notifier.notify(err.message || 'Failed to create task', 'error');
        this.loading.set(false);
      },
    });
  }

  updateTask(payload: Partial<Task>) {
    const current = this.editing();
    if (!current?.id) return;
    this.loading.set(true);
    this.taskService.update(current.id, payload).subscribe({
      next: (updated) => {
        this.tasks.set(this.tasks().map((t) => (t.id === updated.id ? updated : t)));
        this.editing.set(null);
        this.notifier.notify('Task updated', 'success');
        this.loading.set(false);
      },
      error: (err) => {
        this.notifier.notify(err.message || 'Failed to update task', 'error');
        this.loading.set(false);
      },
    });
  }

  toggleComplete(event: { id: number; completed: boolean }) {
    this.taskService.toggleComplete(event.id, event.completed).subscribe({
      next: (updated) => {
        this.tasks.set(this.tasks().map((t) => (t.id === updated.id ? updated : t)));
      },
      error: (err) => {
        this.notifier.notify(err.message || 'Failed to toggle', 'error');
      },
    });
  }

  deleteTask(id: number) {
    // eslint-disable-next-line no-alert
    if (!(globalThis as any).confirm || !(globalThis as any).confirm('Delete this task?')) return;
    this.taskService.delete(id).subscribe({
      next: () => {
        this.tasks.set(this.tasks().filter((t) => t.id !== id));
        this.notifier.notify('Task deleted', 'success');
      },
      error: (err) => {
        this.notifier.notify(err.message || 'Failed to delete task', 'error');
      },
    });
  }
}
