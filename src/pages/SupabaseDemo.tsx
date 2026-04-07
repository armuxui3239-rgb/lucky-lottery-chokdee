import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Todo {
  id: number
  name: string
}

export default function SupabaseDemo() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTodos() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('todos').select()
        if (error) throw error
        if (data) setTodos(data)
      } catch (err: any) {
        console.error('Error fetching todos:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTodos()
  }, [])

  if (loading) return <div className="p-8">Loading todos...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-2xl mt-10">
      <h1 className="text-3xl font-extrabold text-blue-600 mb-6 flex items-center">
        <span className="mr-2">📝</span> Supabase Todos
      </h1>
      <ul className="space-y-3">
        {todos.length === 0 ? (
          <li className="text-gray-500 italic">No todos found. Have you created the 'todos' table in Supabase?</li>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 font-medium hover:shadow-md transition-shadow">
              {todo.name}
            </li>
          ))
        )}
      </ul>
      <p className="mt-8 text-sm text-gray-400 text-center">
        Created for Lotlee Chokdee Project
      </p>
    </div>
  )
}
