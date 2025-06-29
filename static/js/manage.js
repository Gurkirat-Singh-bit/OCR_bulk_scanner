// 1-20: Data Management Interface JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - initializing manage interface');
    
    // Add global click debugging
    document.addEventListener('click', function(e) {
        console.log('🖱️ Global click detected:', {
            target: e.target,
            className: e.target.className,
            tagName: e.target.tagName,
            coordinates: { x: e.clientX, y: e.clientY }
        });
    }, true);
    
    // Initialize interface
    initializeManageInterface();
    setupEventListeners();
    initializeDragAndDrop();
    populateCountryFilter();
    initializePreviewPanel();
    
    // Set up enhanced mutation observer for Edit/Delete buttons
    setupEnhancedMutationObserver();
    setupDirectEditDeleteHandlers();
    
    // Debug: Check if assign buttons exist
    const assignButtons = document.querySelectorAll('.assign-label-btn');
    console.log(`Found ${assignButtons.length} assign buttons`);
    assignButtons.forEach((btn, index) => {
        console.log(`Assign button ${index}:`, btn);
        console.log(`  - Card ID: ${btn.dataset.cardId}`);
        console.log(`  - Visible: ${btn.offsetParent !== null}`);
        console.log(`  - Position: ${btn.getBoundingClientRect()}`);
        console.log(`  - Computed Style:`, window.getComputedStyle(btn));
    });
});

// 21-40: Initialize the management interface
function initializeManageInterface() {
    console.log('🚀 Initializing data management interface');
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize modals
    initializeModals();
    
    // Initialize label management
    initializeLabelManagement();
    
    // Update counters
    updateCounters();
    
    console.log('✅ Data management interface initialized');
    
    // Force setup assign buttons after everything is loaded
    setTimeout(() => {
        console.log('🔧 Setting up emergency button handlers...');
        window.debugManageInterface.forceFixAllButtons();
    }, 1000);
    
    // Set up mutation observer to handle any new buttons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const assignBtns = node.querySelectorAll ? node.querySelectorAll('.assign-label-btn') : [];
                        if (assignBtns.length > 0) {
                            console.log('🔧 New assign buttons detected, setting up handlers...');
                            setTimeout(() => window.debugManageInterface.forceFixAllButtons(), 100);
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 41-80: Event listeners setup
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const labelFilter = document.getElementById('labelFilter');
    const countryFilter = document.getElementById('countryFilter');
    const resetFilters = document.getElementById('resetFilters');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                clearSearchInput();
            }
        });
    }
    
    if (clearSearch) {
        clearSearch.addEventListener('click', clearSearchInput);
    }
    
    if (labelFilter) {
        labelFilter.addEventListener('change', handleFilterChange);
    }
    
    if (countryFilter) {
        countryFilter.addEventListener('change', handleFilterChange);
    }
    
    if (resetFilters) {
        resetFilters.addEventListener('click', resetAllFilters);
    }
    
    // Label assignment and card actions - CONSOLIDATED EVENT HANDLER
    document.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Check for all button types
        const assignBtn = e.target.closest('.assign-label-btn');
        const removeBtn = e.target.closest('.remove-label-btn');
        const editBtn = e.target.closest('.edit-card-btn');
        const deleteBtn = e.target.closest('.delete-card-btn');
        const toggleBtn = e.target.closest('.toggle-label-btn');
        const previewBtn = e.target.closest('.preview-card-btn');
        
        console.log('🖱️ Button click detected:', {
            assign: !!assignBtn,
            remove: !!removeBtn,
            edit: !!editBtn,
            delete: !!deleteBtn,
            toggle: !!toggleBtn,
            preview: !!previewBtn,
            target: e.target
        });
        
        if (assignBtn) {
            e.preventDefault();
            console.log('🏷️ ASSIGN button clicked', assignBtn);
            handleLabelAssignment(assignBtn);
            return false;
        } 
        
        if (removeBtn) {
            e.preventDefault();
            console.log('🗑️ REMOVE button clicked', removeBtn);
            handleLabelRemoval(removeBtn);
            return false;
        } 
        
        if (editBtn) {
            e.preventDefault();
            console.log('✏️ EDIT button clicked', editBtn);
            handleEditCard(editBtn);
            return false;
        } 
        
        if (deleteBtn) {
            e.preventDefault();
            console.log('🗑️ DELETE button clicked', deleteBtn);
            handleDeleteCard(deleteBtn);
            return false;
        } 
        
        if (toggleBtn) {
            e.preventDefault();
            console.log('🔽 TOGGLE button clicked', toggleBtn);
            handleToggleLabel(toggleBtn);
            return false;
        }
        
        if (previewBtn) {
            e.preventDefault();
            console.log('👁️ PREVIEW button clicked', previewBtn);
            const cardId = previewBtn.dataset.cardId;
            if (cardId) {
                openPreview(parseInt(cardId));
            }
            return false;
        }
    }, true); // Use capture phase
    
    // Create label buttons
    const createLabelBtn = document.getElementById('createLabelBtn');
    const createFirstLabel = document.getElementById('createFirstLabel');
    
    if (createLabelBtn) {
        createLabelBtn.addEventListener('click', () => showModal('createLabelModal'));
    }
    
    if (createFirstLabel) {
        createFirstLabel.addEventListener('click', () => showModal('createLabelModal'));
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
}

// 81-120: Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    // Enable search suggestions (future enhancement)
    searchInput.setAttribute('autocomplete', 'off');
}

function handleSearch(e) {
    const query = e.target.value.trim();
    const clearBtn = document.getElementById('clearSearch');
    
    if (query.length > 0) {
        clearBtn.style.display = 'block';
        performSearch(query);
    } else {
        clearBtn.style.display = 'none';
        showAllCards();
    }
}

function performSearch(query) {
    const cards = document.querySelectorAll('.card-item');
    const queryLower = query.toLowerCase();
    
    cards.forEach(card => {
        const cardData = parseCardData(card);
        if (!cardData) return; // Skip if parsing failed
        
        const searchableText = [
            cardData.name || '',
            cardData.company || '',
            cardData.email || '',
            cardData.phone || '',
            cardData.country || '',
            cardData.designation || ''
        ].join(' ').toLowerCase();
        
        if (searchableText.includes(queryLower)) {
            card.style.display = 'block';
            highlightSearchTerms(card, query);
        } else {
            card.style.display = 'none';
        }
    });
    
    updateVisibleCounters();
}

