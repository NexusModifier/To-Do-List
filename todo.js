const form = document.querySelector('form');
const input = document.querySelector('input[type="text"]');
const todoList = document.querySelector('.todo-list');

// Retrieve the saved to-dos from localStorage, if any
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Render the saved to-dos
renderTodos();

// Add an event listener to the form for when the user submits a new to-do
form.addEventListener('submit', function(event) {
  event.preventDefault();
  const todoText = input.value.trim();
  if (todoText === '') return;
  const todo = {
    id: new Date().getTime(),
    text: todoText,
    completed: false,
  };
  todos.push(todo);
  renderTodos();
  input.value = '';
  input.focus();
});

// Add an event listener to the to-do list for when the user clicks a delete button, a complete button, or an edit button
todoList.addEventListener('click', function(event) {
  if (event.target.classList.contains('delete-btn')) {
    const todoId = Number(event.target.parentElement.dataset.todoId);
    todos = todos.filter((todo) => todo.id !== todoId);
    renderTodos();
  } else if (event.target.classList.contains('complete-btn')) {
    const todoId = Number(event.target.parentElement.dataset.todoId);
    const selectedTodo = todos.find((todo) => todo.id === todoId);
    selectedTodo.completed = !selectedTodo.completed;
    renderTodos();
  } else if (event.target.classList.contains('edit-btn')) {
    const todoId = Number(event.target.parentElement.dataset.todoId);
    const selectedTodo = todos.find((todo) => todo.id === todoId);
    const newText = prompt('Edit the to-do:', selectedTodo.text);
    if (newText !== null) {
      selectedTodo.text = newText.trim();
      renderTodos();
    }
  }
});

// Add event listeners for drag and drop functionality
let draggedTodoId;

todoList.addEventListener('dragstart', function(event) {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', event.target.dataset.todoId);
  event.target.classList.add('dragging');
  draggedTodoId = event.target.dataset.todoId;
});

todoList.addEventListener('dragover', function(event) {
  event.preventDefault();
  const draggedElement = document.querySelector('.dragging');
  const overElement = event.target.closest('li');
  if (!overElement || draggedElement === overElement) return;
  const draggedIndex = todos.findIndex((todo) => todo.id === Number(draggedTodoId));
  const overIndex = todos.findIndex((todo) => todo.id === Number(overElement.dataset.todoId));
  const isAfter = overIndex > draggedIndex;
  if (isAfter) {
    todoList.insertBefore(draggedElement, overElement.nextSibling);
  } else {
    todoList.insertBefore(draggedElement, overElement);
  }
});

todoList.addEventListener('dragend', function(event) {
  event.target.classList.remove('dragging');
  const newOrder = Array.from(todoList.querySelectorAll('li')).map((li) => Number(li.dataset.todoId));
  todos = newOrder.map((id) => todos.find((todo) => todo.id === id));
  renderTodos();
});

// Render the to-do list
function renderTodos() {
  // Save the to-dos to localStorage
  localStorage.setItem('todos', JSON.stringify(todos));
  todoList.innerHTML = '';
  todos.forEach(function(todo) {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.todoId = todo.id;

    if (todo.editing) {
      const todoForm = document.createElement('form');
      const todoInput = document.createElement('input');
      todoInput.type = 'text';
      todoInput.value = todo.text;
      todoForm.appendChild(todoInput);

      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.textContent = 'Save';

      // Add event listener to the save button for saving the edited todo
      saveButton.addEventListener('click', function() {
        const editedTodoText = todoInput.value.trim();
        if (editedTodoText === '') return;
        todo.text = editedTodoText;
        todo.editing = false;
        renderTodos();
      });

      todoForm.appendChild(saveButton);
      li.appendChild(todoForm);
    } else {
      const todoText = document.createElement('span');
      todoText.textContent = todo.text;
      const completeButton = document.createElement('i');
      completeButton.classList.add('fas', 'fa-check', 'complete-btn');
      const editButton = document.createElement('i');
      editButton.classList.add('fas', 'fa-edit', 'edit-btn');
      const deleteButton = document.createElement('i');
      deleteButton.classList.add('fas', 'fa-times', 'delete-btn');

      // Add event listener to the edit button for enabling editing mode
      editButton.addEventListener('click', function() {
        todo.editing = true;
        renderTodos();
      });

      li.appendChild(todoText);
      li.appendChild(completeButton);
      li.appendChild(editButton);
      li.appendChild(deleteButton);

      if (todo.completed) {
        li.classList.add('completed');
      }
    }

    todoList.appendChild(li);
  });
}



// Add event listeners for editing existing to-do items
todoList.addEventListener('click', function(event) {
if (event.target.classList.contains('edit-btn')) {
  const todoId = Number(event.target.parentElement.dataset.todoId);
  const selectedTodo = todos.find((todo) => todo.id === todoId);
  const newText = prompt('Edit the to-do:', selectedTodo.text);
  if (newText !== null) {
    selectedTodo.text = newText.trim();
    renderTodos();
  }
}
});

// Add smooth transition effects during drag and drop
todoList.addEventListener('dragenter', function(event) {
if (event.target.closest('li') !== event.target) return;
event.target.classList.add('drag-enter');
});

todoList.addEventListener('dragleave', function(event) {
if (event.target.closest('li') !== event.target) return;
event.target.classList.remove('drag-enter');
});

todoList.addEventListener('dragend', function(event) {
const draggedElement = document.querySelector('.dragging');
const dragEnterElements = todoList.querySelectorAll('.drag-enter');
draggedElement.classList.remove('dragging');
dragEnterElements.forEach((el) => el.classList.remove('drag-enter'));
});

// Helper function to find the element after which to insert the dragged element
function getDragAfterElement(container, y) {
const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
return draggableElements.reduce((closest, child) => {
  const box = child.getBoundingClientRect();
  const offset = y - box.top - box.height / 2;
  if (offset < 0 && offset > closest.offset) {
    return { offset, element: child };
  } else {
    return closest;
  }
}, { offset: Number.NEGATIVE_INFINITY }).element;
}
