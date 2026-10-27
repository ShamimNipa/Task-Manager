# Task Manager App

A full-stack task management application built with **Next.js, Node.js, Express.js, and MongoDB**. Create tasks, track progress, mark tasks as completed, and manage your daily work through a clean, responsive interface.

## Features

- Create tasks with a title and description
- View all tasks
- View an individual task through the API
- Mark tasks as completed or pending
- Delete tasks
- Track total, pending, and completed tasks
- Responsive user interface
- REST API with input validation and error handling
- MongoDB database integration

## Tech Stack

**Frontend**
- Next.js
- React
- JavaScript
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- JavaScript

**Database**
- MongoDB
- Mongoose

**Tools**
- Git and GitHub
- Visual Studio Code
- Postman or PowerShell for API testing

## Project Structure

```text
task-manager-app/
├── app/
│   └── page.js
├── backend/
│   ├── models/
│   │   └── Task.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── public/
├── package.json
├── .gitignore
└── README.md
```

> The exact structure may vary depending on your project setup.

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) database or a local MongoDB installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/task-manager-app.git
cd task-manager-app
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Install frontend dependencies

From the project root, run:

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

Replace `your_mongodb_connection_string` with your MongoDB connection string.

Never commit your real `.env` file or expose database credentials.

### 5. Start the backend

From the `backend` folder, run:

```bash
npm run dev
```

The API should run at:

`http://localhost:5000`

This command assumes your backend `package.json` defines a `dev` script.

### 6. Start the frontend

Open a second terminal at the project root and run:

```bash
npm run dev
```

Open the application at:

`http://localhost:3000`

If your frontend is in a separate directory, run the frontend command from that directory instead.

## API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Retrieve all tasks |
| GET | `/api/tasks/:id` | Retrieve one task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Create a Task Example

**Request**

```http
POST /api/tasks
Content-Type: application/json
```

```json
{
  "title": "Learn Next.js",
  "description": "Build a full-stack task manager"
}
```

**Example response**

```json
{
  "success": true,
  "message": "Task created successfully.",
  "task": {
    "_id": "example_task_id",
    "title": "Learn Next.js",
    "description": "Build a full-stack task manager",
    "completed": false
  }
}
```

The ID above is an illustrative example; MongoDB generates the actual ID.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend origin allowed by CORS |

For deployment, configure the frontend's `NEXT_PUBLIC_API_URL` variable with your deployed backend API base URL, including `/api/tasks`.

## Future Improvements

- User registration and login
- Task editing through the frontend
- Task priorities and due dates
- Search and filtering
- Pagination
- Deployment with Render and Vercel

## Learning Goals

This project helps practice:

- Building a frontend with Next.js and React
- Creating REST APIs with Express.js
- Performing CRUD operations
- Connecting Node.js applications to MongoDB
- Managing asynchronous requests and errors
- Using Git and GitHub for version control

## Author

**YOUR NAME**

- GitHub: https://github.com/YOUR-USERNAME

## License

This project is open source. Add a license such as the MIT License if you intend to distribute it under those terms.

