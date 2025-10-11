import { useEffect, useState } from "react";

// TODO アプリ
// 要件: 追加・チェック・再読込保持 (localStorage)

export default function TodoApp() {
  // 初期値は localStorage から同期復元
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("todos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");

  useEffect(() => {
      localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!text.trim()) return;
    const newTodo = { id: Date.now(), text, done: false };
    setTodos(todos => [...todos, newTodo]); 
    // 入力欄をクリアする
    setText("");
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map((todo) => (
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )));
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>TODOアプリ</h1>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTodo()}
        placeholder="TODOを入力"
      />
      <button onClick={addTodo}>追加</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