function highlightSearchTerms(card, query) {
    // Simple highlight implementation
    const textElements = card.querySelectorAll('h3, h4, p');
    textElements.forEach(element => {
        const text = element.textContent;
        if (text.toLowerCase().includes(query.toLowerCase())) {
            element.classList.add('search-highlight');
        }
    });
}

function clearSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    searchInput.value = '';
    clearBtn.style.display = 'none';
    showAllCards();
    removeSearchHighlights();
}

function removeSearchHighlights() {
    const highlighted = document.querySelectorAll('.search-highlight');
    highlighted.forEach(el => el.classList.remove('search-highlight'));
}

function showAllCards() {
    const cards = document.querySelectorAll('.card-item');
    cards.forEach(card => {
        card.style.display = 'block';
    });
    updateVisibleCounters();
}

// 121-160: Filter functionality
function populateCountryFilter() {
    const countryFilter = document.getElementById('countryFilter');
    if (!countryFilter) return;
    
    const cards = document.querySelectorAll('.card-item');
    const countries = new Set();
    
    cards.forEach(card => {
        const cardData = parseCardData(card);
        if (!cardData) return; // Skip if parsing failed
        
        if (cardData.country && cardData.country !== 'UNKNOWN') {
            countries.add(cardData.country);
        }
    });
    
    const sortedCountries = Array.from(countries).sort();
    sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

function handleFilterChange() {
    const labelFilter = document.getElementById('labelFilter');
    const countryFilter = document.getElementById('countryFilter');
    
    const selectedLabel = labelFilter ? labelFilter.value : '';
    const selectedCountry = countryFilter ? countryFilter.value : '';
    
    filterCards(selectedLabel, selectedCountry);
}

function filterCards(labelId, country) {
    const cards = document.querySelectorAll('.card-item');
    
    cards.forEach(card => {
        const cardData = parseCardData(card);
        if (!cardData) return; // Skip if parsing failed
        
        let show = true;
        
        if (labelId && cardData.label_id != labelId) {
            show = false;
        }
        
        if (country && cardData.country !== country) {
            show = false;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
    
    updateVisibleCounters();
}

function resetAllFilters() {
    const labelFilter = document.getElementById('labelFilter');
    const countryFilter = document.getElementById('countryFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (labelFilter) labelFilter.value = '';
    if (countryFilter) countryFilter.value = '';
    if (searchInput) {
        searchInput.value = '';
        document.getElementById('clearSearch').style.display = 'none';
    }
    
    showAllCards();
    removeSearchHighlights();
}

// 161-200: Label management
function initializeLabelManagement() {
    // Setup color picker in create label modal
    const colorPresets = document.querySelectorAll('.color-preset');
    const colorInput = document.getElementById('labelColor');
    
    colorPresets.forEach(preset => {
        preset.addEventListener('click', function() {
            const color = this.dataset.color;
            if (colorInput) {
                colorInput.value = color;
            }
            
            // Update active state
            colorPresets.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Setup form submission
    const createLabelForm = document.getElementById('createLabelForm');
    if (createLabelForm) {
        createLabelForm.addEventListener('submit', handleCreateLabel);
    }
}

function handleLabelAssignment(button) {
    console.log('🏷️ Starting label assignment process', button);
    const cardId = button.dataset.cardId;
    const card = button.closest('.card-item');
    const selector = card.querySelector('.label-selector');
    
    console.log('Card ID:', cardId);
    console.log('Card element:', card);
    console.log('Selector element:', selector);
    console.log('Selector value:', selector ? selector.value : 'null');
    
    if (!cardId) {
        showToast('Card ID not found', 'error');
        return;
    }
    
    if (!card) {
        showToast('Card element not found', 'error');
        return;
    }
    
    if (!selector) {
        showToast('Label selector not found', 'error');
        return;
    }
    
    if (!selector.value) {
        showToast('Please select a label first', 'error');
        console.log('Available options:', Array.from(selector.options).map(opt => ({ value: opt.value, text: opt.text })));
        return;
    }
    
    const labelId = selector.value;
    const selectedOption = selector.options[selector.selectedIndex];
    const labelName = selectedOption.dataset.labelName || selectedOption.text;
    
    console.log('Label ID:', labelId);
    console.log('Label Name:', labelName);
    
    showLoading('Assigning label...');
    
    fetch(`/api/cards/${cardId}/label`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            label_id: parseInt(labelId),
            label_name: labelName
        })
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        hideLoading();
        if (data.success) {
            showToast('Label assigned successfully!', 'success');
            // Refresh the page to update the UI
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(data.message || 'Failed to assign label', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error assigning label', 'error');
        console.error('Error:', error);
    });
}

function handleLabelRemoval(button) {
    const cardId = button.dataset.cardId;
    
    if (!confirm('Remove this card from its label?')) {
        return;
    }
    
    showLoading('Removing label...');
    
    fetch(`/api/cards/${cardId}/label`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showToast('Label removed successfully!', 'success');
            // Refresh the page to update the UI
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(data.message || 'Failed to remove label', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error removing label', 'error');
        console.error('Error:', error);
    });
}

function handleCreateLabel(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('labelName');
    const colorInput = document.getElementById('labelColor');
    
    const name = nameInput.value.trim();
    const color = colorInput.value;
    
    if (!name) {
        showToast('Please enter a label name', 'error');
        return;
    }
    
    showLoading('Creating label...');
    
    fetch('/api/labels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            color: color
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showToast('Label created successfully!', 'success');
            hideModal('createLabelModal');
            // Refresh the page to update the UI
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(data.message || 'Failed to create label', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error creating label', 'error');
        console.error('Error:', error);
    });
}

// 201-240: Card management
function handleEditCard(button) {
    console.log('🖊️ Edit button clicked', button);
    const card = button.closest('.card-item');
    
    // Use helper function to parse card data safely
    const cardData = parseCardData(card);
    if (!cardData) {
        showToast('Error: Could not read card data', 'error');
        return;
    }
    
    console.log('📝 Opening edit modal for:', cardData.name || 'Unknown');
    
    // Populate edit form
    document.getElementById('editName').value = cardData.name || '';
    document.getElementById('editDesignation').value = cardData.designation || '';
    document.getElementById('editCompany').value = cardData.company || '';
    document.getElementById('editEmail').value = cardData.email || '';
    document.getElementById('editPhone').value = cardData.phone || '';
    document.getElementById('editWebsite').value = cardData.website || '';
    
    // Store card ID for saving
    const editForm = document.getElementById('editCardForm');
    editForm.dataset.cardId = cardData.id;
    
    // Setup form submission if not already done
    if (!editForm.hasAttribute('data-listener')) {
        editForm.addEventListener('submit', handleSaveCard);
        editForm.setAttribute('data-listener', 'true');
    }
    
    showModal('editCardModal');
}

function handleSaveCard(e) {
    e.preventDefault();
    
    const form = e.target;
    const cardId = form.dataset.cardId;
    
    const updatedData = {
        name: document.getElementById('editName').value.trim(),
        designation: document.getElementById('editDesignation').value.trim(),
        company: document.getElementById('editCompany').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        website: document.getElementById('editWebsite').value.trim()
    };
    
    showLoading('Saving changes...');
    
    fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showToast('Card updated successfully!', 'success');
            hideModal('editCardModal');
            // Refresh the page to update the UI
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(data.message || 'Failed to update card', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error updating card', 'error');
        console.error('Error:', error);
    });
}

function handleDeleteCard(button) {
    console.log('🗑️ Delete button clicked', button);
    const card = button.closest('.card-item');
    
    // Use helper function to parse card data safely
    const cardData = parseCardData(card);
    if (!cardData) {
        showToast('Error: Could not read card data', 'error');
        return;
    }
    
    console.log('🗑️ Confirming delete for:', cardData.name || 'Unknown');
    
    if (!confirm(`Delete the business card for "${cardData.name || 'Unknown'}"?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    showLoading('Deleting card...');
    
    fetch(`/api/cards/${cardData.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showToast('Card deleted successfully!', 'success');
            // Remove the card from the UI
            card.remove();
            updateCounters();
        } else {
            showToast(data.message || 'Failed to delete card', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error deleting card', 'error');
        console.error('Error:', error);
    });
}

// 241-280: UI utilities
function handleToggleLabel(button) {
    const labelId = button.dataset.labelId;
    const labelGroup = button.closest('.label-group');
    
    labelGroup.classList.toggle('collapsed');
    
    const icon = button.querySelector('i');
    if (labelGroup.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-right');
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
    }
}

function updateCounters() {
    const unsortedCards = document.querySelectorAll('#unsortedContainer .card-item:not([style*="display: none"])');
    const sortedCards = document.querySelectorAll('.labeled-card:not([style*="display: none"])');
    
    const unsortedCount = document.getElementById('unsortedCount');
    const sortedCount = document.getElementById('sortedCount');
    
    if (unsortedCount) {
        unsortedCount.textContent = unsortedCards.length;
    }
    
    if (sortedCount) {
        sortedCount.textContent = sortedCards.length;
    }
}

function updateVisibleCounters() {
    updateCounters();
}

function handleExport() {
    showLoading('Preparing export...');
    
    // Redirect to existing download endpoint
    window.location.href = '/download_excel';
    
    setTimeout(() => {
        hideLoading();
        showToast('Export initiated!', 'success');
    }, 2000);
}

// 281-320: Modal management
function initializeModals() {
    // Setup modal close buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-close') || e.target.dataset.modal) {
            const modalId = e.target.dataset.modal;
            if (modalId) {
                hideModal(modalId);
            }
        }
        
        // Close modal when clicking overlay
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal-overlay[style*="block"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        // Focus first input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Reset forms
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }
}

// 321-360: Loading and toast utilities
function showLoading(title = 'Processing...', subtitle = 'Please wait') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingTitle = document.getElementById('loadingTitle');
    const loadingSubtitle = document.getElementById('loadingSubtitle');
    
    if (loadingTitle) loadingTitle.textContent = title;
    if (loadingSubtitle) loadingSubtitle.textContent = subtitle;
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showToast(message, type = 'success') {
    // Also log to console for debugging
    console.log(`Toast [${type}]: ${message}`);
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style the toast
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'var(--success-light)' : type === 'error' ? 'var(--error-light)' : 'var(--accent-primary)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: var(--shadow-medium);
        animation: slideUp 0.3s ease-out;
        z-index: 10001;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 4 seconds (increased from 3 for debugging)
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// 361-400: Drag and drop functionality
function initializeDragAndDrop() {
    // Initialize sortable for unsorted container
    const unsortedContainer = document.getElementById('unsortedContainer');
    if (unsortedContainer) {
        new Sortable(unsortedContainer, {
            group: 'cards',
            animation: 150,
            onStart: function(evt) {
                evt.item.classList.add('dragging');
            },
            onEnd: function(evt) {
                evt.item.classList.remove('dragging');
            }
        });
    }
    
    // Initialize sortable for each label group
    const labelCards = document.querySelectorAll('.label-cards');
    labelCards.forEach(container => {
        new Sortable(container, {
            group: 'cards',
            animation: 150,
            onStart: function(evt) {
                evt.item.classList.add('dragging');
            },
            onEnd: function(evt) {
                evt.item.classList.remove('dragging');
                
                // Handle card movement between containers
                const cardId = evt.item.dataset.cardId;
                const newContainer = evt.to;
                const labelId = newContainer.dataset.labelId;
                
                if (labelId && evt.from !== evt.to) {
                    // Card moved to a different label
                    handleDraggedLabelAssignment(cardId, labelId, newContainer);
                }
            }
        });
    });
}

function handleDraggedLabelAssignment(cardId, labelId, container) {
    // Find label name
    const labelHeader = container.closest('.label-group').querySelector('.label-info h3');
    const labelName = labelHeader ? labelHeader.textContent.trim() : '';
    
    showLoading('Moving card...');
    
    fetch(`/api/cards/${cardId}/label`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            label_id: parseInt(labelId),
            label_name: labelName
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showToast('Card moved successfully!', 'success');
            // Refresh the page to update the UI
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(data.message || 'Failed to move card', 'error');
            // Refresh to revert the UI change
            window.location.reload();
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error moving card', 'error');
        console.error('Error:', error);
        // Refresh to revert the UI change
        window.location.reload();
    });
}

// 401-500: Preview panel functionality
let currentPreviewCard = null;
let isEditMode = false;
let availableCountries = [];

function initializePreviewPanel() {
    console.log('🖼️ Initializing preview panel');
    
    // Load countries for selection
    loadCountries();
    
    // Setup preview panel event listeners
    setupPreviewEvents();
    
    // Setup card click handlers
    setupCardClickHandlers();
}

function setupPreviewEvents() {
    // Close preview panel
    const closeBtn = document.getElementById('closePreviewBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePreview);
    }
    
    // Edit mode toggle
    const editToggleBtn = document.getElementById('editToggleBtn');
    const editPreviewBtn = document.getElementById('editPreviewBtn');
    
    if (editToggleBtn) {
        editToggleBtn.addEventListener('click', toggleEditMode);
    }
    
    if (editPreviewBtn) {
        console.log('✅ Setting up Edit button event listener');
        // Remove any existing listeners first
        editPreviewBtn.removeEventListener('click', toggleEditMode);
        // Add with capture to ensure it fires
        editPreviewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔥 EDIT BUTTON CLICKED!');
            toggleEditMode();
        }, true);
    } else {
        console.warn('❌ Edit button not found');
    }
    
    // Save and cancel buttons
    const saveBtn = document.getElementById('savePreviewBtn');
    const cancelBtn = document.getElementById('cancelPreviewBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', savePreviewChanges);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelPreviewEdit);
    }
    
    // Delete button
    const deleteBtn = document.getElementById('deletePreviewBtn');
    if (deleteBtn) {
        console.log('✅ Setting up Delete button event listener');
        // Remove any existing listeners first
        deleteBtn.removeEventListener('click', deletePreviewCard);
        // Add with capture to ensure it fires
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔥 DELETE BUTTON CLICKED!');
            deletePreviewCard();
        }, true);
    } else {
        console.warn('❌ Delete button not found');
    }
    
    // Country selector change
    const countrySelect = document.getElementById('previewCountry');
    if (countrySelect) {
        countrySelect.addEventListener('change', updatePreviewFlag);
    }
}

function setupCardClickHandlers() {
    // Simplified card click handling - only for card body clicks (not buttons)
    document.addEventListener('click', function(e) {
        // Only handle clicks on card content, not buttons
        const cardItem = e.target.closest('.card-item');
        
        if (cardItem && 
            !e.target.closest('.card-actions') && 
            !e.target.closest('.card-footer') &&
            !e.target.closest('button')) {
            
            const cardId = cardItem.dataset.cardId;
            if (cardId) {
                console.log('📋 Card body clicked, opening preview for:', cardId);
                openPreview(parseInt(cardId));
                
                // Update selected state
                document.querySelectorAll('.card-item').forEach(card => {
                    card.classList.remove('selected');
                });
                cardItem.classList.add('selected');
            }
        }
    });
}

function loadCountries() {
    fetch('/api/countries')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                availableCountries = data.countries;
                populateCountrySelect();
            }
        })
        .catch(error => {
            console.error('Error loading countries:', error);
            // Fallback countries
            availableCountries = [
                ['US', '🇺🇸'], ['IN', '🇮🇳'], ['GB', '🇬🇧'], ['DE', '🇩🇪'],
                ['FR', '🇫🇷'], ['CA', '🇨🇦'], ['AU', '🇦🇺'], ['UNKNOWN', '🌍']
            ];
            populateCountrySelect();
        });
}

