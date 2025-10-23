const compressBtn = document.getElementById('compressBtn');
const decompressBtn = document.getElementById('decompressBtn');
const imageBtn = document.getElementById('imageBtn');
const textBtn = document.getElementById('textBtn');
const qualityControl = document.getElementById('qualityControl');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const actionButtons = document.getElementById('actionButtons');
const submitBtn = document.getElementById('submitBtn');
const downloadBtn = document.getElementById('downloadBtn');

let currentMode = "compress";
let currentType = "image";
let selectedFile = null;

// Mode selection
compressBtn.addEventListener('click', () => {
    compressBtn.classList.add('active');
    decompressBtn.classList.remove('active');
    currentMode = "compress";
    updateQualityControl();
});

decompressBtn.addEventListener('click', () => {
    decompressBtn.classList.add('active');
    compressBtn.classList.remove('active');
    currentMode = "decompress";
    updateQualityControl();
});

// Type selection
imageBtn.addEventListener('click', () => {
    imageBtn.classList.add('active');
    textBtn.classList.remove('active');
    currentType = "image";
    updateQualityControl();
});

textBtn.addEventListener('click', () => {
    textBtn.classList.add('active');
    imageBtn.classList.remove('active');
    currentType = "text";
    updateQualityControl();
});

function updateQualityControl() {
    // Show quality slider only for image + compress mode
    if (currentType === "image" && currentMode === "compress") {
        qualityControl.style.display = 'block';
    } else {
        qualityControl.style.display = 'none';
    }
}

// Drop zone behavior
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#b2dfdb';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
});

function handleFileSelect(file) {
    if (file) {
        selectedFile = file;
        alert(`File "${file.name}" selected!`);
        actionButtons.style.display = 'flex';
    }
}

// Submit to Flask
submitBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        alert("Please select a file first!");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mode", currentMode);
    formData.append("type", currentType);

    const quality = document.getElementById('quality').value;
    formData.append("quality", quality);

    submitBtn.textContent = "Processing...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("/process", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Processing failed!");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Show and trigger download
        downloadBtn.style.display = "block";
        downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = url;
            a.download = selectedFile.name;
            a.click();
        };

        alert("Processing completed! Click 'Download' to save your file.");
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        submitBtn.textContent = "Submit";
        submitBtn.disabled = false;
    }
});
