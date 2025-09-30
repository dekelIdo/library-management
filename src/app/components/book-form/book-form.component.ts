import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookFormComponent implements OnInit, OnDestroy {
  @Input() book: Book | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  bookForm: FormGroup;
  isEditMode = false;
  predefinedCategories = ['Fiction', 'Science', 'History', 'Biography', 'Other'];
  showCustomCategory = false;
  coverImagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private notificationService: NotificationService
  ) {
    this.bookForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.book) {
      this.isEditMode = true;
      this.populateForm();
    }
  }

  ngOnDestroy(): void {
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required]],
      year: ['', [this.bookService.yearValidator()]],
      isbn: ['', [this.bookService.isbnValidator()]],
      description: [''],
      category: ['', [Validators.required]],
      customCategory: [''],
      coverImage: ['']
    });
  }

  private populateForm(): void {
    if (this.book) {
      this.bookService.populateForm(this.bookForm, this.book, this.predefinedCategories);
      
      const category = this.book.category || '';
      const isCustomCategory = category && !this.predefinedCategories.includes(category);
      
      if (isCustomCategory) {
        this.showCustomCategory = true;
      }
      
      this.coverImagePreview = this.book.coverImage || null;
    }
  }

  

  onCategoryChange(): void {
    const category = this.bookForm.get('category')?.value;
    this.showCustomCategory = category === 'Other';
    
    if (this.showCustomCategory) {
      this.bookForm.get('customCategory')?.setValidators([Validators.required]);
    } else {
      this.bookForm.get('customCategory')?.clearValidators();
    }
    this.bookForm.get('customCategory')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      const formData = this.bookForm.value;
      
      if (formData.category === 'Other' && formData.customCategory) {
        formData.category = formData.customCategory;
      }
      
      delete formData.customCategory;
      
      try {
        if (this.isEditMode && this.book) {
          this.bookService.updateBook(this.book.id, formData);
          this.notificationService.showSuccess('Book updated successfully');
        } else {
          this.bookService.addBook(formData);
          this.notificationService.showSuccess('Book added successfully');
        }
        
        this.bookService.resetFormToDefault(this.bookForm, this.predefinedCategories);
        this.saved.emit();
      } catch (error) {
        this.notificationService.showError('Failed to save book. Please try again. ❌');
      }
    } else {
      this.bookService.markFormGroupTouched(this.bookForm);
      this.notificationService.showWarning('Please fill all required fields ⚠️');
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          this.coverImagePreview = result;
          this.bookForm.patchValue({ coverImage: result });
        };
        reader.readAsDataURL(file);
      } else {
        this.notificationService.showError('Please select a valid image file');
      }
    }
  }

  removeImage(): void {
    this.coverImagePreview = null;
    this.bookForm.patchValue({ coverImage: '' });
  }

  private resetForm(): void {
    this.bookService.resetForm(this.bookForm, this.predefinedCategories);
    this.showCustomCategory = false;
    this.coverImagePreview = null;
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  

  getFieldError(fieldName: string): string {
    const field = this.bookForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least 2 characters`;
      }
      if (field.errors['invalidYear']) {
        return 'Year must be 4 digits';
      }
      if (field.errors['invalidYearRange']) {
        return 'Year must be between 1000 and current year';
      }
      if (field.errors['invalidIsbn']) {
        return 'ISBN must be 10-17 digits with optional hyphens';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      author: 'Author',
      year: 'Year',
      isbn: 'ISBN',
      description: 'Description',
      category: 'Category',
      customCategory: 'Custom Category',
      coverImage: 'Cover Image'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  getDefaultBookImage(): string {
    return this.bookService.getDefaultBookImage();
  }
}
