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

  const [sortByChecked, setSortByChecked] = useState(() => {
    const s = localStorage.getItem("todos.sortByChecked");
    return s ? JSON.parse(s) : false;
  });

  useEffect(() => {
      localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("todos.sortByChecked", JSON.stringify(sortByChecked));
  }, [sortByChecked]);

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

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  const sortTodos = (items) => {
    const arr = [...items];

    // 基本は id 昇順（追加順）
    arr.sort((a, b) => cmp(a.id, b.id));

    if (sortByChecked) {
      arr.sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
    }
    return arr;
  }

  const sortedTodos = sortTodos(todos);

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

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setSortByChecked((v) => !v)}>
          チェック並べ替え: {sortByChecked ? "ON" : "OFF"}
        </button>
      </div>

      <ul>
        {sortedTodos
          .map((todo) => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
                {todo.text}
              </span>
              <button onClick={() => deleteTodo(todo.id)}>削除</button>
            </li>
          ))}
      </ul>
    </div>
  );
}
