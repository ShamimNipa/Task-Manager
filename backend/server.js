

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

app.use(express.json({ limit: "10kb" }));

// ---------- Helpers ----------
function isValidTaskId(id) {
  return mongoose.isValidObjectId(id);
}

function handleServerError(res, error, message) {
  console.error(message, error.message);

  return res.status(500).json({
    success: false,
    message,
  });
}

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Manager API is running!",
  });
});

// ---------- GET All Tasks ----------
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    return handleServerError(
      res,
      error,
      "Failed to fetch tasks."
    );
  }
});

// ---------- GET One Task ----------
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidTaskId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return handleServerError(
      res,
      error,
      "Failed to fetch the task."
    );
  }
});

// ---------- CREATE Task ----------
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description = "" } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required.",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Task title cannot exceed 200 characters.",
      });
    }

    if (typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be text.",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return handleServerError(
      res,
      error,
      "Failed to create the task."
    );
  }
});

// ---------- UPDATE Task ----------
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    if (!isValidTaskId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    // Only allow these three fields to be updated.
    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot be empty.",
        });
      }

      if (title.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot exceed 200 characters.",
        });
      }

      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Description must be text.",
        });
      }

      updates.description = description.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Completed must be true or false.",
        });
      }

      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid field to update.",
      });
    }

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return handleServerError(
      res,
      error,
      "Failed to update the task."
    );
  }
});

// ---------- DELETE Task ----------
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidTaskId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      task,
    });
  } catch (error) {
    return handleServerError(
      res,
      error,
      "Failed to delete the task."
    );
  }
});

// ---------- Not Found ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// ---------- Start Server ----------
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error.message);
    process.exit(1);
  }
}

startServer();
