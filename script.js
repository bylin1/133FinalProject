const DateTime = luxon.DateTime;
let todos = [];

// Initialize Website
function init() {
    updateDateDisplay();
    loadTodos();
    getQuote();
    setInterval(updateDateDisplay, 1000);
}

// Update date display
function updateDateDisplay() {
    const now = DateTime.local();
    
    document.getElementById('currentTime').textContent = 
        now.toLocaleString(DateTime.TIME_WITH_SECONDS);
    
    document.getElementById('currentDate').textContent = 
        now.toLocaleString({ 
            weekday: 'long',
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
}

// Todo functions
function addTodo() {
    const input = document.getElementById('todoInput');
    const dateInput = document.getElementById('todoDate');

    const todo = {
        id: Date.now(),
        text: input.value,
        completed: false,
        date: dateInput.value || null
    };

    todos.push(todo);
    saveTodos();
    reloadTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        reloadTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    reloadTodos();
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        const newText = prompt('Edit task:', todo.text);
        if (newText !== null) {
            todo.text = newText;
            saveTodos();
            reloadTodos();
        }
    }
}

function reloadTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');
        todoItem.classList.toggle('completed', todo.completed);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.onclick = () => toggleTodo(todo.id);

        const text = document.createElement('span');
        text.textContent = todo.text;
        if (todo.date) {
            text.textContent += ` (${todo.date})`;
        }

        const actions = document.createElement('div');
        actions.className = 'todo-actions';

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editTodo(todo.id);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteTodo(todo.id);

        
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        todoItem.appendChild(checkbox);
        todoItem.appendChild(text);
        todoItem.appendChild(actions);
        todoList.appendChild(todoItem);
    });
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        todos = JSON.parse(stored);
        reloadTodos();
    }
}

// Theme toggler
const toggleThemeButton = document.getElementById('toggleTheme');

toggleThemeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        document.documentElement.style.setProperty('--bg-color', 'var(--bg-color-dark)');
        document.documentElement.style.setProperty('--text-color', 'var(--text-color-dark)');
        document.documentElement.style.setProperty('--border-color', 'var(--border-color-dark)');
        document.documentElement.style.setProperty('--highlight-color', 'var(--highlight-color-dark)');
        document.documentElement.style.setProperty('--secondary-bg', 'var(--secondary-bg-dark)');
        toggleThemeButton.textContent = 'Light Mode';
    } else {
        document.documentElement.style.setProperty('--bg-color', '#ffffff');
        document.documentElement.style.setProperty('--text-color', '#333333');
        document.documentElement.style.setProperty('--border-color', '#e0e0e0');
        document.documentElement.style.setProperty('--highlight-color', '#4a90e2');
        document.documentElement.style.setProperty('--secondary-bg', '#f5f5f5');
        toggleThemeButton.textContent = 'Dark Mode';
    }
});

// Daily Quote
async function getQuote() {
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const refreshButton = document.getElementById('refreshQuote');
    
    if (refreshButton) {
        refreshButton.disabled = true;
    }

    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        
        quoteText.textContent = `"${data.content}"`;
        quoteAuthor.textContent = `— ${data.author}`;
    } catch (error) {
        console.error('Error fetching quote:', error);
        quoteText.textContent = 'Failed to load quote';
        quoteAuthor.textContent = '';
    } finally {
        if (refreshButton) {
            refreshButton.disabled = false;
        }
    }
}

init();
