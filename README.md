# Automatic Scoring System

A full-stack web application for automated test scoring with role-based access control and intelligent answer evaluation, deployed on AWS cloud infrastructure.

## 🎯 Project Overview

The Automatic Scoring System is designed to streamline the process of grading tests and assessments. It provides automated scoring capabilities with configurable marking rules, manual review options, and comprehensive reporting features. The system is built with modern cloud-native architecture and deployed on AWS for high availability and scalability.

### Key Features

- **Automated Scoring**: Intelligent answer evaluation with configurable marking rules
- **Role-Based Access Control**: Different interfaces for Admins, Test Developers, and Markers
- **Manual Review**: Flagged answers can be reviewed and manually scored
- **Excel Integration**: Import student answers and export results via Excel files
- **Real-time Reporting**: Live marking progress and statistics
- **Spelling & Grammar Checks**: Advanced linguistic analysis for answer evaluation
- **Cloud-Native Architecture**: Built for AWS deployment with auto-scaling capabilities
- **High Availability**: Multi-AZ deployment with load balancing and failover

## ☁️ AWS Infrastructure

### **Production Deployment**

- **EC2 Instances**: Auto-scaling group for backend services
- **RDS**: Managed MongoDB database with multi-AZ deployment
- **Elastic Load Balancer**: Distributes traffic across multiple instances
- **S3**: File storage for Excel uploads and result downloads
- **CloudFront**: CDN for frontend static assets
- **Route 53**: DNS management and health checks
- **CloudWatch**: Monitoring and logging
- **VPC**: Secure network isolation with private subnets

### **Development Environment**

- **EC2**: Development and staging servers
- **RDS**: Development database instances
- **S3**: Development file storage
- **CloudFormation**: Infrastructure as Code (IaC) templates

### **Security & Compliance**

- **IAM**: Role-based access control for AWS services
- **Security Groups**: Network-level security
- **KMS**: Encryption for sensitive data
- **WAF**: Web Application Firewall protection
- **CloudTrail**: Audit logging for compliance

## 🏗️ Architecture

### Backend (NestJS)

- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM (RDS-compatible)
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Documentation**: Swagger/OpenAPI
- **Rate Limiting**: Built-in throttling to prevent API abuse
- **Cloud Integration**: AWS SDK for file operations and monitoring

### Frontend (Next.js)

- **Framework**: Next.js 14 with React 18
- **Styling**: Material-UI (MUI) with Tailwind CSS
- **State Management**: React Context API
- **Routing**: Next.js App Router
- **HTTP Client**: Axios for API communication
- **CDN**: CloudFront for global content delivery

## 👥 User Roles

### Admin

- User management (create, edit, delete users)
- System monitoring and administration
- Access to all system features
- AWS resource monitoring and management

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
- MongoDB (v5 or higher) - or AWS RDS
- npm or yarn package manager
- AWS CLI (for deployment)

### Local Development Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd Scoring-system
   ```

2. **Backend Setup**:

   ```bash
   cd TT-scoring-backend-dev
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the backend root directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/scoring-system
   JWT_SECRET=your-jwt-secret-key
   PORT=8081
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-s3-bucket-name
   ```

4. **Start the development server**:

   ```bash
   npm run start:dev
   ```

5. **Frontend Setup**:
   ```bash
   cd TT-Scoring-FrontEnd-dev/src/tt-frontend-final
   npm install
   npm run dev
   ```

### AWS Deployment

#### **Infrastructure Setup**

```bash
# Deploy infrastructure using CloudFormation
aws cloudformation create-stack \
  --stack-name scoring-system-infra \
  --template-body file://infrastructure/cloudformation.yml \
  --capabilities CAPABILITY_NAMED_IAM
```

#### **Application Deployment**

```bash
# Build and deploy backend
cd TT-scoring-backend-dev
npm run build
aws s3 sync dist/ s3://your-deployment-bucket/backend/

# Build and deploy frontend
cd TT-Scoring-FrontEnd-dev/src/tt-frontend-final
npm run build
aws s3 sync out/ s3://your-frontend-bucket/
```

#### **Database Migration**

```bash
# Set up RDS MongoDB instance
aws rds create-db-instance \
  --db-instance-identifier scoring-system-db \
  --db-instance-class db.t3.micro \
  --engine mongodb \
  --master-username admin \
  --master-user-password your-password
