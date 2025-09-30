import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly STORAGE_KEY = 'library_books';
  private readonly API_BASE_URL = 'https://api.example.com/books'; // Future API endpoint
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
        // Then check if there are user-added books in localStorage
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
        
        // Merge user-added books first, then initial books
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
    // This method will be replaced with API call in the future
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
          // Fallback to embedded initial books if JSON fails
          const fallbackBooks = this.getInitialBooks();
          observer.next(fallbackBooks);
          observer.complete();
        });
    });
  }

  private getInitialBooks(): Book[] {
    // Fallback initial books if JSON file cannot be loaded
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

  // Future API integration method
  private loadBooksFromApi(): Observable<Book[]> {
    // This will be implemented when switching to real API
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
    // Add new book at the beginning of the list (top of gallery)
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

  // Method to reset data and reload from JSON (useful for testing)
  resetToInitialData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.loadBooks();
  }
}
