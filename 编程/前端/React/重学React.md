# 写 hook 建议给每个返回值包裹 useCallback

官方文档：

![[Pasted image 20260312092954.png]]

❗还有个这种写法：

```tsx 
// 这个 Hook 模拟你的 useRouter 逻辑，但依赖一个会变的数据 userRole
function useTodoActions(userRole) {
  const [todos, setTodos] = useState([]);

  // ⚠️ 注意：只要 userRole 变了，deleteTodo 的【内存地址】就会变
  const deleteTodo = useCallback((id) => {
    if (userRole !== 'admin') return alert('没权限');
    setTodos(prev => prev.filter(t => t.id !== id));
  }, [userRole]); // 依赖项包含 userRole

  return { deleteTodo };
}

// 模拟渲染 1000 条数据的组件
const TodoItem = React.memo(({ id, onDelete }) => {
  console.log(`Render Item: ${id}`); // 如果打印了，说明性能在损耗
  return <button onClick={() => onDelete(id)}>删除 {id}</button>;
});

function App() {
  const [role, setRole] = useState('guest');
  const { deleteTodo } = useTodoActions(role);

  return (
    <div>
      {/* 💥 点击这个按钮，修改 role */}
      <button onClick={() => setRole('admin')}>切换到管理员</button>
      
      {/* 重点来了：当你点切换，role 变了，deleteTodo 引用变了。
         即使下面 1000 个 TodoItem 逻辑没变，它们也会全部重新渲染！
         你会看到控制台瞬间刷出 1000 条 "Render Item"
      */}
      {list.map(i => <TodoItem key={i} id={i} onDelete={deleteTodo} />)}
    </div>
  );
}

// ====================
// ======更好的写法====
// ====================
function useStableCallback(callback) {
  const callbackRef = useRef(callback);
  
  // 每次渲染偷偷更新最新的逻辑，但不触发重渲染
  // ✅ 为啥放在 useEffect 中？因为任务是可以被中断的，useEffect 保证任务是在 commit 阶段执行的
  useEffect(() => {
    callbackRef.current = callback;
  });

  // 返回一个永远不变的空壳函数
  return useCallback((...args) => {
    return callbackRef.current?.(...args);
  }, []); // 👈 依赖为空，引用永远固定
}

function useTodoActions(userRole) {
  const [todos, setTodos] = useState([]);

  // ✅ 引用绝对稳定，哪怕 userRole 天天变
  const deleteTodo = useStableCallback((id) => {
    if (userRole !== 'admin') return alert('没权限');
    setTodos(prev => prev.filter(t => t.id !== id));
  });

  return { deleteTodo };
}

function App() {
  const [role, setRole] = useState('guest');
  const { deleteTodo } = useTodoActions(role);

  return (
    <div>
      <button onClick={() => setRole('admin')}>切换到管理员</button>
      
      {/* 🚀 奇迹发生了：当你切换 role 时，deleteTodo 引用没变。
         React.memo 发现 props 一模一样，直接跳过渲染。
         控制台一条 "Render Item" 都不会打印！
      */}
      {list.map(i => <TodoItem key={i} id={i} onDelete={deleteTodo} />)}
    </div>
  );
}

```

# 丢弃旧请求的结果(请求的竞态问题)

``` tsx
import { useState, useEffect } from 'react';  
import { fetchBio } from './api.js';  

export default function Page() {  

	const [person, setPerson] = useState('Alice');  
	const [bio, setBio] = useState(null);  
	
	useEffect(() => {  
		let ignore = false;  
		setBio(null);  
		fetchBio(person).then(result => {  
			if (!ignore) {  
				setBio(result);  
			}  
		});  
	
	return () => {  
		ignore = true;  // ⭐ GET
	};  

}, [person]);  

```