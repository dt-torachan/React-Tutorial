import { useEffect, useState } from "react";

// TODO アプリ
// 要件: 追加・チェック・削除・localStorage保持
// 追加要件: 期日フィールド・期日ソートON/OFF・チェックソートON/OFF

export default function TodoApp() {
  // 初期値は localStorage から同期復元
  const [todos, setTodos] = useState(() => {
    try {const sortedTodos = sortTodos(todos);
      const saved = localStorage.getItem("todos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState(""); // "YYYY-MM-DD" を入れる

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

  // todos が変わったら保存
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // sortByChecked が変わったら保存
  useEffect(() => {
    localStorage.setItem("todos.sortByChecked", JSON.stringify(sortByChecked));
  }, [sortByChecked]);

  // sortByDate が変わったら保存
  useEffect(() => {
    localStorage.setItem("todos.sortByDate", JSON.stringify(sortByDate));
  }, [sortByDate]);

  // TODOを追加
  const addTodo = () => {
    if (!text.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      done: false,
      dueDate: dueDate || null, // 期日はnull許容にしておく
    };
    setTodos((todos) => [...todos, newTodo]);
    setText("");
    setDueDate("");
  };

  // チェックON/OFF
  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  // 削除
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // 既存TODOのdueDateを編集
  const updateDueDate = (id, value) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, dueDate: value || null } : todo
      )
    );
  };

  // 比較用ヘルパー
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  const parseDate = (str) => (str ? new Date(str).getTime() : null);
  // ↑ "2025-10-25" のような日付を表す文字列を ms にして数値比較できるようにする
  // null は「日付なし」という意味で特別扱いする

  // 実際に並べ替えを行う
  const sortTodos = (items) => {
    const arr = [...items];

    // まずはID昇順（追加順）
    arr.sort((a, b) => cmp(a.id, b.id));

    // 「未完→完了」の並べ替え
    // sortByChecked が true のときだけ適用
    if (sortByChecked) {
      arr.sort((a, b) => {
        if (a.done === b.done) return 0;
        return a.done ? 1 : -1;
      });
    }

    // 「日付の昇順（古い日付が先・日付なしは最後）」
    // sortByDate が true のときだけ適用
    // チェックソートと両方ONのときは、
    //   1. 未完グループ内 → 期日昇順
    //   2. 完了グループ内 → 期日昇順
    // という形になるように、今のロジックでは date ソートを
    // 後からかけると「チェックによるグループ分け」が壊れる。。
    if (sortByDate) {
      arr.sort((a, b) => {
        const da = parseDate(a.dueDate);
        const db = parseDate(b.dueDate);

        // どっちも日付なし
        if (da === null && db === null) return 0;
        // aが日付なし → 後ろへ
        if (da === null) return 1;
        // bが日付なし → bを後ろへ
        if (db === null) return -1;

        // 両方日付あり → 早い日付が先
        return cmp(da, db);
      });
    }

    return arr;
  };

  const sortedTodos = sortTodos(todos);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>TODOアプリ</h1>

      {/* 入力ブロック */}
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

      {/* 期日込みリスト表示 期日はinputじゃなくても(変更不可なtextなど)大丈夫です。*/}
      <ul>
        {sortedTodos.map((todo) => (
          <li
            key={todo.id}
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
          </li>
        ))}
      </ul>

      {/* 課題で指定していないので不要です。 */}
      {sortedTodos.length === 0 && (
        <p style={{ color: "#888", marginTop: 24 }}>TODOはまだありません。</p>
      )}
    </div>
  );
}
