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
  yearFilter$ = new BehaviorSubject<string>('');
  isbnFilter$ = new BehaviorSubject<string>('');
  showAddForm = false;
  selectedBook: Book | null = null;
  
  currentSort = 'title';
  currentCategoryFilter = '';
  availableCategories: string[] = [];
  
  sortOptions = [
    { value: 'title', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'author', label: 'Author A-Z' },
    { value: 'author-desc', label: 'Author Z-A' },
    { value: 'year', label: 'Year (Oldest First)' },
    { value: 'year-desc', label: 'Year (Newest First)' },
    { value: 'category', label: 'Category' }
  ];
  
  // Pagination properties
  pageSize = 6; // Default page size
  pageSizeOptions = [3, 6, 9, 12, 18];
  currentPage = 0;
  totalBooks = 0;
  paginatedBooks: Book[] = [];
  private paginationSubject!: BehaviorSubject<{ pageIndex: number; pageSize: number }>;
  Math = Math;

  constructor(private bookService: BookService) {
    this.loading$ = this.bookService.loading$;
    const paginationSubject = new BehaviorSubject({ pageIndex: 0, pageSize: 6 });
    this.books$ = combineLatest([
      this.bookService.books$,
      this.searchQuery$.pipe(startWith('')),
      this.sortQuery$.pipe(startWith('title')),
      this.categoryFilter$.pipe(startWith('')),
      this.yearFilter$.pipe(startWith('')),
      this.isbnFilter$.pipe(startWith('')),
      paginationSubject
    ]).pipe(
      map(([books, searchQuery, sortQuery, categoryFilter, yearFilter, isbnFilter, pagination]) => {
        const filteredBooks = this.bookService.filterBooks(books, {
          searchQuery,
          category: categoryFilter,
          year: yearFilter,
          isbn: isbnFilter
        });
        const sortedBooks = this.bookService.sortBooks(filteredBooks, sortQuery);
        this.totalBooks = sortedBooks.length;
        this.paginatedBooks = this.bookService.paginate(sortedBooks, pagination.pageIndex, pagination.pageSize);
        return this.paginatedBooks;
      })
    );
    
    this.paginatedBooks$ = this.books$;
    this.paginationSubject = paginationSubject;
  }

  ngOnInit(): void {
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

  onYearFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.yearFilter$.next(target.value);
    this.resetPagination();
  }

  onIsbnFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.isbnFilter$.next(target.value);
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
    this.currentSort = this.bookService.computeSortKey(sortField, sortDirection, 'title');
    this.sortQuery$.next(this.currentSort);
    this.resetPagination();
  }

  private resetPagination(): void {
    this.currentPage = 0;
    this.paginationSubject.next({ pageIndex: 0, pageSize: this.pageSize });
  }

  onResetFilters(): void {
    this.searchQuery$.next('');
    this.sortQuery$.next('title');
    this.categoryFilter$.next('');
    this.yearFilter$.next('');
    this.isbnFilter$.next('');
    this.currentSort = 'title';
    this.currentCategoryFilter = '';
    this.resetPagination();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQuery$.value.trim() || 
      this.currentCategoryFilter || 
      this.yearFilter$.value.trim() ||
      this.isbnFilter$.value.trim() ||
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
    return this.bookService.getCategoryColor(category);
  }

  getBookImage(book: Book): string {
    return this.bookService.getBookImage(book);
  }
}