function populateCountrySelect() {
    const countrySelect = document.getElementById('previewCountry');
    if (!countrySelect) return;
    
    // Clear existing options except the first one
    while (countrySelect.children.length > 1) {
        countrySelect.removeChild(countrySelect.lastChild);
    }
    
    // Add country options
    availableCountries.forEach(([code, flag]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${flag} ${code}`;
        option.dataset.flag = flag;
        countrySelect.appendChild(option);
    });
}

function openPreview(cardId) {
    console.log('🔍 Opening preview for card:', cardId);
    
    showLoading('Loading card preview...');
    
    fetch(`/api/cards/${cardId}/preview`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                showPreviewPanel(data.card);
                currentPreviewCard = data.card;
            } else {
                showToast(data.message || 'Failed to load card preview', 'error');
            }
        })
        .catch(error => {
            hideLoading();
            showToast('Error loading card preview', 'error');
            console.error('Error:', error);
        });
}

function showPreviewPanel(card) {
    const previewPanel = document.getElementById('previewPanel');
    const previewContent = document.getElementById('previewContent');
    const previewLoaded = document.getElementById('previewLoaded');
    
    if (!previewPanel || !previewLoaded) return;
    
    // Show the loaded content, hide placeholder
    previewContent.style.display = 'none';
    previewLoaded.style.display = 'block';
    
    // Populate preview data
    populatePreviewData(card);
    
    // Ensure edit mode is off
    if (isEditMode) {
        toggleEditMode();
    }
    
    // Show panel with animation
    previewPanel.classList.remove('hidden');
    previewPanel.style.animation = 'slideIn 0.3s ease-out';
    
    console.log('✅ Preview panel displayed for:', card.name || 'Unknown');
}

function populatePreviewData(card) {
    // Set image
    const previewImage = document.getElementById('previewImage');
    const previewFilename = document.getElementById('previewFilename');
    
    if (previewImage && card.image_base64) {
        previewImage.src = card.image_base64;
        previewImage.alt = `Business card for ${card.name || 'Unknown'}`;
    }
    
    if (previewFilename) {
        previewFilename.textContent = card.filename || 'Unknown file';
    }
    
    // Set form fields with fallback values
    setFieldValue('previewName', card.name || 'N/A');
    setFieldValue('previewCompany', card.company || 'N/A');
    setFieldValue('previewDesignation', card.designation || 'N/A');
    setFieldValue('previewEmail', card.email || 'N/A');
    setFieldValue('previewPhone', card.phone || 'N/A');
    setFieldValue('previewWebsite', card.website || 'N/A');
    
    // Set country and flag
    const countrySelect = document.getElementById('previewCountry');
    const flagDisplay = document.getElementById('previewFlag');
    
    if (countrySelect) {
        countrySelect.value = card.country || 'UNKNOWN';
    }
    
    if (flagDisplay) {
        flagDisplay.textContent = card.flag || '🌍';
    }
}

function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value;
    }
}

function closePreview() {
    const previewPanel = document.getElementById('previewPanel');
    const previewContent = document.getElementById('previewContent');
    const previewLoaded = document.getElementById('previewLoaded');
    
    if (previewPanel) {
        previewPanel.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            previewPanel.classList.add('hidden');
            previewContent.style.display = 'block';
            previewLoaded.style.display = 'none';
        }, 300);
    }
    
    // Clear selected state
    document.querySelectorAll('.card-item').forEach(card => {
        card.classList.remove('selected');
    });
    
    currentPreviewCard = null;
    isEditMode = false;
    
    console.log('👋 Preview panel closed');
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const viewActions = document.getElementById('viewActions');
    const editActions = document.getElementById('editActions');
    const formInputs = document.querySelectorAll('#previewForm input, #previewForm select');
    const editToggleBtn = document.getElementById('editToggleBtn');
    
    if (isEditMode) {
        // Enter edit mode
        viewActions.style.display = 'none';
        editActions.style.display = 'flex';
        
        formInputs.forEach(input => {
            input.removeAttribute('readonly');
            input.removeAttribute('disabled');
        });
        
        if (editToggleBtn) {
            editToggleBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        }
        
        console.log('✏️ Edit mode enabled');
    } else {
        // Exit edit mode
        viewActions.style.display = 'flex';
        editActions.style.display = 'none';
        
        formInputs.forEach(input => {
            input.setAttribute('readonly', 'readonly');
            if (input.tagName === 'SELECT') {
                input.setAttribute('disabled', 'disabled');
            }
        });
        
        if (editToggleBtn) {
            editToggleBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
        
        console.log('👁️ Edit mode disabled');
    }
}

function updatePreviewFlag() {
    const countrySelect = document.getElementById('previewCountry');
    const flagDisplay = document.getElementById('previewFlag');
    
    if (countrySelect && flagDisplay) {
        const selectedOption = countrySelect.options[countrySelect.selectedIndex];
        const flag = selectedOption.dataset.flag || '🌍';
        flagDisplay.textContent = flag;
    }
}

function savePreviewChanges() {
    if (!currentPreviewCard) {
        showToast('No card selected for editing', 'error');
        return;
    }
    
    const updatedData = {
        name: document.getElementById('previewName').value.trim(),
        company: document.getElementById('previewCompany').value.trim(),
        designation: document.getElementById('previewDesignation').value.trim(),
        email: document.getElementById('previewEmail').value.trim(),
        phone: document.getElementById('previewPhone').value.trim(),
        website: document.getElementById('previewWebsite').value.trim(),
        country: document.getElementById('previewCountry').value,
        flag: document.getElementById('previewFlag').textContent
    };
    
    // Convert N/A back to empty strings
    Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === 'N/A') {
            updatedData[key] = '';
        }
    });
    
    showLoading('Saving changes...');
    
    fetch(`/api/cards/${currentPreviewCard.id}/edit`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showToast('Card updated successfully!', 'success');
            
            // Update current card data
            Object.assign(currentPreviewCard, updatedData);
            
            // Exit edit mode
            toggleEditMode();
            
            // Refresh the page to update the card list
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(data.message || 'Failed to update card', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error updating card', 'error');
        console.error('Error:', error);
    });
}

function cancelPreviewEdit() {
    if (currentPreviewCard) {
        // Restore original values
        populatePreviewData(currentPreviewCard);
    }
    
    // Exit edit mode
    toggleEditMode();
    
    showToast('Changes cancelled', 'info');
}

function deletePreviewCard() {
    if (!currentPreviewCard) {
        showToast('No card selected for deletion', 'error');
        return;
    }
    
    const cardName = currentPreviewCard.name || 'Unknown';
    
    if (!confirm(`Delete the business card for "${cardName}"?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    showLoading('Deleting card...');
    
    fetch(`/api/cards/${currentPreviewCard.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showToast('Card deleted successfully!', 'success');
            closePreview();
            
            // Remove the card from the UI
            const cardElement = document.querySelector(`[data-card-id="${currentPreviewCard.id}"]`);
            if (cardElement) {
                cardElement.remove();
            }
            
            updateCounters();
        } else {
            showToast(data.message || 'Failed to delete card', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error deleting card', 'error');
        console.error('Error:', error);
    });
}

// Backup direct event handlers for Edit and Delete buttons
function setupDirectEditDeleteHandlers() {
    console.log('🔧 Setting up direct Edit and Delete button handlers...');
    
    // Handle Edit buttons
    document.querySelectorAll('.edit-card-btn').forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log(`🔥 DIRECT EDIT BUTTON ${index} CLICKED!`);
            handleEditCard(this);
        }, true);
        console.log(`✅ Added direct handler to edit button ${index}`);
    });
    
    // Handle Delete buttons  
    document.querySelectorAll('.delete-card-btn').forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log(`🔥 DIRECT DELETE BUTTON ${index} CLICKED!`);
            handleDeleteCard(this);
        }, true);
        console.log(`✅ Added direct handler to delete button ${index}`);
    });
}

// Add this to window for console access
window.setupDirectEditDeleteHandlers = setupDirectEditDeleteHandlers;

// Enhanced mutation observer to specifically watch for Edit and Delete buttons
function setupEnhancedMutationObserver() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if this is an Edit or Delete button
                        if (node.id === 'editPreviewBtn' || node.id === 'deletePreviewBtn') {
                            console.log(`🔄 ${node.id} was added to DOM, setting up event handler`);
                            setupButtonEventHandler(node);
                        }
                        
                        // Also check for buttons inside added nodes
                        const editBtn = node.querySelector ? node.querySelector('#editPreviewBtn') : null;
                        const deleteBtn = node.querySelector ? node.querySelector('#deletePreviewBtn') : null;
                        
                        if (editBtn) {
                            console.log('🔄 Edit button found in added node, setting up event handler');
                            setupButtonEventHandler(editBtn);
                        }
                        
                        if (deleteBtn) {
                            console.log('🔄 Delete button found in added node, setting up event handler');
                            setupButtonEventHandler(deleteBtn);
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('🔍 Enhanced mutation observer set up for Edit/Delete buttons');
}

function setupButtonEventHandler(button) {
    if (!button) return;
    
    if (button.id === 'editPreviewBtn') {
        button.removeEventListener('click', toggleEditMode);
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔥 EDIT BUTTON CLICKED! (from mutation observer)');
            toggleEditMode();
        }, true);
        console.log('✅ Edit button event handler set up');
    } else if (button.id === 'deletePreviewBtn') {
        button.removeEventListener('click', deletePreviewCard);
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔥 DELETE BUTTON CLICKED! (from mutation observer)');
            deletePreviewCard();
        }, true);
        console.log('✅ Delete button event handler set up');
    }
}

// Debug function to specifically test Edit and Delete buttons
function debugEditDeleteButtons() {
    console.log('=== Debugging Edit and Delete Buttons ===');
    
    const editBtn = document.getElementById('editPreviewBtn');
    const deleteBtn = document.getElementById('deletePreviewBtn');
    
    console.log('Edit button element:', editBtn);
    console.log('Delete button element:', deleteBtn);
    
    if (editBtn) {
        console.log('Edit button computed style:', window.getComputedStyle(editBtn));
        console.log('Edit button pointer-events:', window.getComputedStyle(editBtn).pointerEvents);
        console.log('Edit button z-index:', window.getComputedStyle(editBtn).zIndex);
        console.log('Edit button listeners count:', getEventListeners(editBtn));
        
        // Force add click listener
        editBtn.removeEventListener('click', toggleEditMode);
        editBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔥 EDIT BUTTON CLICKED - FORCED HANDLER');
            toggleEditMode();
        }, true);
    }
    
    if (deleteBtn) {
        console.log('Delete button computed style:', window.getComputedStyle(deleteBtn));
        console.log('Delete button pointer-events:', window.getComputedStyle(deleteBtn).pointerEvents);
        console.log('Delete button z-index:', window.getComputedStyle(deleteBtn).zIndex);
        console.log('Delete button listeners count:', getEventListeners(deleteBtn));
        
        // Force add click listener
        deleteBtn.removeEventListener('click', deletePreviewCard);
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔥 DELETE BUTTON CLICKED - FORCED HANDLER');
            deletePreviewCard();
        }, true);
    }
    
    // Test clicking programmatically
    if (editBtn) {
        console.log('Testing edit button programmatic click...');
        setTimeout(() => {
            editBtn.click();
        }, 1000);
    }
}

// Add to global scope for console access
window.debugEditDeleteButtons = debugEditDeleteButtons;

// Add combined styles
const style = document.createElement('style');
style.textContent = `
    .search-highlight {
        background-color: yellow;
        font-weight: bold;
    }
    
    .toast-success {
        background: var(--success-light) !important;
    }
    
    .toast-error {
        background: var(--error-light) !important;
    }
    
    /* Emergency button fixes */
    .assign-label-btn {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 99999 !important;
        background: #0891b2 !important;
        border: 2px solid #0891b2 !important;
        cursor: pointer !important;
        user-select: none !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 80px !important;
        min-height: 36px !important;
        color: white !important;
        font-weight: 500 !important;
        padding: 8px 16px !important;
        border-radius: 6px !important;
        gap: 4px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent !important;
        isolation: isolate !important;
    }
    
    .assign-label-btn:hover {
        background: #0e7490 !important;
        border-color: #0e7490 !important;
        transform: scale(1.05) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
    }
    
    .assign-label-btn:active {
        background: #164e63 !important;
        transform: scale(0.95) !important;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
    }
    
    .assign-label-btn * {
        pointer-events: none !important;
    }
    
    .card-footer {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 10000 !important;
        isolation: isolate !important;
    }
    
    .card-footer > * {
        pointer-events: auto !important;
    }
    
    /* Remove any blocking overlays */
    .card-item::before,
    .card-item::after,
    .card-footer::before,
    .card-footer::after {
        display: none !important;
    }
    
    /* Ensure nothing blocks the buttons */
    .card-item * {
        max-width: 100% !important;
        overflow: visible !important;
    }
    
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Debug functions for testing (available in browser console)
window.debugManageInterface = {
    testAssignButton: function(cardId) {
        console.log('🧪 Testing assign button for card:', cardId);
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        if (!card) {
            console.log('❌ Card not found');
            return;
        }
        
        const assignBtn = card.querySelector('.assign-label-btn');
        if (!assignBtn) {
            console.log('❌ Assign button not found');
            return;
        }
        
        console.log('✅ Found assign button, simulating click');
        handleLabelAssignment(assignBtn);
    },
    
    forceAssignLabel: function(cardId, labelId) {
        console.log('🔧 Force assigning label:', labelId, 'to card:', cardId);
        
        // Find the card and populate selector
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        if (!card) {
            console.log('❌ Card not found');
            return;
        }
        
        const selector = card.querySelector('.label-selector');
        if (!selector) {
            console.log('❌ Selector not found');
            return;
        }
        
        // Set the selector value
        selector.value = labelId;
        
        // Get the button
        const assignBtn = card.querySelector('.assign-label-btn');
        if (!assignBtn) {
            console.log('❌ Assign button not found');
            return;
        }
        
        // Force the assignment
        handleLabelAssignment(assignBtn);
    },
    
    listCards: function() {
        const cards = document.querySelectorAll('.card-item');
        console.log(`Found ${cards.length} cards:`);
        cards.forEach((card, index) => {
            const cardId = card.dataset.cardId;
            const assignBtn = card.querySelector('.assign-label-btn');
            const selector = card.querySelector('.label-selector');
            console.log(`  ${index}: Card ID ${cardId}, Has assign button: ${!!assignBtn}, Has selector: ${!!selector}`);
            if (selector) {
                console.log(`    Selector options:`, Array.from(selector.options).map(opt => ({ value: opt.value, text: opt.text })));
            }
        });
    },
    
    listLabels: function() {
        const labelSelectors = document.querySelectorAll('.label-selector');
        if (labelSelectors.length > 0) {
            const options = Array.from(labelSelectors[0].options);
            console.log('Available labels:');
            options.forEach(opt => {
                if (opt.value) {
                    console.log(`  ${opt.value}: ${opt.text}`);
                }
            });
        }
    },
    
    showTestToast: function() {
        showToast('Test toast from debug function', 'success');
    },
    
    clickButtonByCoordinates: function(cardId) {
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        if (!card) {
            console.log('❌ Card not found');
            return;
        }
        
        const assignBtn = card.querySelector('.assign-label-btn');
        if (!assignBtn) {
            console.log('❌ Assign button not found');
            return;
        }
        
        const rect = assignBtn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        console.log(`🖱️ Simulating click at coordinates: ${x}, ${y}`);
        
        // Create and dispatch a click event at the button's center
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });
        
        assignBtn.dispatchEvent(clickEvent);
    },
    
    forceClickAllAssignButtons: function() {
        const buttons = document.querySelectorAll('.assign-label-btn');
        console.log(`🚀 Found ${buttons.length} assign buttons to test`);
        
        buttons.forEach((btn, index) => {
            console.log(`Testing button ${index}...`);
            
            // First try direct handler call
            try {
                handleLabelAssignment(btn);
                console.log(`✅ Direct handler worked for button ${index}`);
            } catch (e) {
                console.log(`❌ Direct handler failed for button ${index}:`, e);
            }
        });
    },
    
    addMegaClickHandler: function() {
        console.log('🚀 Adding mega click handler for all buttons');
        
        // Handle all button types
        const buttonTypes = [
            { class: '.assign-label-btn', handler: handleLabelAssignment, name: 'ASSIGN' },
            { class: '.remove-label-btn', handler: handleLabelRemoval, name: 'REMOVE' },
            { class: '.edit-card-btn', handler: handleEditCard, name: 'EDIT' },
            { class: '.delete-card-btn', handler: handleDeleteCard, name: 'DELETE' },
            { class: '.preview-card-btn', handler: (btn) => {
                const cardId = btn.dataset.cardId;
                if (cardId) openPreview(parseInt(cardId));
            }, name: 'PREVIEW' }
        ];
        
        buttonTypes.forEach(({ class: className, handler, name }) => {
            document.querySelectorAll(className).forEach((btn, index) => {
                // Make button absolutely clickable
                btn.style.cssText += `
                    pointer-events: auto !important;
                    position: relative !important;
                    z-index: 99999 !important;
                    cursor: pointer !important;
                    user-select: none !important;
                    touch-action: manipulation !important;
                `;
                
                // Remove all existing listeners
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Add single, clean click handler
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    console.log(`� ${name} button ${index} clicked!`, newBtn);
                    
                    // Visual feedback
                    const originalBg = newBtn.style.backgroundColor;
                    newBtn.style.backgroundColor = '#164e63';
                    setTimeout(() => {
                        newBtn.style.backgroundColor = originalBg;
                    }, 150);
                    
                    try {
                        handler(newBtn);
                    } catch (error) {
                        console.error(`Error in ${name} handler:`, error);
                        showToast(`Error in ${name} button`, 'error');
                    }
                }, { capture: true, passive: false });
                
                console.log(`✅ ${name} handler added to button ${index}`);
            });
        });
    },
    
    forceFixAllButtons: function() {
        console.log('🔧 FORCE FIXING ALL BUTTONS');
        
        // Remove all event listeners and add clean ones
        const buttons = document.querySelectorAll('button[class*="btn"], .assign-label-btn, .remove-label-btn, .edit-card-btn, .delete-card-btn, .preview-card-btn');
        
        buttons.forEach((btn, index) => {
            console.log(`Fixing button ${index}:`, btn);
            
            // Make sure the button is clickable
            btn.style.cssText += `
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 99999 !important;
                position: relative !important;
            `;
            
            // Clone to remove all event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add one clean click handler based on button type
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('🎯 Button clicked:', newBtn.className);
                
                if (newBtn.classList.contains('assign-label-btn')) {
                    console.log('🏷️ ASSIGN button');
                    handleLabelAssignment(newBtn);
                } else if (newBtn.classList.contains('remove-label-btn')) {
                    console.log('🗑️ REMOVE button');
                    handleLabelRemoval(newBtn);
                } else if (newBtn.classList.contains('edit-card-btn')) {
                    console.log('✏️ EDIT button');
                    handleEditCard(newBtn);
                } else if (newBtn.classList.contains('delete-card-btn')) {
                    console.log('🗑️ DELETE button');
                    handleDeleteCard(newBtn);
                } else if (newBtn.classList.contains('preview-card-btn')) {
                    console.log('👁️ PREVIEW button');
                    const cardId = newBtn.dataset.cardId;
                    if (cardId) openPreview(parseInt(cardId));
                } else {
                    console.log('❓ Unknown button type');
                }
            }, { capture: true });
        });
        
        console.log(`✅ Fixed ${buttons.length} buttons`);
    }
};

