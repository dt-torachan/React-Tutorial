import { useEffect, useState } from "react";

// TODO アプリ
// 要件: 追加・チェック・削除・localStorage保持
// 追加要件: 期日フィールド・期日ソートON/OFF・チェックソートON/OFF
// 要件4: サブTODO・親子のチェック連動

export default function TodoApp() {
  // todos 初期化（localStorageから復元）
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("todos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 親TODO追加用の入力
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState(""); // "YYYY-MM-DD"

  // サブTODO追加用の入力（親TODOごとに別々に持つ）
  // 例: { [todoId]: "入力中のサブタスク名" }
  const [subInputs, setSubInputs] = useState({});

  // 並べ替えトグル（未完→完了）
  const [sortByChecked, setSortByChecked] = useState(() => {
    const s = localStorage.getItem("todos.sortByChecked");
    return s ? JSON.parse(s) : false;
  });

  // 並べ替えトグル（日付昇順）
  const [sortByDate, setSortByDate] = useState(() => {
    const s = localStorage.getItem("todos.sortByDate");
    return s ? JSON.parse(s) : false;
  });

  // --- 永続化 ---
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("todos.sortByChecked", JSON.stringify(sortByChecked));
  }, [sortByChecked]);

  useEffect(() => {
    localStorage.setItem("todos.sortByDate", JSON.stringify(sortByDate));
  }, [sortByDate]);

  // --- 基本操作 ---

  // 親TODOを追加
  const addTodo = () => {
    if (!text.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      done: false,
      dueDate: dueDate || null,
      subtasks: [], // サブTODO配列を持たせる
    };
    setTodos((prev) => [...prev, newTodo]);
    setText("");
    setDueDate("");
  };

  // 親TODOのチェック切り替え
  // 親を直接トグルしたときは、子も同じ状態に揃える方が自然なのでそうする
  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) return todo;
        const nextDone = !todo.done;
        const nextSubs = (todo.subtasks || []).map((s) => ({
          ...s,
          done: nextDone,
        }));
        return { ...todo, done: nextDone, subtasks: nextSubs };
      })
    );
  };

  // 親TODO削除
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // 親TODOの期日を編集
  const updateDueDate = (id, value) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, dueDate: value || null } : todo
      )
    );
  };

  // --- サブTODO関連 ---

  // サブTODOを追加
  const addSubtask = (todoId) => {
    const v = (subInputs[todoId] || "").trim();
    if (!v) return;

    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== todoId) return t;

        // サブTODO用に親ごとの連番idを作る（1,2,3,...）
        const nextSubId =
          (t.subtasks?.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1;

        const newSub = {
          id: nextSubId,
          text: v,
          done: false,
        };

        return {
          ...t,
          subtasks: [...(t.subtasks || []), newSub],
          done: false, // 新しい未完サブを足したら親は未完に戻す
        };
      })
    );

    // 入力欄クリア
    setSubInputs((m) => ({ ...m, [todoId]: "" }));
  };

  // サブTODOのチェック切り替え
  // 子の状態を変えたあと、全サブがdoneなら親もdoneにする
  // 1つでも未完があれば親は未完に戻す
  const toggleSubtask = (todoId, subId) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== todoId) return t;

        const newSubs = (t.subtasks || []).map((s) =>
          s.id === subId ? { ...s, done: !s.done } : s
        );

        const allDone =
          newSubs.length > 0 && newSubs.every((s) => s.done === true);

        return {
          ...t,
          subtasks: newSubs,
          done: allDone,
        };
      })
    );
  };

  // サブTODOの削除（必要なら使う。課題に明示はないけど入れておくと便利）
  const removeSubtask = (todoId, subId) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== todoId) return t;

        const remain = (t.subtasks || []).filter((s) => s.id !== subId);

        const allDone =
          remain.length > 0 && remain.every((s) => s.done === true);

        // サブが0になった場合は親のdoneは維持するより未完に戻す方が直感的にも感じるが、
        // 要件にないので、ここでは親は allDone に従わせる
        return {
          ...t,
          subtasks: remain,
          done: allDone,
        };
      })
    );
  };

  // --- 並べ替えロジック ---

  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  const parseDate = (str) => (str ? new Date(str).getTime() : null);

  const sortTodos = (items) => {
    const arr = [...items];

    // まずはID昇順（追加順）で安定化
    arr.sort((a, b) => cmp(a.id, b.id));

    // 「未完→完了」
    if (sortByChecked) {
      arr.sort((a, b) => {
        if (a.done === b.done) return 0;
        return a.done ? 1 : -1;
      });
    }

    // 「日付の昇順（古い日付が先・日付なしは最後）」
    if (sortByDate) {
      arr.sort((a, b) => {
        const da = parseDate(a.dueDate);
        const db = parseDate(b.dueDate);

        if (da === null && db === null) return 0;
        if (da === null) return 1;  // 日付なしは後ろ
        if (db === null) return -1;
        return cmp(da, db);
      });
    }

    return arr;
  };

  const sortedTodos = sortTodos(todos);

  // --- UI ---
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>TODOアプリ</h1>

      {/* 親TODO追加フォーム */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="TODOを入力"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          title="期日"
        />
        <button onClick={addTodo}>追加</button>
      </div>

      {/* 並べ替えトグル */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setSortByChecked((v) => !v)}>
          チェック並べ替え: {sortByChecked ? "ON" : "OFF"}
        </button>
        <button onClick={() => setSortByDate((v) => !v)}>
          日付並べ替え: {sortByDate ? "ON" : "OFF"}
        </button>
      </div>

      {/* TODOリスト */}
      <ul style={{ display: "grid", gap: 12 }}>
        {sortedTodos.map((todo) => (
          <li
            key={todo.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: 12,
            }}
          >
            {/* 親TODOの情報 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                title="親を切り替えるとサブも同じ状態になります"
              />

              <span
                style={{
                  flex: 1,
                  textDecoration: todo.done ? "line-through" : "none",
                }}
              >
                {todo.text}
              </span>

              <input
                type="date"
                value={todo.dueDate || ""}
                onChange={(e) => updateDueDate(todo.id, e.target.value)}
                title="期日を変更"
              />

              <button onClick={() => deleteTodo(todo.id)}>削除</button>
            </div>

            {/* サブTODO一覧 */}
            <ul style={{ marginLeft: 24, marginBottom: 8 }}>
              {(todo.subtasks || []).map((sub) => (
                <li
                  key={sub.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sub.done}
                    onChange={() => toggleSubtask(todo.id, sub.id)}
                  />
                  <span
                    style={{
                      flex: 1,
                      textDecoration: sub.done ? "line-through" : "none",
                    }}
                  >
                    {sub.text}
                  </span>
                  <button onClick={() => removeSubtask(todo.id, sub.id)}>
                    サブ削除
                  </button>
                </li>
              ))}
            </ul>

            {/* サブTODO追加フォーム（親ごと） */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginLeft: 24,
              }}
            >
              <input
                placeholder="サブTODOを追加…"
                value={subInputs[todo.id] || ""}
                onChange={(e) =>
                  setSubInputs((m) => ({ ...m, [todo.id]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && addSubtask(todo.id)}
              />
              <button onClick={() => addSubtask(todo.id)}>追加</button>
            </div>
          </li>
        ))}
      </ul>

      {sortedTodos.length === 0 && (
        <p style={{ color: "#888", marginTop: 24 }}>TODOはまだありません。</p>
      )}
    </div>
  );
}
