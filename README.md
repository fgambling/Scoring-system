# Automatic Scoring System

A full-stack web application for automated test scoring with role-based access control and intelligent answer evaluation.

## 🎯 Project Overview

The Automatic Scoring System is designed to streamline the process of grading tests and assessments. It provides automated scoring capabilities with configurable marking rules, manual review options, and comprehensive reporting features.

### Key Features

- **Automated Scoring**: Intelligent answer evaluation with configurable marking rules
- **Role-Based Access Control**: Different interfaces for Admins, Test Developers, and Markers
- **Manual Review**: Flagged answers can be reviewed and manually scored
- **Excel Integration**: Import student answers and export results via Excel files
- **Real-time Reporting**: Live marking progress and statistics
- **Spelling & Grammar Checks**: Advanced linguistic analysis for answer evaluation

## 🏗️ Architecture

### Backend (NestJS)

- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Documentation**: Swagger/OpenAPI
- **Rate Limiting**: Built-in throttling to prevent API abuse

### Frontend (Next.js)

- **Framework**: Next.js 14 with React 18
- **Styling**: Material-UI (MUI) with Tailwind CSS
- **State Management**: React Context API
- **Routing**: Next.js App Router
- **HTTP Client**: Axios for API communication

## 👥 User Roles

### Admin

- User management (create, edit, delete users)
- System monitoring and administration
- Access to all system features

### Test Developer

- Create and manage tests
- Configure marking rules and answer keys
- Upload student answer files
- Monitor marking progress
- Download results and reports

### Marker

- Review flagged answers
- Manual scoring of flagged responses
- View marking statistics
- Access to assigned tests only

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd TT-scoring-backend-dev
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the backend root directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/scoring-system
   JWT_SECRET=your-jwt-secret-key
   PORT=8081
   ```

4. **Start the development server**:

   ```bash
   npm run start:dev
   ```

   The backend will be available at `http://localhost:8081`
   API documentation will be available at `http://localhost:8081/api`

### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd TT-Scoring-FrontEnd-dev/src/tt-frontend-final
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
Scoring-system/
├── TT-scoring-backend-dev/          # Backend application
│   ├── src/
│   │   ├── auth/                    # Authentication module
│   │   ├── users/                   # User management
│   │   ├── tests/                   # Test management
│   │   ├── auto-mark/               # Automatic scoring
│   │   ├── manual-mark/             # Manual marking
│   │   ├── database/                # Database configuration
│   │   └── common/                  # Shared utilities
│   └── package.json
├── TT-Scoring-FrontEnd-dev/         # Frontend application
│   └── src/tt-frontend-final/
│       ├── src/
│       │   ├── app/                 # Next.js app router
│       │   ├── components/          # React components
│       │   ├── context/             # React context providers
│       │   ├── hooks/               # Custom React hooks
│       │   ├── interface/           # TypeScript interfaces
│       │   └── utils/               # Utility functions
│       └── package.json
└── README.md
```

## 🔧 Configuration

### Marking Rules

The system supports configurable marking rules for different types of errors:

- **Case Sensitivity**: Flag or mark incorrect for case mistakes
- **Punctuation**: Flag or mark incorrect for punctuation errors
- **Spelling**: Flag or mark incorrect for spelling mistakes
- **Grammar**: Flag or mark incorrect for grammatical errors
- **Contractions**: Flag or mark incorrect for contraction usage

### Answer Keys

Each question can have multiple correct answers with:

- Primary answer key
- Alternative acceptable answers
- Case-insensitive matching options
- Regular expression support

## 📊 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Tests

- `GET /tests` - List tests
- `POST /tests` - Create test
- `PUT /tests/:id` - Update test
- `DELETE /tests/:id` - Delete test

### Auto Marking

- `POST /auto-mark/:id` - Start automatic marking
- `GET /auto-mark/report/:id` - Get marking report
- `GET /auto-mark/download/:id` - Download results

### Manual Marking

- `GET /manual-mark/flagged/:id` - Get flagged answers
- `PUT /manual-mark/score/:id` - Score flagged answer

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions per user role
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Cross-origin request handling

## 🧪 Testing

### Backend Testing

```bash
cd TT-scoring-backend-dev
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Frontend Testing

```bash
cd TT-Scoring-FrontEnd-dev/src/tt-frontend-final
npm run test          # Unit tests
```

## 📈 Performance

- **Database Indexing**: Optimized MongoDB queries
- **Caching**: JWT token caching
- **Rate Limiting**: Prevents API abuse
- **Lazy Loading**: Frontend component optimization
- **Image Optimization**: Next.js built-in optimization

## 🚀 Deployment

### Backend Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm run start:prod
   ```

### Frontend Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api` endpoint

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added manual marking features
- **v1.2.0** - Enhanced reporting and export capabilities
- **v1.3.0** - Improved UI/UX and performance optimizations

---

**Note**: This is a development version of the Automatic Scoring System. For production use, ensure proper security configurations and environment setup.
