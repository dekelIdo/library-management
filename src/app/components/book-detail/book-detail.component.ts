import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookDetailComponent {
  @Input() book: Book | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Book>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.book) {
      this.edit.emit(this.book);
    }
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Want to Read': 'bookmark_border',
      'Currently Reading': 'auto_stories',
      'Read': 'check_circle'
    };
    return iconMap[status] || 'book';
  }
}
