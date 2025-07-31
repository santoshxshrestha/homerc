function showCanvas() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("canvasPage").style.display = "grid";
    initCanvas();
}

function showHomepage() {
    document.getElementById("homepage").style.display = "grid";
    document.getElementById("canvasPage").style.display = "none";
}

// DateTime functionality
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };
    const dateTimeElements = document.querySelectorAll(".datetime, #datetime");
    dateTimeElements.forEach((el) => {
        el.textContent = now.toLocaleDateString("en-US", options);
    });
}

// Todo functionality
let todos = [];

function saveTodos() {
    try {
        localStorage.setItem("todos", JSON.stringify(todos));
    } catch (e) {
        console.log("Storage not available");
    }
}

function loadTodos() {
    try {
        const stored = localStorage.getItem("todos");
        if (stored) {
            todos = JSON.parse(stored);
        }
    } catch (e) {
        console.log("Could not load todos", e);
    }
}

function renderTodos() {
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";

    todos.forEach((todo, index) => {
        const todoItem = document.createElement("div");
        todoItem.className = `todo-item ${todo.completed ? "completed" : ""}`;

        todoItem.innerHTML = `
                    <div class="todo-checkbox ${todo.completed ? "checked" : ""}" onclick="toggleTodo(${index})"></div>
                    <span class="todo-text">${todo.text}</span>
                    <button class="delete-btn" onclick="deleteTodo(${index})">Delete</button>
`;

        todoList.appendChild(todoItem);
    });
}

function addTodo() {
    const input = document.getElementById("todoInput");
    const text = input.value.trim();

    if (text) {
        todos.push({ text, completed: false });
        input.value = "";
        saveTodos();
        loadTodos();
        renderTodos();
    }
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

// Calendar functionality
function generateCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    // Header
    const headerRow = calendar.insertRow();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach((day) => {
        const th = document.createElement("th");
        th.textContent = day;
        headerRow.appendChild(th);
    });

    let date = 1;
    let nextMonthDate = 1;

    for (let i = 0; i < 6; i++) {
        const row = calendar.insertRow();

        for (let j = 0; j < 7; j++) {
            const cell = row.insertCell();

            if (i === 0 && j < firstDay) {
                // Previous month days
                cell.textContent = daysInPrevMonth - firstDay + j + 1;
                cell.className = "other-month";
            } else if (date > daysInMonth) {
                // Next month days
                cell.textContent = nextMonthDate++;
                cell.className = "other-month";
            } else {
                // Current month days
                cell.textContent = date;
                if (date === today) {
                    cell.className = "today";
                }
                date++;
            }
        }

        if (date > daysInMonth && nextMonthDate > 7) break;
    }
}

// Canvas functionality
let canvas, ctx;
let isDrawing = false;
let currentColor = "#000000";
let currentSize = 5;

function initCanvas() {
    canvas = document.getElementById("drawingCanvas");
    if (!canvas) return;

    ctx = canvas.getContext("2d");

    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth - 4; // Account for border
        canvas.height = container.clientHeight - 4;

        // Reset drawing style after resize
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }

    resizeCanvas();

    // Canvas event listeners
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    // Touch events for mobile
    canvas.addEventListener("touchstart", handleTouch);
    canvas.addEventListener("touchmove", handleTouch);
    canvas.addEventListener("touchend", stopDrawing);

    // Color and size controls
    document.getElementById("colorPicker").addEventListener("change", (e) => {
        currentColor = e.target.value;
    });

    document.getElementById("brushSize").addEventListener("input", (e) => {
        currentSize = e.target.value;
    });
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentColor;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(
        e.type === "touchstart"
            ? "mousedown"
            : e.type === "touchmove"
                ? "mousemove"
                : "mouseup",
        {
            clientX: touch.clientX,
            clientY: touch.clientY,
        },
    );
    canvas.dispatchEvent(mouseEvent);
}

function clearCanvas() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function saveCanvas() {
    if (canvas) {
        const link = document.createElement("a");
        link.download = "drawing.png";
        link.href = canvas.toDataURL();
        link.click();
    }
}

// Event listeners
document.getElementById("todoInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTodo();
    }
});

// Initialize everything
window.addEventListener("load", () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadTodos();
    renderTodos();
    generateCalendar();
});
