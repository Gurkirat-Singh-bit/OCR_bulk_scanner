// Global functions to be accessible from onclick handlers
window.openApiKeyModal = function() {
    const apiKeyModalOverlay = document.getElementById('apiKeyModalOverlay');
    if (apiKeyModalOverlay) {
        apiKeyModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeApiKeyModal = function() {
    const apiKeyModalOverlay = document.getElementById('apiKeyModalOverlay');
    if (apiKeyModalOverlay) {
        apiKeyModalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        // Reset form
        const apiKeyForm = document.getElementById('apiKeyForm');
        const apiKeyResult = document.getElementById('apiKeyResult');
        if (apiKeyForm) apiKeyForm.reset();
        if (apiKeyResult) apiKeyResult.style.display = 'none';
    }
};

// API Modal Management
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const apiDocsBtn = document.getElementById('apiDocsBtn');
    const viewDocsBtn = document.getElementById('viewDocsBtn');
    const getApiKeyBtn = document.getElementById('getApiKeyBtn');
    const apiModalOverlay = document.getElementById('apiModalOverlay');
    const apiKeyModalOverlay = document.getElementById('apiKeyModalOverlay');
    const closeApiModal = document.getElementById('closeApiModal');
    const closeApiKeyModal = document.getElementById('closeApiKeyModal');
    const apiKeyForm = document.getElementById('apiKeyForm');
    const apiKeyResult = document.getElementById('apiKeyResult');
    const copyApiKey = document.getElementById('copyApiKey');

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Language tab functionality
    const langBtns = document.querySelectorAll('.lang-btn');
    const langContents = document.querySelectorAll('.lang-content');

    // Copy button functionality
    const copyBtns = document.querySelectorAll('.copy-btn');

    // Open API Documentation Modal
    function openApiModal() {
        apiModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close API Documentation Modal
    function closeApiDocModal() {
        apiModalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Open API Key Modal
    function openApiKeyModal() {
        apiKeyModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close API Key Modal
    function closeApiKeyModal() {
        apiKeyModalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        // Reset form
        apiKeyForm.reset();
        apiKeyResult.style.display = 'none';
    }

    // Event listeners for modal buttons
    if (apiDocsBtn) {
        apiDocsBtn.addEventListener('click', openApiModal);
    }
    
    if (viewDocsBtn) {
        viewDocsBtn.addEventListener('click', openApiModal);
    }
    
    if (getApiKeyBtn) {
        getApiKeyBtn.addEventListener('click', openApiKeyModal);
    }
    
    if (closeApiModal) {
        closeApiModal.addEventListener('click', closeApiDocModal);
    }
    
    if (closeApiKeyModal) {
        closeApiKeyModal.addEventListener('click', closeApiKeyModal);
    }

    // Close modals when clicking overlay
    apiModalOverlay?.addEventListener('click', function(e) {
        if (e.target === apiModalOverlay) {
            closeApiDocModal();
        }
    });

    apiKeyModalOverlay?.addEventListener('click', function(e) {
        if (e.target === apiKeyModalOverlay) {
            closeApiKeyModal();
        }
    });

    // Tab switching functionality
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    // Language tab switching
    langBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const langId = this.dataset.lang;
            
            // Remove active class from all language tabs and contents
            langBtns.forEach(b => b.classList.remove('active'));
            langContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(langId)?.classList.add('active');
        });
    });

    // Copy to clipboard functionality
    copyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const copyTarget = this.dataset.copy;
            const textToCopy = document.getElementById(copyTarget)?.textContent || this.previousElementSibling?.value;
            
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Show feedback
                    const originalText = this.textContent;
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        this.innerHTML = originalText.includes('Copy') ? '<i class="fas fa-copy"></i>' : originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    const originalText = this.textContent;
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        this.innerHTML = originalText.includes('Copy') ? '<i class="fas fa-copy"></i>' : originalText;
                    }, 2000);
                });
            }
        });
    });

    // API Key form submission
    if (apiKeyForm) {
        apiKeyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.get('username'),
                        email: formData.get('email'),
                        password: formData.get('password'),
                        usage: formData.get('usage')
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Show the API key
                    document.getElementById('generatedApiKey').value = data.api_key;
                    apiKeyResult.style.display = 'block';
                    this.style.display = 'none';
                } else {
                    throw new Error(data.message || 'Failed to generate API key');
                }
            } catch (error) {
                console.error('Error generating API key:', error);
                alert('Failed to generate API key. Please try again.');
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.disabled = false;
            }
        });
    }

    // Copy API key functionality
    if (copyApiKey) {
        copyApiKey.addEventListener('click', function() {
            const apiKeyInput = document.getElementById('generatedApiKey');
            apiKeyInput.select();
            navigator.clipboard.writeText(apiKeyInput.value).then(() => {
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
        });
    }

    // API endpoint click handlers
    const apiEndpoints = document.querySelectorAll('.api-endpoint');
    apiEndpoints.forEach(endpoint => {
        endpoint.addEventListener('click', function() {
            const endpointType = this.dataset.endpoint;
            // You can add specific functionality for each endpoint
            console.log(`Clicked on ${endpointType} endpoint`);
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key to close modals
        if (e.key === 'Escape') {
            if (apiModalOverlay.classList.contains('active')) {
                closeApiDocModal();
            }
            if (apiKeyModalOverlay.classList.contains('active')) {
                closeApiKeyModal();
            }
        }
    });
});

// Utility functions for API interactions
const APIUtils = {
    // Generate API token
    async generateToken(username, password) {
        try {
            const response = await fetch('/api/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Error generating token:', error);
            throw error;
        }
    },

    // Make authenticated API request
    async makeAPIRequest(endpoint, options = {}, token = null) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(endpoint, {
                ...options,
                headers
            });
            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    // Upload file via API
    async uploadFile(file, token, eventData = {}) {
        const formData = new FormData();
        formData.append('files', file);
        
        // Add event data if provided
        Object.keys(eventData).forEach(key => {
            if (eventData[key]) {
                formData.append(key, eventData[key]);
            }
        });

        try {
            const response = await fetch('/api/ocr', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }
};

// Export for use in other scripts
window.APIUtils = APIUtils;