```

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
├── infrastructure/                   # AWS infrastructure templates
│   ├── cloudformation.yml           # Main infrastructure template
│   ├── ec2-userdata.sh             # EC2 instance setup script
│   └── docker-compose.yml          # Container orchestration
├── deployment/                      # Deployment scripts
│   ├── deploy.sh                   # Main deployment script
│   ├── build.sh                    # Build scripts
│   └── aws-config.sh              # AWS configuration
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

### AWS Configuration

#### **Environment Variables**

```env
# Database
MONGODB_URI=mongodb://your-rds-endpoint:27017/scoring-system

# AWS Services
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-file-storage-bucket
AWS_CLOUDFRONT_DISTRIBUTION_ID=your-cdn-distribution

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

#### **IAM Roles**

- **EC2 Role**: Access to S3, CloudWatch, and RDS
- **Lambda Role**: For serverless functions (if applicable)
- **Application Role**: For direct AWS service access

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

### File Operations (AWS S3)

- `POST /files/upload` - Upload Excel files to S3
- `GET /files/download/:id` - Download results from S3

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions per user role
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Cross-origin request handling
- **AWS Security**: IAM roles, Security Groups, and WAF protection
- **Data Encryption**: KMS encryption for sensitive data
- **Network Security**: VPC with private subnets and NAT gateways

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

### AWS Infrastructure Testing

```bash
# Test CloudFormation template
aws cloudformation validate-template --template-body file://infrastructure/cloudformation.yml

# Test deployment scripts
./deployment/deploy.sh --dry-run
```

## 📈 Performance & Monitoring

### **AWS Performance Optimizations**

- **Auto Scaling**: EC2 instances scale based on CPU/memory usage
- **Load Balancing**: ELB distributes traffic across healthy instances
- **CDN**: CloudFront caches static assets globally
- **Database Optimization**: RDS with read replicas for high read loads
- **Caching**: ElastiCache for session and data caching

### **Monitoring & Alerting**

- **CloudWatch**: Real-time monitoring of application metrics
- **CloudWatch Logs**: Centralized logging for all services
- **SNS**: Alert notifications for critical issues
- **X-Ray**: Distributed tracing for performance analysis

### **Cost Optimization**

- **Reserved Instances**: For predictable workloads
- **Spot Instances**: For non-critical batch processing
- **S3 Lifecycle**: Automatic data archival and deletion
- **RDS Storage Optimization**: Automated storage scaling

## 🚀 Deployment

### **Automated Deployment Pipeline**

```bash
# Full deployment script
./deployment/deploy.sh

# Infrastructure only
./deployment/deploy-infrastructure.sh

# Application only
./deployment/deploy-application.sh
```

### **Blue-Green Deployment**

- Zero-downtime deployments
- Automatic rollback on failure
- Health checks and monitoring
- Database migration strategies

### **Environment Management**

- **Development**: AWS dev environment
- **Staging**: Pre-production testing
- **Production**: Live application with monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **AWS Development Guidelines**

- Use AWS SDK for JavaScript/TypeScript
- Follow AWS Well-Architected Framework
- Implement proper error handling for AWS services
- Use AWS CloudFormation for infrastructure as code
- Test with AWS SAM for serverless components

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api` endpoint
- Review AWS CloudWatch logs for troubleshooting

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added manual marking features
- **v1.2.0** - Enhanced reporting and export capabilities
- **v1.3.0** - Improved UI/UX and performance optimizations
- **v2.0.0** - AWS cloud deployment and infrastructure improvements

## 🌟 AWS Benefits

### **Scalability**

- Auto-scaling based on demand
- Global content delivery via CloudFront
- Database read replicas for high availability

### **Reliability**

- Multi-AZ deployment for high availability
- Automated backups and disaster recovery
- Health checks and automatic failover

### **Security**

- IAM role-based access control
- VPC network isolation
- WAF protection against common attacks
- KMS encryption for sensitive data

### **Cost-Effectiveness**

- Pay-as-you-use pricing model
- Reserved instances for predictable workloads
- Spot instances for cost optimization
- Automated resource management

---

**Note**: This is a production-ready version of the Automatic Scoring System deployed on AWS. For local development, ensure proper security configurations and environment setup. The system is designed to handle high-volume test scoring with enterprise-grade reliability and security.
