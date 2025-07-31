let canvas, ctx;
let isDrawing = false;
let currentTool = "brush";
let currentColor = "#000000";
let currentSize = 5;
let lastX = 0;
let lastY = 0;

// Initialize canvas
function initCanvas() {
    canvas = document.getElementById("drawingCanvas");
    ctx = canvas.getContext("2d");

    // Set canvas properties
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;

    // Update canvas size display
    updateCanvasSize();

    // Event listeners
    setupEventListeners();

    // Initialize cursor preview
    setupCursorPreview();
}

function setupEventListeners() {
    // Mouse events
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
    canvas.addEventListener("mousemove", updateCoordinates);

    // Touch events
    canvas.addEventListener("touchstart", handleTouch, { passive: false });
    canvas.addEventListener("touchmove", handleTouch, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    // Tool controls
    document
        .getElementById("colorPicker")
        .addEventListener("change", updateColor);
    document.getElementById("brushSize").addEventListener("input", updateSize);

    // Prevent scrolling on touch devices
    document.body.addEventListener("touchstart", (e) => e.preventDefault(), {
        passive: false,
    });
    document.body.addEventListener("touchend", (e) => e.preventDefault(), {
        passive: false,
    });
    document.body.addEventListener("touchmove", (e) => e.preventDefault(), {
        passive: false,
    });
}

function setupCursorPreview() {
    const preview = document.getElementById("cursorPreview");
    const canvasWrapper = document.querySelector(".canvas-wrapper");

    canvas.addEventListener("mouseenter", () => {
        preview.style.display = "block";
        updateCursorPreview();
    });

    canvas.addEventListener("mouseleave", () => {
        preview.style.display = "none";
    });

    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        preview.style.left =
            e.clientX - canvasWrapper.getBoundingClientRect().left + "px";
        preview.style.top =
            e.clientY - canvasWrapper.getBoundingClientRect().top + "px";
    });
}

function updateCursorPreview() {
    const preview = document.getElementById("cursorPreview");
    preview.style.width = currentSize + "px";
    preview.style.height = currentSize + "px";
    preview.style.borderColor =
        currentTool === "eraser" ? "#f44336" : currentColor;
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    ctx.lineWidth = currentSize;

    if (currentTool === "brush") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = currentColor;
    } else if (currentTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
    }

    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastX = currentX;
    lastY = currentY;
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
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

function updateCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    document.getElementById("coordinates").textContent = `${x}, ${y}`;
}

function setTool(tool) {
    currentTool = tool;

    // Update UI
    document.querySelectorAll(".tool-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    document.getElementById(tool + "Tool").classList.add("active");

    // Update status
    document.getElementById("currentTool").textContent =
        tool.charAt(0).toUpperCase() + tool.slice(1);

    // Update cursor
    canvas.style.cursor = tool === "eraser" ? "crosshair" : "crosshair";
    updateCursorPreview();
}

function updateColor(e) {
    currentColor = e.target.value;
    updateCursorPreview();
}

function updateSize(e) {
    currentSize = e.target.value;
    document.getElementById("sizeDisplay").textContent = currentSize + "px";
    document.getElementById("currentSize").textContent = currentSize + "px";
    updateCursorPreview();
}

function clearCanvas() {
    if (
        confirm(
            "Are you sure you want to clear the canvas? This action cannot be undone.",
        )
    ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function newCanvas() {
    if (confirm("Create a new canvas? Current drawing will be lost.")) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function saveCanvas() {
    // Save to browser's download folder
    downloadCanvas();
}

function downloadCanvas() {
    // Create a new canvas with white background
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fill with white background
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the original canvas on top
    tempCtx.drawImage(canvas, 0, 0);

    // Download
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    link.download = `drawing-${timestamp}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
}

function updateCanvasSize() {
    document.getElementById("canvasSize").textContent =
        `${canvas.width} × ${canvas.height}`;
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case "s":
                e.preventDefault();
                saveCanvas();
                break;
            case "z":
                e.preventDefault();
                // Could implement undo here
                break;
        }
    }

    // Tool shortcuts
    switch (e.key.toLowerCase()) {
        case "b":
            setTool("brush");
            break;
        case "e":
            setTool("eraser");
            break;
        case "c":
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                clearCanvas();
            }
            break;
    }
});

// Initialize when page loads
window.addEventListener("load", initCanvas);

// Handle window resize
window.addEventListener("resize", () => {
    updateCursorPreview();
});
