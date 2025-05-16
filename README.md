# Task Scheduler API Documentation

A powerful task scheduling service that allows you to schedule and manage tasks with ease. This service is built on AWS EventBridge and provides a secure, scalable way to schedule tasks.

## Getting Started

### Authentication

To use the Task Scheduler API, you'll need to obtain your project credentials (Project ID and Client Secret) from me. These credentials are required for authentication.

### Base URL

```
https://9vk36vxk5k.execute-api.ap-south-1.amazonaws.com/Prod
```

## API Endpoints

### 1. Schedule a Task

**Endpoint:** `POST /publish`

Schedule a new task with flexible timing options.

**Headers:**

```
Authorization: Bearer <PROJECT_SECRET>
Content-Type: application/json
```

**Request Body:**

```json
{
  "timestamp": "2024-03-20T12:00:00Z",
  "projectId": "PROJECT_ID",
  "body": {
    "taskTag": "optional-task-identifier", // for your reference
    "callbackUrl": "https://your-endpoint.com/webhook",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer your-callback-auth-token", // this will be sent to the callbackUrl, you can use this to authenticate the request
      "Content-Type": "application/json"
    },
    "body": "{\"key\": \"value\"}" // Stringified JSON, max 10KB
  }
}
```

**Response:**

```json
{
  "message": "Task scheduled via EventBridge",
  "taskId": "TASK_ID"
}
```

### 2. Delete a Scheduled Task

**Endpoint:** `DELETE /delete`

Remove a previously scheduled task.

**Headers:**

```
Authorization: Bearer <PROJECT_SECRET>
Content-Type: application/json
```

**Request Body:**

```json
{
  "taskId": "TASK_ID",
  "projectId": "PROJECT_ID"
}
```

**Response:**

```json
{
  "message": "Task deleted successfully",
  "taskId": "TASK_ID"
}
```

## Error Codes

| Status Code | Description                                      |
| ----------- | ------------------------------------------------ |
| 401         | Unauthorized - Invalid or missing authentication |

## Support

For technical support or questions about the API:

- Email: chandru.ck58@gmail.com
- Documentation: https://dreamerchandra.github.io/task_scheduler/
- Status Page: https://status.taskscheduler.com