console.log('🔧 Debug functions available as window.debugManageInterface');
console.log('   - testAssignButton(cardId)');
console.log('   - forceAssignLabel(cardId, labelId)');
console.log('   - listCards()');
console.log('   - listLabels()');
console.log('   - showTestToast()');
console.log('   - addMegaClickHandler()');
console.log('   - clickButtonByCoordinates(cardId)');
console.log('   - forceClickAllAssignButtons()');
console.log('   - forceFixAllButtons() <- USE THIS ONE!');

// Add a direct test function to check if Edit and Delete buttons work
window.testEditDeleteButtons = function() {
    console.log('🧪 Testing Edit and Delete buttons directly...');
    
    // Find all edit and delete buttons
    const editButtons = document.querySelectorAll('.edit-card-btn');
    const deleteButtons = document.querySelectorAll('.delete-card-btn');
    
    console.log(`Found ${editButtons.length} edit buttons and ${deleteButtons.length} delete buttons`);
    
    editButtons.forEach((btn, index) => {
        console.log(`Edit button ${index}:`, btn);
        console.log(`  - Card ID: ${btn.dataset.cardId}`);
        console.log(`  - Visible: ${btn.offsetParent !== null}`);
        console.log(`  - Position:`, btn.getBoundingClientRect());
        
        // Test click programmatically
        console.log(`  - Testing click on edit button ${index}...`);
        try {
            handleEditCard(btn);
            console.log(`  ✅ Edit function worked for button ${index}`);
        } catch (e) {
            console.log(`  ❌ Edit function failed for button ${index}:`, e);
        }
    });
    
    deleteButtons.forEach((btn, index) => {
        console.log(`Delete button ${index}:`, btn);
        console.log(`  - Card ID: ${btn.dataset.cardId}`);
        console.log(`  - Visible: ${btn.offsetParent !== null}`);
        console.log(`  - Position:`, btn.getBoundingClientRect());
        
        // Don't actually test delete since it's destructive
        console.log(`  - Delete function exists: ${typeof handleDeleteCard === 'function'}`);
    });
};

