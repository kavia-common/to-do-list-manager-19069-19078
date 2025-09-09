import { Injectable, signal } from '@angular/core';

/**
 * PUBLIC_INTERFACE
 * NotificationService provides transient notifications for user feedback.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  message = signal<string | null>(null);
  type = signal<'success' | 'error' | 'info'>('info');
  private timeoutRef: any;

  /** PUBLIC_INTERFACE */
  notify(message: string, type: 'success' | 'error' | 'info' = 'info', durationMs = 2500) {
    this.message.set(message);
    this.type.set(type);
    if (this.timeoutRef) {
      (globalThis as any).clearTimeout(this.timeoutRef);
    }
    this.timeoutRef = (globalThis as any).setTimeout(() => {
      this.message.set(null);
    }, durationMs);
  }

  /** PUBLIC_INTERFACE */
  clear() {
    this.message.set(null);
    if (this.timeoutRef) {
      (globalThis as any).clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }
  }
}
