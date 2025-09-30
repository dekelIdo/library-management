import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  showSuccess(message: string, duration: number = 3000): void {
    this.addNotification({
      id: this.generateId(),
      message,
      type: 'success',
      duration
    });
  }

  showError(message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      message,
      type: 'error',
      duration
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.addNotification({
      id: this.generateId(),
      message,
      type: 'warning',
      duration
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.addNotification({
      id: this.generateId(),
      message,
      type: 'info',
      duration
    });
  }

  private addNotification(notification: NotificationMessage): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [...currentNotifications, notification];
    this.notificationsSubject.next(updatedNotifications);

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}
