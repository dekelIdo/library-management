# Library Management System

A simple Angular application for managing a personal book library with full CRUD operations, search functionality, and responsive design.

## Features

- **Book Management**: Add, edit, delete, and view book details
- **Search**: Real-time search by book title (case-insensitive)
- **Form Validation**: Comprehensive validation for all book fields
- **Responsive Design**: Works on desktop and mobile devices
- **Data Persistence**: Changes are saved to localStorage
- **Modern UI**: Clean, intuitive interface with modal dialogs

## Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   ng serve
   ```

3. **Open your browser:**
   Navigate to `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── book-list/          # Main list view with search
│   │   ├── book-form/          # Add/edit book form
│   │   └── book-detail/        # Book detail modal
│   ├── models/
│   │   └── book.model.ts       # TypeScript interfaces
│   ├── services/
│   │   └── book.service.ts     # Business logic & data management
│   └── app.component.*         # Root component
├── assets/
│   └── books.json              # Initial book data
└── README.md
```

## Technical Details

- **Framework**: Angular 17+ with standalone components
- **Styling**: SCSS with responsive design
- **Forms**: Reactive Forms with custom validators
- **State Management**: Simple service-based state with BehaviorSubject
- **Data Persistence**: localStorage for client-side persistence
- **Change Detection**: OnPush strategy for performance
- **Helping AI tools**: Curser ai

## Validation Rules

- **Title**: Required, minimum 2 characters
- **Author**: Required
- **Year**: Optional, must be 4 digits if provided
- **ISBN**: Optional, basic pattern validation if provided
- **Description & Category**: Optional

## Future Improvements (Production Considerations)

- **Backend Integration**: Replace localStorage with REST API
- **Authentication**: User login and book ownership
- **Unit Tests**: Comprehensive test coverage

## Development Notes

This application was built following Angular best practices with a focus on:
- Clean, maintainable code structure
- Type safety with TypeScript interfaces
- Responsive design principles
- Form validation and user experience
- Performance optimization with OnPush change detection