// Force fix Edit and Delete buttons specifically
window.forceFixEditDeleteButtons = function() {
    console.log('🔧 Force fixing Edit and Delete buttons...');
    
    // Remove the existing complex event handler and add a simple one
    const editButtons = document.querySelectorAll('.edit-card-btn');
    const deleteButtons = document.querySelectorAll('.delete-card-btn');
    
    editButtons.forEach((btn, index) => {
        // Clone to remove all event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add simple click handler
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🔥 EDIT BUTTON ${index} CLICKED!`);
            handleEditCard(newBtn);
        }, true);
        
        console.log(`✅ Fixed edit button ${index}`);
    });
    
    deleteButtons.forEach((btn, index) => {
        // Clone to remove all event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add simple click handler
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🔥 DELETE BUTTON ${index} CLICKED!`);
            handleDeleteCard(newBtn);
        }, true);
        
        console.log(`✅ Fixed delete button ${index}`);
    });
    
    console.log('🎉 All Edit and Delete buttons have been force-fixed!');
};

// Ultra simple test function
window.simpleEditTest = function() {
    const editBtn = document.querySelector('.edit-card-btn');
    if (editBtn) {
        console.log('Found edit button, calling handleEditCard directly...');
        handleEditCard(editBtn);
    } else {
        console.log('No edit button found');
    }
};

