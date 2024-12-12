const DateTime = luxon.DateTime;
let todos = [];
let calendar;
let calendarEvents = {};

// Initializer
function init() {
    updateDateDisplay();
    loadTodos();
    getQuote();
    setInterval(updateDateDisplay, 1000);

    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: getCalendarEventsArray(), 
    });
    calendar.render();
}

// Create the events array for FullCalendar
function getCalendarEventsArray() {
    const eventsArray = [];
    for (const date in calendarEvents) {
        calendarEvents[date].forEach(event => {
            eventsArray.push({ title: event.text, start: date });
        });
    }
    return eventsArray;
}

function updateCalendarEvents() {
    calendarEvents = {}; 

    todos.forEach(todo => {
        if (todo.date) {
            if (!calendarEvents[todo.date]) {
                calendarEvents[todo.date] = [];
            }
            // Check if the event already exists for this date
            const existingEventIndex = calendarEvents[todo.date].findIndex(event => event.id === todo.id);

            if (existingEventIndex === -1) { // If event doesn't exist, add it
                calendarEvents[todo.date].push({ text: todo.text, id: todo.id });
            }
        }
    });
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
    updateCalendarEvents(); // Update the events dictionary
    calendar.setOption('events', getCalendarEventsArray()); // Set events using the array
    input.value = "";
    dateInput.value = "";
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
    updateCalendarEvents();
    calendar.setOption('events', getCalendarEventsArray());
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
        updateCalendarEvents(); // Initialize calendarEvents when loading
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
