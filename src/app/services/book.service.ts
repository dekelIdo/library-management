import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { catchError, tap } from 'rxjs/operators';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly STORAGE_KEY = 'library_books';
  private readonly API_BASE_URL = 'https://api.example.com/books';
  private readonly DEFAULT_BOOK_IMAGE = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center';
  private booksSubject = new BehaviorSubject<Book[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  public books$ = this.booksSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadBooks();
  }

  private loadBooks(): void {
    this.loadingSubject.next(true);
    
    this.loadBooksFromJson().subscribe({
      next: (initialBooks) => {
        const storedBooks = localStorage.getItem(this.STORAGE_KEY);
        let userAddedBooks: Book[] = [];
        
        if (storedBooks) {
          try {
            const allStoredBooks = JSON.parse(storedBooks);
            userAddedBooks = allStoredBooks.filter((storedBook: Book) => 
              !initialBooks.some(initialBook => initialBook.id === storedBook.id)
            );
          } catch (error) {
            console.warn('Failed to parse stored books:', error);
          }
        }
        
        const allBooks = [...userAddedBooks, ...initialBooks];
        this.booksSubject.next(allBooks);
        this.saveBooks(allBooks);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Failed to load books from JSON:', error);
        const storedBooks = localStorage.getItem(this.STORAGE_KEY);
        if (storedBooks) {
          try {
            const books = JSON.parse(storedBooks);
            this.booksSubject.next(books);
          } catch (parseError) {
            console.error('Failed to parse stored books:', parseError);
            this.booksSubject.next([]);
          }
        } else {
          this.booksSubject.next([]);
        }
        this.loadingSubject.next(false);
      }
    });
  }

  private loadBooksFromJson(): Observable<Book[]> {
    return new Observable(observer => {
      fetch('/assets/books.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(books => {
          observer.next(books);
          observer.complete();
        })
        .catch(error => {
          console.error('Error loading books from JSON:', error);
          const fallbackBooks = this.getInitialBooks();
          observer.next(fallbackBooks);
          observer.complete();
        });
    });
  }

  private getInitialBooks(): Book[] {
    return [
      {
        id: "1",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        year: "1925",
        isbn: "9780743273565",
        description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
        category: "Fiction"
      },
      {
        id: "2",
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        year: "1988",
        isbn: "9780553380163",
        description: "A landmark volume in science writing by one of the great minds of our time, exploring the universe and its mysteries.",
        category: "Science"
      },
      {
        id: "3",
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        year: "2011",
        isbn: "9780062316097",
        description: "An exploration of how Homo sapiens came to dominate the world, examining the cognitive, agricultural, and scientific revolutions.",
        category: "History"
      },
      {
        id: "4",
        title: "Becoming",
        author: "Michelle Obama",
        year: "2018",
        isbn: "9781524763138",
        description: "An intimate memoir by the former First Lady, sharing her journey from childhood to the White House.",
        category: "Biography"
      },
      {
        id: "5",
        title: "The Art of War",
        author: "Sun Tzu",
        year: "500 BC",
        isbn: "9781590309637",
        description: "An ancient Chinese military treatise that has influenced military thinking, business strategy, and beyond.",
        category: "Other"
      },
      {
        id: "6",
        title: "1984",
        author: "George Orwell",
        year: "1949",
        isbn: "9780451524935",
        description: "A dystopian social science fiction novel that explores totalitarianism and surveillance.",
        category: "Fiction"
      },
      {
        id: "7",
        title: "Cosmos",
        author: "Carl Sagan",
        year: "1980",
        isbn: "9780345539434",
        description: "A comprehensive exploration of the universe, from the smallest particles to the largest galaxies.",
        category: "Science"
      },
      {
        id: "8",
        title: "The Diary of a Young Girl",
        author: "Anne Frank",
        year: "1947",
        isbn: "9780553577129",
        description: "The diary of a young Jewish girl hiding from the Nazis during World War II.",
        category: "Biography"
      }
    ];
  }

  private loadBooksFromApi(): Observable<Book[]> {
    return of([]).pipe(
      catchError(error => {
        console.error('API call failed, falling back to JSON:', error);
        return this.loadBooksFromJson();
      })
    );
  }

  private saveBooks(books: Book[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(books));
  }

  addBook(bookData: Omit<Book, 'id'>): void {
    const currentBooks = this.booksSubject.value;
    const newBook: Book = {
      ...bookData,
      id: this.generateId()
    };
    const updatedBooks = [newBook, ...currentBooks];
    this.booksSubject.next(updatedBooks);
    this.saveBooks(updatedBooks);
  }

  updateBook(id: string, bookData: Partial<Book>): void {
    const currentBooks = this.booksSubject.value;
    const updatedBooks = currentBooks.map(book => 
      book.id === id ? { ...book, ...bookData } : book
    );
    this.booksSubject.next(updatedBooks);
    this.saveBooks(updatedBooks);
  }

  deleteBook(id: string): void {
    const currentBooks = this.booksSubject.value;
    const updatedBooks = currentBooks.filter(book => book.id !== id);
    this.booksSubject.next(updatedBooks);
    this.saveBooks(updatedBooks);
  }

  getBookById(id: string): Book | undefined {
    return this.booksSubject.value.find(book => book.id === id);
  }

  // Returns a safe image URL for a book, falling back to the default image
  getBookImage(book: Book): string {
    return (book && (book as any).coverImage) ? (book as any).coverImage : this.DEFAULT_BOOK_IMAGE;
  }

  // Expose the default image for consumers like forms/placeholders
  getDefaultBookImage(): string {
    return this.DEFAULT_BOOK_IMAGE;
  }

  sortBooks(books: Book[], sortBy: string): Book[] {
    return [...books].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'author':
          return (a.author || '').localeCompare(b.author || '');
        case 'author-desc':
          return (b.author || '').localeCompare(a.author || '');
        case 'year':
          return (parseInt(a.year || '0', 10) - parseInt(b.year || '0', 10));
        case 'year-desc':
          return (parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10));
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });
  }

  computeSortKey(active: string, direction: 'asc' | 'desc' | '', defaultKey: string = 'title'): string {
    if (!direction) {
      return defaultKey;
    }
    return direction === 'desc' ? `${active}-desc` : active;
  }

  paginate<T>(items: T[], pageIndex: number, pageSize: number): T[] {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }

  // ================= Filtering =================
  filterBooks(
    books: Book[],
    opts: {
      searchQuery?: string;
      category?: string;
      year?: string | number | null;
      isbn?: string | null;
    }
  ): Book[] {
    const search = (opts.searchQuery || '').trim().toLowerCase();
    const category = (opts.category || '').trim();
    const yearStr = (opts.year ?? '').toString().trim();
    const isbn = (opts.isbn || '').trim().toLowerCase();

    return books.filter((book) => {
      // Free text search across title, author, category
      const matchesSearch = !search || (
        (book.title || '').toLowerCase().includes(search) ||
        (book.author || '').toLowerCase().includes(search) ||
        (book.category || '').toLowerCase().includes(search)
      );

      // Exact category filter
      const matchesCategory = !category || (book.category === category);

      // Year filter supports 4-digit or partial (prefix) match to be lenient
      const matchesYear = !yearStr || (book.year || '').startsWith(yearStr);

      // ISBN filter case-insensitive, substring match for flexibility
      const matchesIsbn = !isbn || (book.isbn || '').toLowerCase().includes(isbn);

      return matchesSearch && matchesCategory && matchesYear && matchesIsbn;
    });
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

  // ============ Form helpers (validators and utilities) ============
  yearValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }
      const year: string = control.value;
      const yearRegex = /^\d{4}$/;
      if (!yearRegex.test(year)) {
        return { invalidYear: true };
      }
      const yearNum = parseInt(year, 10);
      const currentYear = new Date().getFullYear();
      if (yearNum < 1000 || yearNum > currentYear) {
        return { invalidYearRange: true };
      }
      return null;
    };
  }

  isbnValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }
      const isbn: string = control.value;
      const isbnRegex = /^[\d-]{10,17}$/;
      if (!isbnRegex.test(isbn)) {
        return { invalidIsbn: true };
      }
      return null;
    };
  }

  markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  // Form reset and population helpers
  resetForm(form: FormGroup, predefinedCategories: string[]): void {
    form.reset();
    // Reset custom category validators
    form.get('customCategory')?.clearValidators();
    form.get('customCategory')?.updateValueAndValidity();
  }

  resetFormToDefault(form: FormGroup, predefinedCategories: string[]): void {
    this.resetForm(form, predefinedCategories);
    form.patchValue({
      category: ''
    });
  }

  populateForm(form: FormGroup, book: Book, predefinedCategories: string[]): void {
    if (book) {
      const category = book.category || '';
      const isCustomCategory = category && !predefinedCategories.includes(category);
      
      form.patchValue({
        title: book.title,
        author: book.author,
        year: book.year || '',
        isbn: book.isbn || '',
        description: book.description || '',
        category: isCustomCategory ? 'Other' : category,
        customCategory: isCustomCategory ? category : '',
        coverImage: book.coverImage || ''
      });
      
      if (isCustomCategory) {
        form.get('customCategory')?.setValidators([Validators.required]);
      } else {
        form.get('customCategory')?.clearValidators();
      }
      form.get('customCategory')?.updateValueAndValidity();
    }
  }

  searchBooks(query: string): Observable<Book[]> {
    return new Observable(observer => {
      this.books$.subscribe(books => {
        if (!query.trim()) {
          observer.next(books);
        } else {
          const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase())
          );
          observer.next(filteredBooks);
        }
      });
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  resetToInitialData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.loadBooks();
  }
}
