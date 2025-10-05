let appData = {
    profile: { name: '', photo: '', tools: { accounts: true, clipboard: true, notes: true } },
    accounts: [],
    clipboard: [],
    notes: [],
    appearance: { theme: 'dark', accentColor: '#FF5252' }
};

let cropperData = { x: 50, y: 50, size: 200, imageData: null };

// Startup functions
function showWelcome() {
    document.getElementById('welcomeButtons').classList.remove('hidden');
    document.getElementById('loadAccountForm').classList.add('hidden');
    document.getElementById('createAccountForm').classList.add('hidden');
}

function showLoadAccount() {
    document.getElementById('welcomeButtons').classList.add('hidden');
    document.getElementById('loadAccountForm').classList.remove('hidden');
    setupFileUpload();
}

function setupFileUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('loadFile');
    const fileSelected = document.getElementById('fileSelected');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileSelected.textContent = `✓ ${e.target.files[0].name}`;
            fileSelected.classList.add('show');
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.json')) {
            fileInput.files = files;
            fileSelected.textContent = `✓ ${files[0].name}`;
            fileSelected.classList.add('show');
        }
    });
}

function showCreateAccount() {
    document.getElementById('welcomeButtons').classList.add('hidden');
    document.getElementById('createAccountForm').classList.remove('hidden');
    initCropper();
}

function initCropper() {
    const fileInput = document.getElementById('createPhotoFile');
    const container = document.getElementById('cropperContainer');
    const image = document.getElementById('cropperImage');
    const circle = document.getElementById('cropCircle');
    const sizeControl = document.getElementById('cropSize');
    const uploadBtn = document.getElementById('photoUploadBtn');
    const uploadText = document.getElementById('photoUploadText');

    // Evitar múltiples event listeners
    fileInput.removeEventListener('change', handleFileChange);
    fileInput.addEventListener('change', handleFileChange);

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                image.src = event.target.result;
                cropperData.imageData = event.target.result;
                
                // Esperar a que la imagen cargue para obtener dimensiones correctas
                image.onload = function() {
                    container.classList.remove('hidden');
                    uploadBtn.classList.add('file-selected-state');
                    uploadText.textContent = `Cambiar imagen`;
                    
                    // Resetear posición y tamaño al centro
                    const containerWidth = 300;
                    const initialSize = 200;
                    cropperData.size = initialSize;
                    cropperData.x = (containerWidth - initialSize) / 2;
                    cropperData.y = (containerWidth - initialSize) / 2;
                    
                    circle.style.width = initialSize + 'px';
                    circle.style.height = initialSize + 'px';
                    circle.style.left = cropperData.x + 'px';
                    circle.style.top = cropperData.y + 'px';
                    
                    // Actualizar rango máximo basado en el contenedor
                    sizeControl.max = containerWidth;
                    sizeControl.value = initialSize;
                };
            };
            reader.readAsDataURL(file);
        }
    }

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    circle.addEventListener('mousedown', function(e) {
        isDragging = true;
        const rect = circle.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const containerRect = document.querySelector('.image-cropper-container').getBoundingClientRect();
            
            let newX = e.clientX - containerRect.left - offsetX;
            let newY = e.clientY - containerRect.top - offsetY;
            
            const maxX = 300 - cropperData.size;
            const maxY = 300 - cropperData.size;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            cropperData.x = newX;
            cropperData.y = newY;
            circle.style.left = newX + 'px';
            circle.style.top = newY + 'px';
        }
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
        }
    });

    sizeControl.addEventListener('input', function() {
        const newSize = parseInt(this.value);
        const containerSize = 300;
        
        cropperData.size = newSize;
        circle.style.width = newSize + 'px';
        circle.style.height = newSize + 'px';
        
        const maxX = containerSize - newSize;
        const maxY = containerSize - newSize;
        
        if (cropperData.x > maxX) {
            cropperData.x = maxX;
            circle.style.left = maxX + 'px';
        }
        if (cropperData.y > maxY) {
            cropperData.y = maxY;
            circle.style.top = maxY + 'px';
        }
    });
}

function getCroppedImage() {
    const image = document.getElementById('cropperImage');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = cropperData.size;
    canvas.height = cropperData.size;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const sourceX = cropperData.x * scaleX;
    const sourceY = cropperData.y * scaleY;
    const sourceSize = cropperData.size * scaleX;
    
    ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, cropperData.size, cropperData.size);
    return canvas.toDataURL('image/png');
}

function loadAccount() {
    const file = document.getElementById('loadFile').files[0];
    if (!file) {
        showNotification('Por favor selecciona un archivo', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            appData = JSON.parse(e.target.result);
            // Guardar datos en sessionStorage para el dashboard
            sessionStorage.setItem('shizenData', JSON.stringify(appData));
            showNotification('Cuenta cargada exitosamente', 'success');
            // Redirigir al dashboard después de 1 segundo
            setTimeout(() => {
                window.location.href = 'shizen.html';
            }, 1000);
        } catch (error) {
            showNotification('Error al cargar el archivo', 'error');
        }
    };
    reader.readAsText(file);
}

function createAccount() {
    const name = document.getElementById('createName').value.trim();

    if (!name) {
        showNotification('Por favor ingresa tu nombre', 'error');
        return;
    }

    if (!cropperData.imageData) {
        showNotification('Por favor selecciona una foto de perfil', 'error');
        return;
    }

    const croppedPhoto = getCroppedImage();

    appData.profile = {
        name: name,
        photo: croppedPhoto,
        tools: {
            accounts: true,
            clipboard: true,
            notes: true
        }
    };

    // Guardar datos en sessionStorage para el dashboard
    sessionStorage.setItem('shizenData', JSON.stringify(appData));
    
    // Exportar archivo automáticamente
    exportData();
    
    showNotification('Cuenta creada exitosamente', 'success');
    
    // Redirigir al dashboard después de 1.5 segundos
    setTimeout(() => {
        window.location.href = 'shizen.html';
    }, 1500);
}

function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shizen-${appData.profile.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.background = type === 'success' ? 'linear-gradient(135deg, #81C784, #66BB6A)' : 'linear-gradient(135deg, #FF5252, #EF4444)';
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}