window.simpleDeleteTest = function() {
    const deleteBtn = document.querySelector('.delete-card-btn');
    if (deleteBtn) {
        console.log('Found delete button, calling handleDeleteCard directly...');
        handleDeleteCard(deleteBtn);
    } else {
        console.log('No delete button found');
    }
};

console.log('🎯 Added simpleEditTest() and simpleDeleteTest() functions to window');

// Enhanced debugging function to see exactly what's in the card data
window.debugCardDataRaw = function() {
    console.log('🔍 Debugging raw card data...');
    
    const cards = document.querySelectorAll('.card-item');
    console.log(`Found ${cards.length} cards`);
    
    cards.forEach((card, index) => {
        console.log(`\n=== Card ${index} ===`);
        console.log('Card element:', card);
        console.log('dataset keys:', Object.keys(card.dataset));
        console.log('dataset.cardData type:', typeof card.dataset.cardData);
        console.log('dataset.cardData length:', card.dataset.cardData ? card.dataset.cardData.length : 'null');
        console.log('Raw dataset.cardData:', card.dataset.cardData);
        
        // Try different decoding approaches
        const rawData = card.dataset.cardData;
        if (rawData) {
            console.log('--- Decoding attempts ---');
            
            // Method 1: Direct JSON parse
            try {
                const direct = JSON.parse(rawData);
                console.log('✅ Direct JSON.parse worked:', direct);
            } catch (e) {
                console.log('❌ Direct JSON.parse failed:', e.message);
            }
            
            // Method 2: HTML decode then parse
            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rawData;
                const decoded = tempDiv.textContent || tempDiv.innerText || "";
                console.log('HTML decoded:', decoded);
                const parsed = JSON.parse(decoded);
                console.log('✅ HTML decode + parse worked:', parsed);
            } catch (e) {
                console.log('❌ HTML decode + parse failed:', e.message);
            }
            
            // Method 3: Manual unescape
            try {
                const manualDecoded = rawData
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&#x27;/g, "'")
                    .replace(/&#x2F;/g, '/');
                console.log('Manual decoded:', manualDecoded);
                const parsed = JSON.parse(manualDecoded);
                console.log('✅ Manual decode + parse worked:', parsed);
            } catch (e) {
                console.log('❌ Manual decode + parse failed:', e.message);
            }
        }
    });
};

