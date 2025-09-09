import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';

/**
 * PUBLIC_INTERFACE
 * TaskListItemComponent displays a single task with controls for toggle, edit, and delete.
 * Inputs:
 *  - task: Task
 * Outputs:
 *  - toggled: emits { id, completed }
 *  - edit: emits task to edit
 *  - remove: emits id to delete
 */
@Component({
  selector: 'app-task-list-item',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './task-list-item.component.html',
  styleUrls: ['./task-list-item.component.css'],
})
export class TaskListItemComponent {
  @Input({ required: true }) task!: Task;
  @Output() toggled = new EventEmitter<{ id: number; completed: boolean }>();
  @Output() edit = new EventEmitter<Task>();
  @Output() remove = new EventEmitter<number>();

  onToggleChange(ev: unknown) {
    const inputEl = ev && typeof ev === 'object' && 'target' in (ev as any) ? (ev as any).target as any : undefined;
    const checked = !!(inputEl && 'checked' in inputEl ? inputEl.checked : false);
    if (this.task.id != null) {
      this.toggled.emit({ id: this.task.id, completed: checked });
    }
  }

  onEdit() {
    this.edit.emit(this.task);
  }

  onDelete() {
    if (this.task.id != null) {
      this.remove.emit(this.task.id);
    }
  }
}
