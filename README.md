# ChromaMind

<img width="1895" height="912" alt="image" src="https://github.com/user-attachments/assets/6991621e-ad95-477b-ba0f-bbe52583fd53" />
https://brunolim1200.github.io/ChromaMind/

## Project Structure

The project is organized into two main directories: `backend` and `frontend`.

### Backend

The backend is developed using FastAPI, a modern web framework for building APIs with Python. The structure includes:

- `app`: Contains the main application logic, including API routes, database models, and configuration.
- `tests`: Contains unit tests for the application.
- `requirements.txt`: Lists the dependencies required for the backend application.
- `alembic.ini`: Configuration file for Alembic, used for database migrations.

### Frontend

The frontend is developed using Angular, a platform for building mobile and desktop web applications. The structure includes:

- `src`: Contains the main application code, including components, services, and pages.
- `assets`: Contains static assets such as images and icons.
- `environments`: Contains environment-specific settings for production and development.
- `angular.json`: Configuration file for the Angular project.
- `package.json`: Lists dependencies and scripts for the frontend application.
- `tailwind.config.js`: Configures Tailwind CSS for styling.

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js and npm
- Angular CLI

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ChromaMind
   ```

2. Set up the backend:
   - Navigate to the `backend` directory.
   - Install the required Python packages:
     ```
     pip install -r requirements.txt
     ```
   - Copy `.env.example` to `.env` and configure:
     ```
     cp .env.example .env
     ```

3. Set up the frontend:
   - Navigate to the `frontend` directory.
   - Install the required Node packages:
     ```
     npm install
     ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   uvicorn app.main:app --reload
   ```

2. Start the frontend development server:
   ```
   cd frontend
   ng serve
   ```

Visit `http://localhost:4200` to access the frontend application and `http://localhost:8000` for the backend API.

### Environment Variables

**Backend** (`.env`):
- `DEBUG`: Enable debug mode (default: False)
- `CORS_ORIGINS`: Comma-separated list of allowed origins (supports GitHub Pages with `*.github.io`)

**Frontend**:
- `environment.ts`: Production API URL
- `environment.development.ts`: Development API URL (default: `http://localhost:8000/api/v1`)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
