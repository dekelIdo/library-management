export interface Book {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly year?: string;
  readonly isbn?: string;
  readonly description?: string;
  readonly category?: string;
  readonly coverImage?: string; // Base64 encoded image
  readonly status?: 'Want to Read' | 'Currently Reading' | 'Read';
}

export interface BookFormData {
  title: string;
  author: string;
  year: string;
  isbn: string;
  description: string;
  category: string;
  coverImage?: string;
  status?: string;
}
