# TT-Scoring Project - Backend

## Project Overview

This is a backend repository for a **transcript test project**. It primarily provides API interfaces, processes frontend requests, and returns data.

## Features

**Auth**

- [x] User Authentication - implementing user login and register features

- [x] User Authorization - implementing permission check for Admin, Test Developer, and Marker.

**Users**

- [x] User Profile - getting user profile based on the cookie.

**Test**

- [x] Test Management - allowing Test Developers to modify, add, copy, and delete tests.
- [x] Question Management - allowing Test Devlopers to add, modify, delete questions for each test.  
- [x] Key Generation - enabling the system to generate alternative keys for each set key, with the ability for Test Developers to freely select and add new alternative keys.
- [x] Reading Excel Files - enabling the system to automatically read imported Excel files to retrieve predefined keys and alternative words.
- [x] Update Save Test API: Implemented functionality to save rating scales for each question.

**Auto Mark**

- [x] Automatic Marking and Regex Creation - Updated the system to automatically mark tests and create regular expressions to match answers。
- [x] Assign Marker Endpoint - Implemented an endpoint that allows assigning markers to specific tests.
- [x] Download Results - Developed a function that enables users to download marking results directly from the system

**Security**

- [x] Rate Limiting for Login Endpoint - Implemented rate limiting on the login endpoint.

## Getting Started

### Requirements

Nodejs (version **>= 16**)

### Installation

```bash
# Clone the repository
$ git clone 
# Go to the root directory
$ cd TT-scoring-backend
# Install dependencies
$ npm install
# Install python libraries
$ sh python-req.sh
# Start the application
$ npm run start:dev
```

### Application Port

To modify the application's port, you can find the configuration in `/src/main.ts`:

```typescript
// Change 8081 to your custom port
await app.listen(8081);
```

### Database Configuration

In the `src/database/database_providers.ts` file, set up the **MongoDB** connection. We recommmond you to use the environment variable, which helps in keeping your database credentials secure. 

```typescript
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(
        'This is your mongoDB configuration',
      ),
  },
];
```

## Swagger API

We use Swagger API to list all endpoints. You can access it through `http://localhost:8081/api`.

## Directory Structure

```bash
/TT-Scoring Project - Backend
|-- /src
|   |-- /auth            # Authentication and authorization logic(JWT, Guards, etc.)
|   |-- /users           # User management
|   |-- /database        # Database connection configuration
|   |-- /common          # Shared modules, utilities, and services
|   |-- /tests           # Directory for all test-related operations including creating, assigning, and managing tests
|   |-- /manual-mark     # Dedicated space for activities related to manually marking student answers, particularly for flagged responses
|   |-- /auto-mark       # Handles all aspects of automatic marking, including configuration, regular expression management, and execution
|-- /python              # Python scripts for keys check and generation
|-- /docs                # Documentation and design documents
|-- /tests               # Test cases and testing scripts
|-- .eslintrc.js         # ESLint configuration for linting JavaScript/TypeScript code
|-- .gitignore           # Specifies intentionally untracked files to ignore
|-- .prettierrc          # Prettier configuration for code formatting
|-- nest-cli.json        # Configuration for Nest CLI
|-- package.json         # Project metadata and dependencies
|-- package-lock.json    # Automatically generated file for NPM dependencies
|-- tsconfig.json        # TypeScript configuration for the project
|-- tsconfig.build.json  # TypeScript configuration for the build
|-- README.md            # Project overview and guidelines
|-- .env                 # Environment variables (not tracked by Git)
|-- python-req.sh        # Shell script for installing required python libraries
```

## CHANGELOG

All notable changes to this project will be documented in this section.

#### Added

- **Database Connection**: Established connection with MongoDB and completed the design of the User schema.
- **User Authentication**: Implemented user login and registration features。
- **User Authorization**: Implemented permission checks for different roles, including Admin, Test Developer, and Marker. Introduced support for setting permissions using annotations in the code.
- **User Profile**: Added functionality to retrieve user profiles based on the cookie information。
- **API Documentation**: Integrated Swagger for API documentation.

#### Added

- **Test Management**: Implemented functionality that allows Test Developers to modify, add, and delete tests, ensuring dynamic test handling within the system.
- **Question Management**: Implemented functionality that allows Test Developers to modify, add, and delete questions for each test.
- **Key Generation**: Developed a system feature that generates alternative keys for each set key. Test Developers have the capability to freely select and add new alternative keys, enhancing the flexibility of test configurations.
- **Reading Excel Files**: Enabled the system to automatically read imported Excel files to retrieve predefined keys and alternative words.

#### Added

- **Update Save Test API**: Implemented functionality to save rating scales for each question, ensuring precise and customizable evaluation criteria.
- **Automatic Marking and Regex Creation**: Updated the system to automatically mark tests and create regular expressions to match answers.
- **Assign Marker Endpoint**: Implemented an endpoint that allows assigning markers to specific tests.
- **Download Results**: Developed a function that enables users to download marking results directly from the system。
- **Rate Limiting for Login Endpoint**: Implemented rate limiting on the login endpoint to prevent abuse and ensure fair usage.

#### Added

- **Manual Marking Functionality**: Introduced the ability to manually mark flagged student answers, enabling detailed review and scoring of responses that cannot be automatically graded.
- **Admin Interface**: Launched a new admin interface designed to manage user accounts efficiently.
