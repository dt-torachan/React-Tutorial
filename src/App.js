import './App.css';

import React, { useState, useEffect } from 'react';

function App() {
  // const [count, setCount] = useState(0); 
  const [count, setCount] = useState(() => {
    // 初期値をlocalStorageから取得 なければ初期値0
    const saved = localStorage.getItem("count");
    return saved ? Number(saved) : 0;
  });

  const [text, setText] = useState("");

  const setInit = () => {
    setCount(Number(text));
    setText("");
  };
  

  useEffect(() => {
    // countが変わるたびにlocalStorageへ保存
    localStorage.setItem("count", count);
  }, [count]);
  
  const handleClickCountUp = () => {
    setCount(count + 1); // カウントアップ
  };
    const handleClickCountDown = () => {
    setCount(count - 1); // カウントダウン
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>カウントアップアプリ</h1>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && setInit()}
        placeholder="初期値を入力"
      />
      <button onClick={setInit}>初期値セット</button>
      <p>現在のカウント: {count}</p>
      <button onClick={handleClickCountUp}>+1</button>
      <button onClick={handleClickCountDown}>-1</button>
    </div>
  );
}

export default App;
