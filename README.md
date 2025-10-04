# 🧾 Expense Tracker

A complete expense tracking system with **OCR receipt processing**, **real-time currency conversion**, and **premium UI design**.

## 🎯 Hackathon Features

### ✨ OCR Receipt Processing
- **Tesseract.js** integration for automatic data extraction
- Extracts: amount, date, vendor, category
- Confidence scoring and manual editing
- Supports JPG, PNG images

### 💱 Real-time Currency Conversion  
- Live exchange rates from API
- USD, EUR, GBP, CAD, AUD support
- Automatic conversion to company base currency
- Visual conversion display

### 🎨 Premium UI/UX
- **Purple-blue gradients** and **glassmorphism** effects
- Smooth animations and hover effects
- **React Hot Toast** notifications
- Fully mobile responsive

### ⚡ Approval Workflow
- Manager approval cards with employee info
- Receipt thumbnails and OCR details
- Real-time status updates
- Approve/reject with comments

## 📧 Demo Accounts

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Employee** | employee@demo.com | employee123 | OCR submission, currency conversion |
| **Manager** | manager@demo.com | manager123 | Expense approvals, team oversight |
| **Admin** | admin@demo.com | admin123 | User management, system overview |

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for server state management
- React Hook Form for form handling
- Vite for build tooling

### Backend
- Node.js with Express.js
- Prisma ORM with PostgreSQL
- JWT authentication
- bcryptjs for password hashing
- Express validation and security middleware

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## 🚀 Quick Demo Start

```bash
# One-command demo startup
./start-demo.ps1
```

**Or manually:**
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🎬 5-Minute Demo Flow

1. **Employee Login** → Upload receipt → Watch OCR extract data
2. **Currency Demo** → Select EUR/GBP → See real-time conversion  
3. **Manager Login** → View approval cards → Approve/reject expenses
4. **Mobile Demo** → Show responsive design on phone
5. **Admin Panel** → User management and system overview

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/expense_manager"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="Expense Manager"
```

## Project Structure

```
expense-manager/
├── backend/                 # Node.js/Express API
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── middleware/     # Authentication and validation
│   │   ├── routes/         # API route handlers
│   │   └── server.js       # Express server setup
│   └── package.json
├── frontend/               # React/TypeScript app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── lib/           # API client and utilities
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript type definitions
│   │   └── main.tsx       # App entry point
│   └── package.json
└── package.json           # Root package.json with scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `GET /api/auth/countries` - Get countries list for signup

### Protected Routes (require authentication)
- `/api/users` - User management (Admin/Manager)
- `/api/companies` - Company management (Admin)
- `/api/expenses` - Expense management (All roles)
- `/api/approvals` - Approval management (Manager+)
- `/api/rules` - Approval rules (Manager+)

## User Roles

### Admin
- Full system access
- User management
- Company settings
- Approval rule configuration
- System-wide reports

### Manager
- Team expense approvals
- Approval rule management
- Team reports
- User management (limited)

### Employee
- Expense submission
- Personal expense tracking
- Receipt upload
- Expense history

## Development

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend in development mode
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build frontend for production
npm run build

# Start production server
npm start
```

### Database Operations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create and run migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio
```

## Authentication Flow

1. **Signup**: User creates account with company information
2. **Company Creation**: System automatically creates company with country-based currency
3. **Admin Assignment**: First user becomes company admin
4. **Login**: JWT token issued for authenticated sessions
5. **Role-Based Access**: Routes and features restricted by user role

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Role-based route protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details