console.log('🔧 Added debugCardDataRaw() to window');

// Simplified helper function to safely parse card data
function parseCardData(card) {
    console.log('🔍 Parsing card data for:', card);
    
    if (!card || !card.dataset) {
        console.error('Invalid card element or no dataset');
        return null;
    }
    
    const rawData = card.dataset.cardData;
    console.log('Raw data:', rawData);
    
    if (!rawData) {
        console.error('No cardData in dataset');
        return null;
    }
    
    try {
        // Try direct JSON parse first (should work now that we removed HTML escaping)
        const result = JSON.parse(rawData);
        console.log('✅ JSON parse succeeded:', result);
        return result;
    } catch (e) {
        console.error('❌ JSON parse failed:', e);
        
        // Fallback: extract minimal data from DOM if JSON fails
        try {
            const cardId = card.dataset.cardId;
            if (cardId) {
                console.log('🔄 Creating fallback card data from DOM');
                const cardText = card.textContent || '';
                const lines = cardText.split('\n').map(l => l.trim()).filter(l => l);
                
                const fallbackData = {
                    id: parseInt(cardId),
                    name: lines.find(l => !l.includes('@') && !l.includes('www') && !l.includes('+') && l.length > 2) || 'Unknown',
                    email: lines.find(l => l.includes('@')) || '',
                    phone: lines.find(l => l.includes('+') || /^\d+/.test(l)) || '',
                    company: 'Unknown',
                    designation: '',
                    website: lines.find(l => l.includes('www') || l.includes('.com')) || '',
                    country: 'UNKNOWN'
                };
                
                console.log('✅ Fallback data created:', fallbackData);
                return fallbackData;
            }
        } catch (fallbackError) {
            console.error('❌ Fallback method also failed:', fallbackError);
        }
        
        return null;
    }
}

// Test function to verify the JSON parsing fix
window.testCardDataParsing = function() {
    console.log('🧪 Testing card data parsing...');
    
    const cards = document.querySelectorAll('.card-item');
    console.log(`Found ${cards.length} cards to test`);
    
    cards.forEach((card, index) => {
        console.log(`\nTesting card ${index}:`);
        console.log('Raw dataset.cardData:', card.dataset.cardData);
        
        const parsedData = parseCardData(card);
        if (parsedData) {
            console.log('✅ Parsed successfully:', parsedData);
        } else {
            console.log('❌ Failed to parse');
        }
    });
};
