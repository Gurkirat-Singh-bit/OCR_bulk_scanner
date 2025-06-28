// 1-10: Initialize DOM elements and application state
document.addEventListener('DOMContentLoaded', function() {
    // Core DOM elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const uploadForm = document.getElementById('uploadForm');
    const filePreview = document.getElementById('filePreview');
    const previewGrid = document.getElementById('previewGrid');
    const clearBtn = document.getElementById('clearBtn');
    const submitBtn = document.getElementById('submitBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const fileCount = document.getElementById('fileCount');
    const progressBar = document.getElementById('progressBar');
    const successToast = document.getElementById('successToast');
    const recentResults = document.getElementById('recentResults');

    // 11-20: Application state and configuration (removed limits for bulk processing)
    let selectedFiles = [];
    let uploadInProgress = false;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];  // Updated to match backend
    // Removed maxFileSize and maxFiles limits for bulk processing

    // Initialize app
    initializeApp();

    // 21-40: App initialization and event listeners
    function initializeApp() {
        setupEventListeners();
        loadRecentResults();
        addAnimationObserver();
        setupKeyboardShortcuts();
    }

    function setupEventListeners() {
        // File input events
        dropzone.addEventListener('click', () => fileInput.click());
        browseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
        fileInput.addEventListener('change', handleFileSelect);

        // Drag and drop events
        setupDragAndDrop();

        // Form events
        uploadForm.addEventListener('submit', handleFormSubmit);
        clearBtn.addEventListener('click', clearAllFiles);

        // Auto-hide alerts
        setTimeout(hideAlerts, 5000);
    }

    // 41-60: Drag and drop functionality
    function setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, unhighlight, false);
        });

        dropzone.addEventListener('drop', handleDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropzone.classList.add('dragover');
        addGlowEffect();
    }

    function unhighlight() {
        dropzone.classList.remove('dragover');
        removeGlowEffect();
    }

    function addGlowEffect() {
        dropzone.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.6)';
    }

    function removeGlowEffect() {
        dropzone.style.boxShadow = '';
    }

    // 61-80: File handling functions
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
        showDropAnimation();
    }

    function handleFileSelect(e) {
        handleFiles(e.target.files);
    }

    function handleFiles(files) {
        if (uploadInProgress) {
            showNotification('Upload in progress, please wait...', 'warning');
            return;
        }

        const fileArray = Array.from(files);
        let validFiles = 0;

        fileArray.forEach(file => {
            if (!validateFile(file)) return;

            selectedFiles.push({
                file: file,
                id: generateFileId(),
                preview: URL.createObjectURL(file)
            });
            validFiles++;
        });

        if (validFiles > 0) {
            updateFilePreview();
            showNotification(`${validFiles} file(s) added successfully`, 'success');
        }
    }

    // 81-100: File validation (removed size limits for bulk processing)
    function validateFile(file) {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            showNotification(`${file.name}: Unsupported file format. Please upload PNG, JPG, JPEG, or WEBP only.`, 'error');
            return false;
        }

        // Check for duplicates
        const isDuplicate = selectedFiles.some(selectedFile => 
            selectedFile.file.name === file.name && 
            selectedFile.file.size === file.size
        );

        if (isDuplicate) {
            showNotification(`${file.name}: File already selected`, 'warning');
            return false;
        }

        return true;
    }

    function generateFileId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // 101-120: File preview management
    function updateFilePreview() {
        fileCount.textContent = `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`;
        
        if (selectedFiles.length === 0) {
            filePreview.style.display = 'none';
            return;
        }

        filePreview.style.display = 'block';
        previewGrid.innerHTML = '';

        selectedFiles.forEach((fileObj, index) => {
            const previewItem = createPreviewItem(fileObj, index);
            previewGrid.appendChild(previewItem);
        });

        // Animate preview items
        animatePreviewItems();
    }

    function createPreviewItem(fileObj, index) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.setAttribute('data-file-id', fileObj.id);

        previewItem.innerHTML = `
            <img src="${fileObj.preview}" alt="${fileObj.file.name}" />
            <div class="file-info">${truncateFileName(fileObj.file.name, 15)}</div>
            <button type="button" class="remove-btn" onclick="removeFile('${fileObj.id}')" title="Remove file">
                <i class="fas fa-times"></i>
            </button>
        `;

        return previewItem;
    }

    function truncateFileName(name, maxLength) {
        if (name.length <= maxLength) return name;
        const ext = name.split('.').pop();
        const nameWithoutExt = name.substr(0, name.lastIndexOf('.'));
        const truncated = nameWithoutExt.substr(0, maxLength - ext.length - 4) + '...';
        return truncated + '.' + ext;
    }

    // 121-140: File removal and clearing
    window.removeFile = function(fileId) {
        const fileIndex = selectedFiles.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
            URL.revokeObjectURL(selectedFiles[fileIndex].preview);
            selectedFiles.splice(fileIndex, 1);
            updateFilePreview();
            showNotification('File removed', 'info');
        }
    };

    function clearAllFiles() {
        selectedFiles.forEach(fileObj => {
            URL.revokeObjectURL(fileObj.preview);
        });
        selectedFiles = [];
        fileInput.value = '';
        updateFilePreview();
        showNotification('All files cleared', 'info');
    }

    // 141-180: Enhanced form submission with bulk processing support
    function handleFormSubmit(e) {
        e.preventDefault();

        if (uploadInProgress) {
            showNotification('Upload already in progress', 'warning');
            return;
        }

        if (selectedFiles.length === 0) {
            showNotification('Please select at least one file', 'error');
            return;
        }

        const fileCount = selectedFiles.length;
        uploadInProgress = true;
        
        // Show enhanced loading with file count
        showLoadingOverlay();
        updateLoadingMessage(`Processing ${fileCount} file${fileCount !== 1 ? 's' : ''}...`);
        animateProgressBar();

        const formData = new FormData();
        selectedFiles.forEach(fileObj => {
            formData.append('files', fileObj.file);
        });

        console.log(`🚀 Starting bulk upload of ${fileCount} files`);

        // Start immediate upload for bulk processing
        submitFormData(formData);
    }

    function updateLoadingMessage(message) {
        const loadingElement = document.querySelector('.loading-spinner h3');
        if (loadingElement) {
            loadingElement.textContent = message;
        }
    }

    function submitFormData(formData) {
        fetch(uploadForm.action, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            handleUploadSuccess(html);
        })
        .catch(error => {
            handleUploadError(error);
        })
        .finally(() => {
            uploadInProgress = false;
            hideLoadingOverlay();
        });
    }

    // 181-200: Upload response handling
    function handleUploadSuccess(html) {
        // Parse response for flash messages
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const messages = tempDiv.querySelectorAll('.alert');

        if (messages.length > 0) {
            updateFlashMessages(messages);
            
            // Check for success messages
            const successMessages = tempDiv.querySelectorAll('.alert-success');
            if (successMessages.length > 0) {
                showSuccessToast();
                clearAllFiles();
                loadRecentResults(); // Refresh recent results
            }
        } else {
            showNotification('Files processed successfully!', 'success');
            clearAllFiles();
            loadRecentResults();
        }

        // Scroll to top to show messages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleUploadError(error) {
        console.error('Upload error:', error);
        showNotification('Upload failed. Please try again.', 'error');
    }

    function updateFlashMessages(messages) {
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.innerHTML = '';

        messages.forEach(message => {
            const clonedMessage = message.cloneNode(true);
            clonedMessage.classList.add('slide-down');
            messagesContainer.appendChild(clonedMessage);
        });

        // Auto-hide after delay
        setTimeout(hideAlerts, 5000);
    }

    // 201-220: UI feedback and animations
    function showLoadingOverlay() {
        loadingOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function hideLoadingOverlay() {
        loadingOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (progressBar) progressBar.style.width = '0%';
    }

    function animateProgressBar() {
        if (!progressBar) return;
        
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 15;
            if (width >= 90) {
                width = 90;
                clearInterval(interval);
            }
            progressBar.style.width = width + '%';
        }, 200);
    }

    function showSuccessToast() {
        if (successToast) {
            successToast.classList.add('show');
            setTimeout(() => {
                successToast.classList.remove('show');
            }, 3000);
        }
    }

    function showDropAnimation() {
        dropzone.style.transform = 'scale(0.98)';
        setTimeout(() => {
            dropzone.style.transform = 'scale(1)';
        }, 150);
    }

    function animatePreviewItems() {
        const items = previewGrid.querySelectorAll('.preview-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('scale-in');
        });
    }

    // 221-240: Recent results loading with proper API integration
    function loadRecentResults() {
        if (!recentResults) return;

        console.log('🔄 Loading recent extractions...');

        // Show loading state
        recentResults.innerHTML = `
            <div class="loading-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading recent results...</p>
            </div>
        `;

        // Fetch recent results from API
        fetch('/api/recent')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load results');
                }
                return response.json();
            })
            .then(data => {
                console.log('✅ Recent extractions loaded:', data);
                if (data.success) {
                    displayRecentResults(data.data);
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(error => {
                console.error('❌ Error loading recent results:', error);
                displayNoResults();
            });
    }

    function displayRecentResults(results) {
        if (!results || results.length === 0) {
            displayNoResults();
            return;
        }

        console.log(`📊 Displaying ${results.length} recent extractions`);

        let html = '<div class="recent-table">';
        results.forEach((extraction, index) => {
            html += `
                <div class="recent-item" data-index="${index}">
                    <div class="recent-item-header">
                        <h4>${extraction.name || 'Unknown Name'}</h4>
                        <span class="recent-badge">${extraction.filename || 'N/A'}</span>
                    </div>
                    <div class="recent-item-details">
                        ${extraction.company ? `<p><i class="fas fa-building"></i> ${extraction.company}</p>` : ''}
                        ${extraction.email ? `<p><i class="fas fa-envelope"></i> ${extraction.email}</p>` : ''}
                        ${extraction.phone ? `<p><i class="fas fa-phone"></i> ${extraction.phone}</p>` : ''}
                        ${extraction.website ? `<p><i class="fas fa-globe"></i> ${extraction.website}</p>` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        recentResults.innerHTML = html;
    }

    function displayNoResults() {
        recentResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-inbox"></i>
                <h4>No extractions yet</h4>
                <p>Upload some business cards to see results here</p>
            </div>
        `;
    }

    // 241-260: Utility functions
    function showNotification(message, type = 'info') {
        const messagesContainer = document.querySelector('.messages-container');
        if (!messagesContainer) return;

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} slide-down`;

        const icon = getIconForType(type);
        alertDiv.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
        `;

        messagesContainer.appendChild(alertDiv);

        // Auto-remove after delay
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 4000);
    }

    function getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    function hideAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            if (!alert.classList.contains('manual')) {
                alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.remove();
                    }
                }, 500);
            }
        });
    }

    // 261-280: Additional features
    function addAnimationObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        });

        document.querySelectorAll('.card-hover').forEach(card => {
            observer.observe(card);
        });
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + U for upload
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                fileInput.click();
            }

            // Escape to clear files
            if (e.key === 'Escape' && selectedFiles.length > 0) {
                clearAllFiles();
            }

            // Enter to submit (when files are selected)
            if (e.key === 'Enter' && selectedFiles.length > 0 && !uploadInProgress) {
                e.preventDefault();
                handleFormSubmit(e);
            }
        });
    }

    // 281-300: Portfolio and external links
    const portfolioBtn = document.getElementById('portfolioBtn');
    if (portfolioBtn) {
        portfolioBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Add your portfolio URL here
            const portfolioUrl = 'https://your-portfolio-url.com';
            window.open(portfolioUrl, '_blank');
            
            // Add click tracking or analytics here if needed
            console.log('Portfolio link clicked');
        });
    }

    // Add hover effects for social buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px) scale(1.1)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Initialize success
    console.log('🚀 Visiting Card OCR App initialized successfully!');
    console.log('📝 Supported formats:', allowedTypes.join(', '));
    // Debug info (removed file limits for bulk processing)
    console.log('🎯 Bulk processing enabled - no file limits');

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
