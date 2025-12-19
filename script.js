// Elements
const fileInput = document.querySelector("#image-input");
const canvas = document.querySelector("#image-canvas");
const ctx = canvas.getContext("2d");
const placeholder = document.querySelector("#placeholder");
const filtersContainer = document.querySelector("#filters-container");
const presetsContainer = document.querySelector("#presets-container");
const resetBtn = document.querySelector("#reset-btn");
const downloadBtn = document.querySelector("#download-btn");

// (no header bindings in original version)

let img = new Image();

// Exact object structure from video
const defaultFilters = {
    brightness: { value: 100, max: 200, min: 0, unit: "%" },
    contrast: { value: 100, max: 200, min: 0, unit: "%" },
    saturate: { value: 100, max: 200, min: 0, unit: "%" },
    grayscale: { value: 0, max: 100, min: 0, unit: "%" },
    sepia: { value: 0, max: 100, min: 0, unit: "%" },
    "hue-rotate": { value: 0, max: 360, min: 0, unit: "deg" }, // Note: string key for hyphen
    blur: { value: 0, max: 20, min: 0, unit: "px" },
    opacity: { value: 100, max: 100, min: 0, unit: "%" },
    invert: { value: 0, max: 100, min: 0, unit: "%" }
};

let filters = JSON.parse(JSON.stringify(defaultFilters));

const presets = {
    vintage: { brightness: 120, sepia: 50, contrast: 85, saturate: 120 },
    noir: { grayscale: 100, contrast: 120, brightness: 90 },
    warm: { sepia: 30, contrast: 105, brightness: 110, saturate: 130 },
    cool: { "hue-rotate": 180, contrast: 100 },
    drama: { contrast: 130, brightness: 90, saturate: 110, blur: 0.5 }
};

// Function to create filter sliders (As named in video: createFilterElement)
function createFilterElement(key, filter) {
    const div = document.createElement("div");
    div.classList.add("filter-wrapper");

    // Create Label and Value display
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("filter-info");
    const label = document.createElement("label");
    label.innerText = key;
    const span = document.createElement("span");
    span.id = `val-${key}`;
    span.innerText = `${filter.value}${filter.unit}`;

    infoDiv.appendChild(label);
    infoDiv.appendChild(span);

    // Create Input Slider
    const input = document.createElement("input");
    input.type = "range";
    input.min = filter.min;
    input.max = filter.max;
    input.value = filter.value;
    input.id = `inp-${key}`;
    
    // Add event listener for real-time updates
    input.addEventListener("input", (e) => {
        filters[key].value = e.target.value;
        span.innerText = `${e.target.value}${filter.unit}`;
        applyFilters();
    });

    div.appendChild(infoDiv);
    div.appendChild(input);
    filtersContainer.appendChild(div);
}

// Render the filters
Object.keys(filters).forEach(key => {
    createFilterElement(key, filters[key]);
});

// Render Presets
Object.keys(presets).forEach(key => {
    const btn = document.createElement("button");
    btn.innerText = key;
    btn.classList.add("preset-btn");
    btn.addEventListener("click", () => {
        // Reset filters first
        filters = JSON.parse(JSON.stringify(defaultFilters));
        
        // Apply preset values
        const preset = presets[key];
        Object.keys(preset).forEach(filterKey => {
            if(filters[filterKey]) {
                filters[filterKey].value = preset[filterKey];
            }
        });
        
        // Update UI Sliders
        updateUI();
        applyFilters();
    });
    presetsContainer.appendChild(btn);
});

// Helper to update sliders after reset or preset
function updateUI() {
    Object.keys(filters).forEach(key => {
        const input = document.getElementById(`inp-${key}`);
        const span = document.getElementById(`val-${key}`);
        input.value = filters[key].value;
        span.innerText = `${filters[key].value}${filters[key].unit}`;
    });
}

// File Input Event (Using URL.createObjectURL as per video)
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
        img.src = URL.createObjectURL(file);
    }
});

// Load Image to Canvas
img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.display = "block";
    placeholder.style.display = "none";
    applyFilters();
};

// Apply Filters Function (The Backbone)
function applyFilters() {
    // Canvas 2D Context Filter String
    const filterString = Object.keys(filters).map(key => {
        return `${key}(${filters[key].value}${filters[key].unit})`;
    }).join(" ");

    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

// Download functionality
downloadBtn.addEventListener("click", () => {
    if(!img.src) return;
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = canvas.toDataURL();
    link.click();
});

// Reset functionality
resetBtn.addEventListener("click", () => {
    filters = JSON.parse(JSON.stringify(defaultFilters));
    updateUI();
    applyFilters();
});