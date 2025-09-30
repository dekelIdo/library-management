import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';

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

  constructor(private bookService: BookService) {}

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.book) {
      this.edit.emit(this.book);
    }
  }

  getBookImage(book: Book): string {
    return this.bookService.getBookImage(book);
  }

}
