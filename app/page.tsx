"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Plus, Check, Trash2 } from "lucide-react"

export default function TodoApp() {
  const [todos, setTodos] = useState<{ id: number; text: string; completed: boolean; dueDate: Date | null }[]>([
    { id: 1, text: "Learn React", completed: false, dueDate: new Date(Date.now() + 1000 * 60 * 60) }, // Due in 1 hour
    { id: 2, text: "Build a todo app", completed: false, dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2) }, // Due in 2 hours
    { id: 3, text: "Deploy to production", completed: false, dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24) }, // Due in 24 hours
  ])
  const [newTodo, setNewTodo] = useState("")
  const [newDueDate, setNewDueDate] = useState<string>("")
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [notifications, setNotifications] = useState<string[]>([])

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim() === "") return

    const dueDate = newDueDate ? new Date(newDueDate) : null

    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false, dueDate }])
    setNewTodo("")
    setNewDueDate("")
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed
    if (filter === "completed") return todo.completed
    return true
  })

  const formatDueDate = (date: Date | null) => {
    if (!date) return ""

    const now = new Date()
    const timeDiff = date.getTime() - now.getTime()

    if (timeDiff < 0) {
      return "Overdue"
    }

    // Less than an hour
    if (timeDiff < 1000 * 60 * 60) {
      const minutes = Math.floor(timeDiff / (1000 * 60))
      return `Due in ${minutes} minute${minutes !== 1 ? "s" : ""}`
    }

    // Less than a day
    if (timeDiff < 1000 * 60 * 60 * 24) {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      return `Due in ${hours} hour${hours !== 1 ? "s" : ""}`
    }

    // Format date
    return `Due ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  const getStatusColor = (dueDate: Date | null) => {
    if (!dueDate) return "bg-gray-100"

    const now = new Date()
    const timeDiff = dueDate.getTime() - now.getTime()

    if (timeDiff < 0) return "bg-red-100 border-red-300"
    if (timeDiff < 1000 * 60 * 60) return "bg-orange-100 border-orange-300" // Due within an hour
    if (timeDiff < 1000 * 60 * 60 * 24) return "bg-yellow-100 border-yellow-300" // Due within a day

    return "bg-green-100 border-green-300"
  }

  const dismissNotification = (index: number) => {
    setNotifications(notifications.filter((_, i) => i !== index))
  }

  useEffect(() => {
    const checkDueTasks = () => {
      const now = new Date()
      const dueSoonTasks = todos.filter((todo) => {
        if (!todo.dueDate || todo.completed) return false

        const timeDiff = todo.dueDate.getTime() - now.getTime()
        // Check if due within 15 minutes
        return timeDiff > 0 && timeDiff <= 1000 * 60 * 15
      })

      const overdueTasks = todos.filter((todo) => {
        if (!todo.dueDate || todo.completed) return false
        return todo.dueDate < now
      })

      // Create notifications for due soon tasks
      dueSoonTasks.forEach((task) => {
        const notification = `Task "${task.text}" is due soon!`
        if (!notifications.includes(notification)) {
          setNotifications((prev) => [...prev, notification])
        }
      })

      // Create notifications for overdue tasks
      overdueTasks.forEach((task) => {
        const notification = `Task "${task.text}" is overdue!`
        if (!notifications.includes(notification)) {
          setNotifications((prev) => [...prev, notification])
        }
      })
    }

    checkDueTasks() // Check immediately
    const interval = setInterval(checkDueTasks, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [todos, notifications])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {notifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Reminders</h2>
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded"
                >
                  <p>{notification}</p>
                  <button onClick={() => dismissNotification(index)} className="text-red-500 hover:text-red-700">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Todo List</h1>

        <form onSubmit={addTodo} className="flex flex-col mb-6">
          <div className="flex mb-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 flex items-center justify-center"
            >
              <Plus size={20} />
            </button>
          </div>
          <input
            type="datetime-local"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex justify-center mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1 rounded-md ${filter === "all" ? "bg-white shadow" : "hover:bg-gray-200"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-1 rounded-md ${filter === "active" ? "bg-white shadow" : "hover:bg-gray-200"}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-1 rounded-md ${filter === "completed" ? "bg-white shadow" : "hover:bg-gray-200"}`}
            >
              Completed
            </button>
          </div>
        </div>

        <ul className="space-y-2">
          {filteredTodos.length === 0 ? (
            <li className="text-center text-gray-500 py-4">No tasks found</li>
          ) : (
            filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={`flex items-center justify-between p-3 border rounded-lg group hover:bg-opacity-80 transition-colors ${getStatusColor(todo.dueDate)}`}
              >
                <div className="flex items-center">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3
                      ${todo.completed ? "bg-green-500 border-green-500" : "border-gray-300"}`}
                  >
                    {todo.completed && <Check size={14} className="text-white" />}
                  </button>
                  <div className="flex flex-col">
                    <span className={`${todo.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {todo.text}
                    </span>
                    {todo.dueDate && (
                      <span
                        className={`text-xs ${todo.dueDate < new Date() && !todo.completed ? "text-red-600 font-bold" : "text-gray-500"}`}
                      >
                        {formatDueDate(todo.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="mt-6 text-sm text-gray-500 text-center">
          {todos.filter((todo) => !todo.completed).length} items left
        </div>
      </div>
    </div>
  )
}

