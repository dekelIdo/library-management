# Library Management System

A simple Angular application for managing a personal book library with full CRUD operations, search functionality, and responsive design.
You can visit here - https://library-management-aqwp.onrender.com/

## Features

- **Book Management**: Add, edit, delete, and view book details
- **Search**: Real-time search by book title (case-insensitive)
- **Modern UI**: Clean, intui
<img width="937" height="842" alt="image" src="https://github.com/user-attachments/assets/bef58a8f-5061-4ac0-9fb1-b5c4bd277051" />


- **Form Validation**: Comprehensive validation for all book fields
<img width="937" height="842" alt="form page" src="https://github.com/user-attachments/assets/9f326884-70e7-4ffa-ad31-3595e2a3426e" />


- **Responsive Design**: Works on desktop and mobile devices
<img width="937" height="842" alt="responsive screens" src="https://github.com/user-attachments/assets/78f75fff-8342-40ea-925e-d929b3563674" />

 
- **Data Persistence**: Changes are saved to localStorage
tive interface with modal dialogs

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
