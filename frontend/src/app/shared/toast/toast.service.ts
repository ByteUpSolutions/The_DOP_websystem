import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 5000) {
    const newToast: Toast = { message, type, duration };
    this.toasts.update(toasts => [...toasts, newToast]);

    setTimeout(() => this.remove(newToast), duration);
  }

  remove(toastToRemove: Toast) {
    this.toasts.update(toasts => toasts.filter(toast => toast !== toastToRemove));
  }
}
