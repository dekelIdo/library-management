import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';

import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { BookDetailComponent } from '../book-detail/book-detail.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    BookDetailComponent, 
    BookFormComponent,
    NotificationComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatToolbarModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookListComponent implements OnInit {
  books$: Observable<Book[]>;
  paginatedBooks$: Observable<Book[]>;
  loading$: Observable<boolean>;
  searchQuery$ = new BehaviorSubject<string>('');
  sortQuery$ = new BehaviorSubject<string>('title');
  categoryFilter$ = new BehaviorSubject<string>('');
  showAddForm = false;
  selectedBook: Book | null = null;
  
  currentSort = 'title';
  currentCategoryFilter = '';
  availableCategories: string[] = [];
  
  // Pagination properties
  pageSize = 6; // Default page size
  pageSizeOptions = [3, 6, 9, 12, 18];
  currentPage = 0;
  totalBooks = 0;
  paginatedBooks: Book[] = [];
  private paginationSubject!: BehaviorSubject<{ pageIndex: number; pageSize: number }>;
  
  // Make Math available in template
  Math = Math;

  constructor(private bookService: BookService) {
    this.loading$ = this.bookService.loading$;
    
    // Create a subject for pagination changes
    const paginationSubject = new BehaviorSubject({ pageIndex: 0, pageSize: 6 });
    
    // Combine books, search, sort, filter, and pagination queries
    this.books$ = combineLatest([
      this.bookService.books$,
      this.searchQuery$.pipe(startWith('')),
      this.sortQuery$.pipe(startWith('title')),
      this.categoryFilter$.pipe(startWith('')),
      paginationSubject
    ]).pipe(
      map(([books, searchQuery, sortQuery, categoryFilter, pagination]) => {
        let filteredBooks = books;
        
        // Apply search filter
        if (searchQuery.trim()) {
          filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (book.category && book.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (book.status && book.status.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        // Apply category filter
        if (categoryFilter) {
          filteredBooks = filteredBooks.filter(book => book.category === categoryFilter);
        }
        
        // Apply sorting
        const sortedBooks = this.sortBooks(filteredBooks, sortQuery);
        
        // Update total books count
        this.totalBooks = sortedBooks.length;
        
        // Apply pagination
        const startIndex = pagination.pageIndex * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        this.paginatedBooks = sortedBooks.slice(startIndex, endIndex);
        
        return this.paginatedBooks;
      })
    );
    
    // Create paginated books observable
    this.paginatedBooks$ = this.books$;
    
    // Store pagination subject for later use
    this.paginationSubject = paginationSubject;
  }

  ngOnInit(): void {
    // Load available categories for filter dropdown
    this.bookService.books$.subscribe(books => {
      const categories = [...new Set(books.map(book => book.category).filter(Boolean))] as string[];
      this.availableCategories = categories.sort();
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery$.next(target.value);
    this.resetPagination();
  }

  onSortDropdownChange(event: any): void {
    this.currentSort = event.value;
    this.sortQuery$.next(event.value);
    this.resetPagination();
  }

  onCategoryFilterChange(event: any): void {
    this.currentCategoryFilter = event.value;
    this.categoryFilter$.next(event.value);
    this.resetPagination();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginationSubject.next({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }

  onSortChange(event: Sort): void {
    const sortField = event.active;
    const sortDirection = event.direction;
    
    if (sortDirection === '') {
      this.currentSort = 'title';
    } else {
      this.currentSort = sortDirection === 'desc' ? `${sortField}-desc` : sortField;
    }
    
    this.sortQuery$.next(this.currentSort);
    this.resetPagination();
  }

  private resetPagination(): void {
    this.currentPage = 0;
    this.paginationSubject.next({ pageIndex: 0, pageSize: this.pageSize });
  }

  onResetFilters(): void {
    // Reset all filters and search
    this.searchQuery$.next('');
    this.sortQuery$.next('title');
    this.categoryFilter$.next('');
    this.currentSort = 'title';
    this.currentCategoryFilter = '';
    this.resetPagination();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQuery$.value.trim() || 
      this.currentCategoryFilter || 
      this.currentSort !== 'title'
    );
  }

  trackByBookId(index: number, book: Book): string {
    return book.id;
  }

  onAddBook(): void {
    this.showAddForm = true;
    this.selectedBook = null;
  }

  onEditBook(book: Book): void {
    this.selectedBook = book;
    this.showAddForm = true;
  }

  onViewBook(book: Book): void {
    this.selectedBook = book;
    this.showAddForm = false;
  }

  onDeleteBook(book: Book): void {
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
      this.bookService.deleteBook(book.id);
    }
  }

  onFormClose(): void {
    this.showAddForm = false;
    this.selectedBook = null;
  }

  onBookSaved(): void {
    this.showAddForm = false;
    this.selectedBook = null;
  }

  getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      'Fiction': 'primary',
      'Science': 'accent',
      'History': 'warn',
      'Biography': 'primary',
      'Other': 'accent'
    };
    return colorMap[category] || 'primary';
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'Want to Read': 'accent',
      'Currently Reading': 'primary',
      'Read': 'warn'
    };
    return colorMap[status] || 'primary';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Want to Read': 'bookmark_border',
      'Currently Reading': 'auto_stories',
      'Read': 'check_circle'
    };
    return iconMap[status] || 'book';
  }

  private sortBooks(books: Book[], sortBy: string): Book[] {
    return [...books].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'author-desc':
          return b.author.localeCompare(a.author);
        case 'year':
          return (parseInt(a.year || '0') - parseInt(b.year || '0'));
        case 'year-desc':
          return (parseInt(b.year || '0') - parseInt(a.year || '0'));
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });
  }

}
