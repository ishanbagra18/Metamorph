// tests/todos.test.js
const assert = require('assert');
const { getAllTodos, getTodoById } = require('../services/todoService');

async function runTests() {
  console.log('Running todos tests...');
  const list = await getAllTodos();
  assert(Array.isArray(list), 'getAllTodos must return an array');
  assert(list.length >= 3, 'Must have at least 3 initial todos');

  const item = await getTodoById(1);
  assert(item !== null, 'Item 1 must exist');
  assert.strictEqual(item.id, 1, 'Item ID must match');

  console.log('All tests passed successfully!');
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
