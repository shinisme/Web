import { useState } from 'react';
import type { FormEvent } from 'react';
import type { TTodo } from '../types/todo';

const Todo = () => {
const[todos, setTodos] = useState<TTodo[]>([]);
const[doneTodos, setDoneTodos] = useState<TTodo[]>([]);
const[input, setInput] = useState<string>('');

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text= input.trim();

    if(text) {
        const newTodo: TTodo = {
            id: Date.now(),
            text
        };
        setTodos((prevTodos: TTodo[]) => [...prevTodos, newTodo]);
    }
};

const completeTodo = (todo: TTodo) => {
    setTodos((prevTodos: TTodo[]) => prevTodos.filter(t => t.id !== todo.id));
    // setDoneTodos((prevDoneTodos: TTodo[]) => [...prevDoneTodos, todo]);
    setDoneTodos((prevDoneTodos: TTodo[]) => [...prevDoneTodos, todo]);
};

const deleteTodo = (todo: TTodo) => {
    setDoneTodos((prevDoneTodos: TTodo[]) => prevDoneTodos.filter((t) : boolean => t.id !== todo.id));
};

  return (
    <div className='todo-container'> 
      <h1 className='todo-container__header'>SEUNGURI TODO</h1>
      <form onSubmit={handleSubmit} className='todo-container__form'>
        <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            className='todo-container__input' 
            type="text" 
            placeholder='할 일 입력' 
            required 
        />
        <button className='todo-container__button' type='submit'>
            할 일 추가
        </button>
      </form>
      <div className='render-container'>
        <div className='render-container__section'>
            <h2 className='render-container__title'>할 일</h2>
            <ul id='todo-list' className='render-container__list'>
                {todos.map(todo => (
                    <li key={todo.id} className='render-container__item'>
                        <span className='render-container__item-text'>{todo.text}</span>
                        <button 
                            style={{ backgroundColor: '#28a745'}} 
                            className='render-container__item-button' 
                            onClick={() => completeTodo(todo)}>
                            완료
                        </button>
                    </li>
                ))}
            </ul>
        </div>
        <div className='render-container__section'>
            <h2 className='render-container__title'>완료한 일</h2>
            <ul id='todo-list' className='render-container__list'>
                {doneTodos.map(todo => (
                    <li key={todo.id} className='render-container__item'>
                        <span className='render-container__item-text'>{todo.text}</span>
                        <button 
                            style={{ backgroundColor: '#dc3545'}} 
                            className='render-container__item-button'
                            onClick={() => deleteTodo(todo)}>
                            삭제
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Todo;