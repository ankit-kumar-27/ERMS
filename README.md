# Engineering Resource Management System (ERMS)

A comprehensive web application for managing engineering resources, projects, and team assignments. Built with Node.js/Express backend and React/TypeScript frontend.

## 🚀 Features

### Manager Dashboard
- **Team Overview**: View all engineers with their skills, capacity, and current allocations
- **Project Management**: Create, view, and manage projects with search and filter capabilities
- **Assignment Management**: Assign engineers to projects with allocation percentages and date ranges
- **Profile Management**: View and manage manager profile information

### Engineer Dashboard
- **Assignment View**: View current project assignments and details
- **Profile Management**: Update skills, seniority, and capacity settings

### Authentication & Authorization
- Role-based access control (Manager/Engineer)
- JWT token authentication
- Secure password handling

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database operations
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **React DatePicker** - Date selection
- **Axios** - HTTP client

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Engineering_Resource_Management_System-main
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Database Configuration

1. Create a MySQL database:
```sql
CREATE DATABASE erms_db;
```

2. Update database configuration in `config/database.js`:
```javascript
module.exports = {
  development: {
    username: 'your_username',
    password: 'your_password',
    database: 'erms_db',
    host: '127.0.0.1',
    dialect: 'mysql'
  }
};
```

3. Run database migrations:
```bash
npx sequelize-cli db:migrate
```

#### Environment Variables

Create a `.env` file in the backend directory:
```env
JWT_SECRET=your_jwt_secret_key_here
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=erms_db
PORT=3000
```

### 3. Frontend Setup

```bash
cd erms-client
npm install
```

## 🎯 Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm start
```

The backend server will start on `http://localhost:3000`

### 2. Start the Frontend Development Server

```bash
cd erms-client
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🌱 Seed Data Setup

### Running Seed Scripts

The project includes a comprehensive seed script to populate the database with initial data:

```bash
cd backend
node scripts/seedData.js
```

### What the Seed Script Creates

The seed script creates the following data:

**1 Manager:**
- Email: `ankit.kumar@geekyants.com`
- Password: `ankit123`
- Name: Ankit Kumar
- Role: manager

**4 Engineers:**
1. **Ankit Aryan** - Senior Engineer
   - Email: `ankit.kumar.it@geekyants.com`
   - Skills: React, Node.js, TypeScript, MySQL
   - Max Capacity: 100%

2. **Abcd Pqrs** - Mid-level Engineer
   - Email: `abcd@geekyants.com`
   - Skills: Python, Django, PostgreSQL
   - Max Capacity: 100%

3. **Test Test** - Junior Engineer
   - Email: `test@geekyants.com`
   - Skills: React, Vue.js, CSS
   - Max Capacity: 50%

4. **Mr Kumar** - Senior Engineer
   - Email: `test2@geekyants.com`
   - Skills: Node.js, MongoDB, Express
   - Max Capacity: 100%

**4 Projects:**
1. **HRMS** - Human Resource Management System
2. **Data Analytics Dashboard** - Python-based analytics
3. **E-Commerce Web App** - Vue.js shopping platform
4. **Internal DevOps Tool** - Automated deployments

**6 Assignments:**
- Various engineer-project combinations with different allocation percentages and roles

### Default Login Credentials

After running the seed script, you can use these default accounts:

**Manager Account:**
- Email: `ankit.kumar@geekyants.com`
- Password: `ankit123`

**Engineer Accounts:**
- Email: `ankit.kumar.it@geekyants.com` / Password: `ankit123`
- Email: `abcd@geekyants.com` / Password: `ankit123`
- Email: `test@geekyants.com` / Password: `ankit123`
- Email: `test2@geekyants.com` / Password: `ankit123`

**Note:** All accounts use the same password: `ankit123`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user (manager or engineer)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "engineer",
  "skills": ["React", "Node.js"],
  "seniority": "mid",
  "maxCapacity": 80,
  "department": "Engineering"
}
```

#### POST `/api/auth/login`
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Project Endpoints

#### GET `/api/projects`
Get all projects (requires authentication)

#### POST `/api/projects`
Create a new project (manager only)

**Request Body:**
```json
{
  "name": "Project Name",
  "description": "Project description",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "requiredSkills": ["React", "Node.js"],
  "teamSize": 5,
  "status": "planning"
}
```

### Engineer Endpoints

#### GET `/api/engineers`
Get all engineers (requires authentication)

#### GET `/api/engineers/:id/capacity`
Get engineer capacity and current assignments

### Assignment Endpoints

#### GET `/api/assignments`
Get all assignments (supports filtering by engineerId, projectId)

#### POST `/api/assignments`
Create a new assignment (manager only)

**Request Body:**
```json
{
  "engineerId": 1,
  "projectId": 1,
  "allocationPercentage": 50,
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "role": "Developer"
}
```

## 🏗 Project Structure

```
Engineering_Resource_Management_System-main/
├── backend/
│   ├── config/
│   │   └── database.js
│   │   └── middleware/
│   │   └── auth.js
│   │   └── models/
│   │   │   ├── Assignment.js
│   │   │   ├── Project.js
│   │   │   └── User.js
│   │   └── routes/
│   │   │   ├── assignments.js
│   │   │   ├── auth.js
│   │   │   ├── engineers.js
│   │   │   └── projects.js
│   │   └── scripts/
│   │   └── seedData.js
│   │   └── server.js
│   └── package.json
├── erms-client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ManagerDashboard.tsx
│   │   │   ├── EngineerDashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   └── projectService.ts
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   └── ...
│   └── package.json
└── README2.md
```

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev  # Start with nodemon for development
```

### Frontend Development

```bash
cd erms-client
npm run dev  # Start Vite dev server
```

### Database Migrations

```bash
# Create a new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd erms-client
npm test
```

## 🚀 Deployment

### Backend Deployment

1. Set production environment variables
2. Build the application:
```bash
npm run build
```
3. Start production server:
```bash
npm start
```

### Frontend Deployment

1. Build for production:
```bash
npm run build
```
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Verify database connection and configuration
3. Ensure all dependencies are installed
4. Check that the backend server is running on port 3000
5. Verify JWT token is being sent in request headers

## 🔄 Updates and Maintenance

- Regularly update dependencies
- Monitor database performance
- Keep JWT secrets secure
- Backup database regularly
- Monitor API usage and errors

---

**Happy Coding! 🎉** 
