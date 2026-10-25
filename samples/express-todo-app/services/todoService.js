// services/todoService.js
const todos = [
  { id: 1, title: 'Inspect Helix code', completed: true },
  { id: 2, title: 'Architect Metamorph migration agent', completed: true },
  { id: 3, title: 'Run TypeScript compiler verification', completed: false }
];

async function getAllTodos() {
  return todos;
}

async function getTodoById(id) {
  const numericId = parseInt(id, 10);
  return todos.find(t => t.id === numericId) || null;
}

async function createTodo(title) {
  if (!title) {
    throw new Error('Title is mandatory');
  }
  const newTodo = {
    id: todos.length + 1,
    title: title,
    completed: false
  };
  todos.push(newTodo);
  return newTodo;
}

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo
};
