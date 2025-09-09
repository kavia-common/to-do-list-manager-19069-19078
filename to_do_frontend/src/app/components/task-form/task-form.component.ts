import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';

/**
 * PUBLIC_INTERFACE
 * TaskFormComponent renders a small form to create or edit a task.
 * Inputs:
 *  - model?: Task | null
 * Outputs:
 *  - save: emits Partial<Task> on submit
 *  - cancel: emits void when cancel is clicked
 */
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
})
export class TaskFormComponent {
  @Input() model: Task | null = null;
  @Output() save = new EventEmitter<Partial<Task>>();
  @Output() cancel = new EventEmitter<void>();

  title = signal<string>('');
  description = signal<string>('');
  dueDate = signal<string | null>(null);

  isEdit = computed(() => !!this.model?.id);

  ngOnChanges(): void {
    if (this.model) {
      this.title.set(this.model.title ?? '');
      this.description.set(this.model.description ?? '');
      this.dueDate.set(this.model.dueDate ?? null);
    } else {
      this.title.set('');
      this.description.set('');
      this.dueDate.set(null);
    }
  }

  onSubmit() {
    const payload: Partial<Task> = {
      title: this.title().trim(),
      description: this.description().trim(),
      dueDate: this.dueDate() || null,
      completed: this.model?.completed ?? false,
    };
    if (!payload.title) {
      return;
    }
    this.save.emit(payload);
  }

  onCancel() {
    this.cancel.emit();
  }
}
