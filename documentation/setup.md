# Task Scheduler API

A robust task scheduling system built with AWS EventBridge and Lambda, providing a secure and scalable way to schedule and manage tasks.

## Features

- Schedule tasks with flexible timing options
- Secure authentication and authorization
- Project-based multi-tenancy support
- RESTful API endpoints for task management
- Error handling and logging

## Prerequisites

- Node.js (v20 or higher)
- Yarn package manager
- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd task_scheduler
```

2. Install dependencies:

```bash
cd sub
yarn install
```

3. Set up environment variables:
   Create a `.env` file in the `sub` directory with the following variables:

```
JWT_SECRET=your-aws-region
DATABASE_URL=your-database-url
```

## Project Structure

```
sub/
├── src/              # Source code
├── tests/            # Test files
├── prisma/           # Database schema and migrations
├── app.ts            # Main application entry point
└── package.json      # Project dependencies and scripts
```

## API Endpoints

### Authentication

All endpoints except the subscriber endpoint require authentication using a JWT token.

### Endpoints

1. **Create Project** (POST /create-project)

   - Creates a new project with client credentials
   - Requires super admin privileges
   - Returns project ID and client secret

2. **Publish Task** (POST /publish)

   - Schedule a new task
   - Requires authentication
   - Accepts task details in request body

3. **Subscribe to Tasks** (GET /subscribe)

   - Subscribe to task updates
   - No authentication required
   - Returns task updates in real-time

4. **Delete Task** (DELETE /delete)
   - Delete a scheduled task
   - Requires authentication
   - Accepts task ID in request body

## Security

- JWT-based authentication
- Project-based access control
- AWS IAM roles and policies
- Input validation using Zod
- Error handling and logging

2. Deploy to AWS:

```bash
chmod +x deploy.sh
./deploy.sh
```
