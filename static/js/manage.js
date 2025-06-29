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
    
    // Add specific button click debugging
    document.addEventListener('click', function(e) {
        console.log('🎯 Click target details:', {
            nodeName: e.target.nodeName,
            className: e.target.className,
            id: e.target.id,
            parent: e.target.parentElement?.className,
            closest_btn: e.target.closest('button')?.className
        });
    });
    
    // Initialize interface with a small delay to ensure all elements are loaded
    setTimeout(() => {
        initializeManageInterface();
        setupEventListeners();
        initializeDragAndDrop();
        populateCountryFilter();
        initializePreviewPanel();
        
        // Enhance filter dropdowns
        enhanceFilterDropdowns();
        
        console.log('✅ All initialization complete');
    }, 100);
});

// Utility Functions
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
        // Try direct JSON parse first
        const result = JSON.parse(rawData);
        console.log('✅ Successfully parsed card data:', result);
        return result;
    } catch (e) {
        console.error('Failed to parse JSON:', e);
        
        // Try to extract data from the card element directly as fallback
        try {
            const cardId = card.dataset.cardId;
            const name = card.querySelector('h3, h4')?.textContent?.trim() || '';
            const company = card.querySelector('.company')?.textContent?.trim() || '';
            
            // Find email by looking for envelope icon then getting the text
            let email = '';
            const emailPara = Array.from(card.querySelectorAll('p')).find(p => 
                p.querySelector('i.fa-envelope') || p.textContent.includes('@')
            );
            if (emailPara) {
                email = emailPara.textContent.replace(/.*fa-envelope.*/, '').trim();
            }
            
            // Find phone by looking for phone icon
            let phone = '';
            const phonePara = Array.from(card.querySelectorAll('p')).find(p => 
                p.querySelector('i.fa-phone') || /[\d\-\+\(\)\s]{7,}/.test(p.textContent)
            );
            if (phonePara) {
                phone = phonePara.textContent.replace(/.*fa-phone.*/, '').trim();
            }
            
            // Find website by looking for globe icon
            let website = '';
            const websitePara = Array.from(card.querySelectorAll('p')).find(p => 
                p.querySelector('i.fa-globe') || p.textContent.includes('http') || p.textContent.includes('www')
            );
            if (websitePara) {
                website = websitePara.textContent.replace(/.*fa-globe.*/, '').trim();
            }
            
            // Find designation by looking for user-tie icon
            let designation = '';
            const designationPara = Array.from(card.querySelectorAll('p')).find(p => 
                p.querySelector('i.fa-user-tie')
            );
            if (designationPara) {
                designation = designationPara.textContent.replace(/.*fa-user-tie.*/, '').trim();
            }
            
            const countryFlag = card.querySelector('.country-flag');
            const country = countryFlag?.nextElementSibling?.textContent?.trim() || 'UNKNOWN';
            
            const fallbackData = {
                id: cardId ? parseInt(cardId) : 0,
                name: name,
                company: company,
                email: email,
                phone: phone,
                website: website,
                designation: designation,
                country: country,
                label_id: null,
                label_name: null
            };
            
            console.log('✅ Fallback parsed card data:', fallbackData);
            return fallbackData;
        } catch (fallbackError) {
            console.error('Fallback parsing also failed:', fallbackError);
            return null;
        }
    }
}

function safelyCallFunction(fn, ...args) {
    try {
        return fn(...args);
    } catch (error) {
        console.error(`Error calling function ${fn.name}:`, error);
        return null;
    }
}

function showErrorToast(message) {
    console.error('Error:', message);
    if (typeof showToast === 'function') {
        showToast(message, 'error');
    } else {
        alert('Error: ' + message);
    }
}

function showSuccessToast(message) {
    console.log('Success:', message);
    if (typeof showToast === 'function') {
        showToast(message, 'success');
    } else {
        console.log('Success: ' + message);
    }
}

// 21-40: Initialize the management interface
function initializeManageInterface() {
    console.log('🚀 Initializing data management interface');
    
    try {
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
            try {
                if (window.debugManageInterface && typeof window.debugManageInterface.forceFixAllButtons === 'function') {
                    window.debugManageInterface.forceFixAllButtons();
                }
            } catch (error) {
                console.error('Error setting up emergency handlers:', error);
            }
        }, 1000);
        
        // Set up mutation observer to handle any new buttons
        try {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        const addedNodes = Array.from(mutation.addedNodes);
                        addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const assignBtns = node.querySelectorAll ? node.querySelectorAll('.assign-label-btn') : [];
                                if (assignBtns.length > 0) {
                                    console.log('🔧 New assign buttons detected, setting up handlers...');
                                    setTimeout(() => {
                                        if (window.debugManageInterface && typeof window.debugManageInterface.forceFixAllButtons === 'function') {
                                            window.debugManageInterface.forceFixAllButtons();
                                        }
                                    }, 100);
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
        } catch (error) {
            console.error('Error setting up mutation observer:', error);
        }
    } catch (error) {
        console.error('Error initializing manage interface:', error);
    }
}

// 41-80: Event listeners setup
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const labelFilter = document.getElementById('labelFilter');
    const countryFilter = document.getElementById('countryFilter');
    const resetFilters = document.getElementById('resetFilters');
    
    console.log('Filter elements found:', {
        searchInput: !!searchInput,
        clearSearch: !!clearSearch,
        labelFilter: !!labelFilter,
        countryFilter: !!countryFilter,
        resetFilters: !!resetFilters
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                clearSearchInput();
            }
        });
        console.log('✅ Search input listeners added');
    } else {
        console.warn('❌ Search input not found');
    }
    
    if (clearSearch) {
        clearSearch.addEventListener('click', clearSearchInput);
        console.log('✅ Clear search listener added');
    } else {
        console.warn('❌ Clear search button not found');
    }
    
    if (labelFilter) {
        labelFilter.addEventListener('change', handleFilterChange);
        console.log('✅ Label filter listener added');
    } else {
        console.warn('❌ Label filter not found');
    }
    
    if (countryFilter) {
        countryFilter.addEventListener('change', handleFilterChange);
        console.log('✅ Country filter listener added');
    } else {
        console.warn('❌ Country filter not found');
    }
    
    if (resetFilters) {
        resetFilters.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔄 Reset button clicked');
            resetAllFilters();
        });
        console.log('✅ Reset filters listener added');
    } else {
        console.warn('❌ Reset filters button not found');
    }
    
    // Label assignment and card actions - CONSOLIDATED EVENT HANDLER
    document.addEventListener('click', function(e) {
        // Handle button clicks with more specific targeting
        if (e.target.matches('.assign-label-btn, .assign-label-btn *')) {
            e.preventDefault();
            const btn = e.target.closest('.assign-label-btn');
            console.log('🏷️ ASSIGN button clicked', btn);
            handleLabelAssignment(btn);
            return;
        }
        
        if (e.target.matches('.remove-label-btn, .remove-label-btn *')) {
            // Only handle remove-label buttons in unsorted cards
            const btn = e.target.closest('.remove-label-btn');
            if (btn && !btn.closest('.labeled-card')) {
                e.preventDefault();
                console.log('🗑️ REMOVE button clicked', btn);
                handleLabelRemoval(btn);
            }
            return;
        }
        
        if (e.target.matches('.edit-card-btn, .edit-card-btn *')) {
            e.preventDefault();
            const btn = e.target.closest('.edit-card-btn');
            console.log('✏️ EDIT button clicked', btn);
            handleEditCard(btn);
            return;
        }
        
        if (e.target.matches('.delete-card-btn, .delete-card-btn *')) {
            e.preventDefault();
            const btn = e.target.closest('.delete-card-btn');
            console.log('🗑️ DELETE button clicked', btn);
            handleDeleteCard(btn);
            return;
        }
        
        if (e.target.matches('.toggle-label-btn, .toggle-label-btn *')) {
            e.preventDefault();
            const btn = e.target.closest('.toggle-label-btn');
            console.log('🔽 TOGGLE button clicked', btn);
            handleToggleLabel(btn);
            return;
        }
        
        if (e.target.matches('.preview-card-btn, .preview-card-btn *')) {
            // Only handle preview buttons in unsorted cards
            const btn = e.target.closest('.preview-card-btn');
            if (btn && !btn.closest('.labeled-card')) {
                e.preventDefault();
                console.log('👁️ PREVIEW button clicked', btn);
                const cardId = btn.dataset.cardId;
                if (cardId) {
                    openPreview(parseInt(cardId));
                }
            }
            return;
        }
        
        if (e.target.matches('.edit-label-btn, .edit-label-btn *')) {
            e.preventDefault();
            const btn = e.target.closest('.edit-label-btn');
            console.log('✏️ EDIT LABEL button clicked', btn);
            handleEditLabel(btn);
            return;
        }
    });
    
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
        const cardData = safelyCallFunction(parseCardData, card);
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
    
    console.log('🌍 Populating country filter...');
    
    // First, fetch all available countries from the API
    fetch('/api/countries')
        .then(response => {
            console.log('Countries API response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Countries API data:', data);
            if (data.success && data.countries) {
                // Clear existing options except "All Countries"
                while (countryFilter.children.length > 1) {
                    countryFilter.removeChild(countryFilter.lastChild);
                }
                
                // Get countries that actually appear in cards
                const cards = document.querySelectorAll('.card-item');
                const cardsCountries = new Set();
                
                cards.forEach(card => {
                    const cardData = safelyCallFunction(parseCardData, card);
                    if (cardData && cardData.country && cardData.country !== 'UNKNOWN') {
                        cardsCountries.add(cardData.country);
                    }
                });
                
                // Add countries from API that also appear in cards
                data.countries.forEach(([code, flag]) => {
                    if (cardsCountries.has(code)) {
                        const option = document.createElement('option');
                        option.value = code;
                        option.textContent = `${flag} ${code}`;
                        option.dataset.flag = flag;
                        countryFilter.appendChild(option);
                    }
                });
                
                // Add any remaining countries from cards that weren't in API
                const sortedRemainingCountries = Array.from(cardsCountries).filter(country => 
                    !data.countries.some(([code]) => code === country)
                ).sort();
                
                sortedRemainingCountries.forEach(country => {
                    const option = document.createElement('option');
                    option.value = country;
                    option.textContent = `🌍 ${country}`;
                    countryFilter.appendChild(option);
                });
                
                console.log('✅ Country filter populated successfully');
            } else {
                console.warn('Invalid API response, falling back to local method');
                populateCountryFilterFallback();
            }
        })
        .catch(error => {
            console.error('Error loading countries from API:', error);
            console.log('Falling back to local country detection...');
            populateCountryFilterFallback();
        });
}

function populateCountryFilterFallback() {
    console.log('🔄 Using fallback country filter population...');
    const countryFilter = document.getElementById('countryFilter');
    if (!countryFilter) return;
    
    const cards = document.querySelectorAll('.card-item');
    const countries = new Set();
    
    cards.forEach(card => {
        const cardData = safelyCallFunction(parseCardData, card);
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
    
    console.log(`✅ Fallback populated ${sortedCountries.length} countries`);
}

function handleFilterChange(event) {
    console.log('🔍 Filter change detected:', event ? event.target : 'programmatic call');
    
    const labelFilter = document.getElementById('labelFilter');
    const countryFilter = document.getElementById('countryFilter');
    
    const selectedLabel = labelFilter ? labelFilter.value : '';
    const selectedCountry = countryFilter ? countryFilter.value : '';
    
    console.log('Filter values:', { selectedLabel, selectedCountry });
    
    // Show feedback to user
    if (event && event.target) {
        const filterType = event.target.id === 'labelFilter' ? 'label' : 'country';
        const selectedText = event.target.options[event.target.selectedIndex].text;
        
        if (event.target.value === '') {
            showToast(`Showing all ${filterType}s`, 'info');
        } else {
            showToast(`Filtered by: ${selectedText}`, 'success');
        }
    }
    
    filterCards(selectedLabel, selectedCountry);
}

function filterCards(labelId, country) {
    console.log('🎯 Filtering cards with:', { labelId, country });
    
    const cards = document.querySelectorAll('.card-item');
    let visibleCount = 0;
    let hiddenCount = 0;
    
    cards.forEach((card, index) => {
        const cardData = safelyCallFunction(parseCardData, card);
        if (!cardData) {
            console.warn(`Skipping card ${index} - failed to parse data`);
            return;
        }
        
        let show = true;
        
        // Filter by label
        if (labelId && labelId !== '') {
            if (cardData.label_id != labelId) {
                show = false;
                console.log(`Card ${cardData.id} hidden by label filter: ${cardData.label_id} != ${labelId}`);
            }
        }
        
        // Filter by country
        if (country && country !== '') {
            if (cardData.country !== country) {
                show = false;
                console.log(`Card ${cardData.id} hidden by country filter: ${cardData.country} != ${country}`);
            }
        }
        
        // Apply visibility
        if (show) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
            hiddenCount++;
        }
    });
    
    console.log(`Filter results: ${visibleCount} visible, ${hiddenCount} hidden`);
    
    updateVisibleCounters();
    
    // Show results to user if any filters are active
    if (labelId || country) {
        showToast(`Found ${visibleCount} matching cards`, 'info');
    }
}

function resetAllFilters() {
    console.log('🔄 Resetting all filters to default state');
    
    const labelFilter = document.getElementById('labelFilter');
    const countryFilter = document.getElementById('countryFilter');
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    // Reset label filter to "All Labels"
    if (labelFilter) {
        labelFilter.value = '';
        console.log('✅ Label filter reset to "All Labels"');
    } else {
        console.warn('❌ Label filter element not found');
    }
    
    // Reset country filter to "All Countries"
    if (countryFilter) {
        countryFilter.value = '';
        console.log('✅ Country filter reset to "All Countries"');
    } else {
        console.warn('❌ Country filter element not found');
    }
    
    // Clear search input
    if (searchInput) {
        searchInput.value = '';
        console.log('✅ Search input cleared');
    } else {
        console.warn('❌ Search input element not found');
    }
    
    // Hide clear search button
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    
    // Show all cards
    showAllCards();
    
    // Remove search highlights
    removeSearchHighlights();
    
    // Update counters
    updateCounters();
    
    // Show success feedback
    showToast('All filters reset successfully!', 'success');
    
    console.log('✅ All filters reset completed');
}

function enhanceFilterDropdowns() {
    console.log('🎯 Enhancing filter dropdowns');
    
    try {
        const labelFilter = document.getElementById('labelFilter');
        const countryFilter = document.getElementById('countryFilter');
        
        // Enhance label filter
        if (labelFilter) {
            // Add change event listener for better feedback
            labelFilter.addEventListener('change', function() {
                try {
                    const selectedValue = this.value;
                    const selectedText = this.options[this.selectedIndex].text;
                    
                    if (selectedValue === '') {
                        console.log('🏷️ Showing all labels');
                        showSuccessToast('Showing all labels');
                    } else {
                        console.log(`🏷️ Filtered by label: ${selectedText}`);
                        showSuccessToast(`Filtered by: ${selectedText}`);
                    }
                } catch (error) {
                    console.error('Error in label filter change:', error);
                }
            });
        }
        
        // Enhance country filter
        if (countryFilter) {
            // Add change event listener for better feedback
            countryFilter.addEventListener('change', function() {
                try {
                    const selectedValue = this.value;
                    const selectedText = this.options[this.selectedIndex].text;
                    
                    if (selectedValue === '') {
                        console.log('🌍 Showing all countries');
                        showSuccessToast('Showing all countries');
                    } else {
                        console.log(`🌍 Filtered by country: ${selectedText}`);
                        showSuccessToast(`Filtered by: ${selectedText}`);
                    }
                } catch (error) {
                    console.error('Error in country filter change:', error);
                }
            });
        }
        
        console.log('✅ Filter dropdowns enhanced');
    } catch (error) {
        console.error('Error enhancing filter dropdowns:', error);
    }
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

function handleEditLabel(button) {
    console.log('✏️ Starting edit label process', button);
    const labelId = button.dataset.labelId;
    
    if (!labelId) {
        showToast('Label ID not found', 'error');
        return;
    }
    
    // Find the label group and extract current label data
    const labelGroup = button.closest('.label-group');
    if (!labelGroup) {
        showToast('Label group not found', 'error');
        return;
    }
    
    const labelHeader = labelGroup.querySelector('.label-info h3');
    const labelColor = labelGroup.querySelector('.label-color');
    
    const currentName = labelHeader ? labelHeader.textContent.trim() : '';
    const currentColorStyle = labelColor ? labelColor.style.backgroundColor : '#0891b2';
    
    // Convert RGB/hex color to hex format for input
    let currentColor = '#0891b2';
    if (currentColorStyle) {
        if (currentColorStyle.startsWith('#')) {
            currentColor = currentColorStyle;
        } else if (currentColorStyle.startsWith('rgb')) {
            // Convert rgb to hex if needed
            const rgb = currentColorStyle.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
                currentColor = '#' + rgb.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
            }
        }
    }
    
    console.log('Current label data:', { labelId, currentName, currentColor });
    
    // Populate edit label modal (we'll need to create this)
    showEditLabelModal(labelId, currentName, currentColor);
}

function showEditLabelModal(labelId, currentName, currentColor) {
    // Create edit label modal dynamically if it doesn't exist
    let modal = document.getElementById('editLabelModal');
    if (!modal) {
        modal = createEditLabelModal();
        document.body.appendChild(modal);
    }
    
    // Populate with current values
    document.getElementById('editLabelName').value = currentName;
    document.getElementById('editLabelColor').value = currentColor;
    
    // Store label ID for saving
    const editForm = document.getElementById('editLabelForm');
    editForm.dataset.labelId = labelId;
    
    // Show modal
    showModal('editLabelModal');
}

function createEditLabelModal() {
    const modalHTML = `
        <div class="modal-overlay" id="editLabelModal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Label</h3>
                    <button class="modal-close" data-modal="editLabelModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editLabelForm">
                        <div class="form-group">
                            <label for="editLabelName">Label Name</label>
                            <input type="text" id="editLabelName" placeholder="Label name" required>
                        </div>
                        <div class="form-group">
                            <label for="editLabelColor">Color</label>
                            <div class="color-picker">
                                <input type="color" id="editLabelColor" value="#0891b2">
                                <div class="color-presets">
                                    <div class="color-preset" data-color="#0891b2" style="background: #0891b2;"></div>
                                    <div class="color-preset" data-color="#059669" style="background: #059669;"></div>
                                    <div class="color-preset" data-color="#dc2626" style="background: #dc2626;"></div>
                                    <div class="color-preset" data-color="#d97706" style="background: #d97706;"></div>
                                    <div class="color-preset" data-color="#7c3aed" style="background: #7c3aed;"></div>
                                    <div class="color-preset" data-color="#db2777" style="background: #db2777;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn" data-modal="editLabelModal">Cancel</button>
                            <button type="button" class="delete-btn" id="deleteLabelBtn">
                                <i class="fas fa-trash"></i> Delete Label
                            </button>
                            <button type="submit" class="submit-btn">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    const modal = modalContainer.firstElementChild;
    
    // Setup form submission
    const editForm = modal.querySelector('#editLabelForm');
    editForm.addEventListener('submit', handleEditLabelSave);
    
    // Setup delete button
    const deleteBtn = modal.querySelector('#deleteLabelBtn');
    deleteBtn.addEventListener('click', handleDeleteLabel);
    
    // Setup color picker
    const colorPresets = modal.querySelectorAll('.color-preset');
    const colorInput = modal.querySelector('#editLabelColor');
    
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
    
    return modal;
}

function handleEditLabelSave(e) {
    e.preventDefault();
    
    const form = e.target;
    const labelId = form.dataset.labelId;
    const name = document.getElementById('editLabelName').value.trim();
    const color = document.getElementById('editLabelColor').value;
    
    if (!name) {
        showToast('Please enter a label name', 'error');
        return;
    }
    
    if (!labelId) {
        showToast('Label ID not found', 'error');
        return;
    }
    
    showLoading('Updating label...');
    
    // Since there's no edit endpoint, we'll need to add one or simulate it
    fetch(`/api/labels/${labelId}`, {
        method: 'PUT',
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
            showToast('Label updated successfully!', 'success');
            hideModal('editLabelModal');
            // Refresh the page to update the UI
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(data.message || 'Failed to update label', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        // If endpoint doesn't exist, show a message for now
        showToast('Label edit functionality needs backend implementation', 'error');
        console.error('Error:', error);
    });
}

function handleDeleteLabel() {
    const form = document.getElementById('editLabelForm');
    const labelId = form.dataset.labelId;
    const labelName = document.getElementById('editLabelName').value;
    
    if (!labelId) {
        showToast('Label ID not found', 'error');
        return;
    }
    
    if (!confirm(`Delete label "${labelName}"?\n\nThis will remove the label from all cards and move them to unsorted. This action cannot be undone.`)) {
        return;
    }
    
    showLoading('Deleting label...');
    
    fetch(`/api/labels/${labelId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showToast('Label deleted successfully!', 'success');
            hideModal('editLabelModal');
            // Refresh the page to update the UI
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(data.message || 'Failed to delete label', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error deleting label', 'error');
        console.error('Error:', error);
    });
}

// 201-240: Card management
function handleEditCard(button) {
    console.log('🖊️ Edit button clicked', button);
    const card = button.closest('.card-item');
    
    // Use helper function to parse card data safely
    const cardData = safelyCallFunction(parseCardData, card);
    if (!cardData) {
        showErrorToast('Error: Could not read card data');
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
    const cardData = safelyCallFunction(parseCardData, card);
    if (!cardData) {
        showErrorToast('Error: Could not read card data');
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
            showSuccessToast('Card deleted successfully!');
            // Remove the card from the UI
            card.remove();
            updateCounters();
        } else {
            showErrorToast(data.message || 'Failed to delete card');
        }
    })
    .catch(error => {
        hideLoading();
        showErrorToast('Error deleting card');
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
                
                // Handle card movement from unsorted to label containers
                const cardId = evt.item.dataset.cardId;
                const newContainer = evt.to;
                const oldContainer = evt.from;
                
                // Check if moved from unsorted to a label container
                if (newContainer !== oldContainer) {
                    const labelId = newContainer.dataset.labelId;
                    if (labelId) {
                        // Card moved from unsorted to a label
                        handleDraggedLabelAssignment(cardId, labelId, newContainer);
                    } else if (oldContainer.dataset.labelId && newContainer.id === 'unsortedContainer') {
                        // Card moved from label back to unsorted
                        handleRemoveLabelFromCard(cardId);
                    }
                }
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
                const oldContainer = evt.from;
                
                if (newContainer !== oldContainer) {
                    const newLabelId = newContainer.dataset.labelId;
                    const oldLabelId = oldContainer.dataset.labelId;
                    
                    if (newLabelId) {
                        // Card moved to a label container
                        handleDraggedLabelAssignment(cardId, newLabelId, newContainer);
                    } else if (newContainer.id === 'unsortedContainer') {
                        // Card moved to unsorted from a label
                        handleRemoveLabelFromCard(cardId);
                    }
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

function handleRemoveLabelFromCard(cardId) {
    showLoading('Removing from label...');
    
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
            showToast('Card moved to unsorted!', 'success');
            // Refresh the page to update the UI
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(data.message || 'Failed to remove from label', 'error');
            // Refresh to revert the UI change
            window.location.reload();
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error removing from label', 'error');
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
    // Simplified card click handling - only for unsorted card body clicks (not buttons)
    document.addEventListener('click', function(e) {
        // Only handle clicks on unsorted card content, not buttons, and not labeled cards
        const cardItem = e.target.closest('.card-item');
        
        if (cardItem && 
            !cardItem.classList.contains('labeled-card') &&
            !e.target.closest('.card-actions') && 
            !e.target.closest('.card-footer') &&
            !e.target.closest('button')) {
            
            const cardId = cardItem.dataset.cardId;
            if (cardId) {
                console.log('📋 Unsorted card body clicked, opening preview for:', cardId);
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
            if (previewContent) previewContent.style.display = 'block';
            if (previewLoaded) previewLoaded.style.display = 'none';
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
    
    /* Enhanced filter dropdowns */
    .filter-select {
        transition: all 0.2s ease !important;
        border: 2px solid #e5e7eb !important;
    }
    
    .filter-select:hover {
        border-color: #0891b2 !important;
        box-shadow: 0 2px 4px rgba(8, 145, 178, 0.1) !important;
    }
    
    .filter-select:focus {
        border-color: #0891b2 !important;
        box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1) !important;
        outline: none !important;
    }
    
    /* Enhanced reset button */
    .reset-filters-btn {
        transition: all 0.2s ease !important;
        background: #6b7280 !important;
        border: 2px solid #6b7280 !important;
        color: white !important;
    }
    
    .reset-filters-btn:hover {
        background: #4b5563 !important;
        border-color: #4b5563 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
    }
    
    .reset-filters-btn:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    }
    
    /* Enhanced edit label button */
    .edit-label-btn {
        pointer-events: auto !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
    }
    
    .edit-label-btn:hover {
        background: #f3f4f6 !important;
        transform: scale(1.1) !important;
    }
    
    /* Delete button in modal */
    .delete-btn {
        background: #dc2626 !important;
        border: 2px solid #dc2626 !important;
        color: white !important;
        margin-right: auto !important;
    }
    
    .delete-btn:hover {
        background: #b91c1c !important;
        border-color: #b91c1c !important;
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

// Enhanced functionality summary
console.log('🎯 Enhanced Data Management Features:');
console.log('   ✅ Edit Label buttons now functional');
console.log('   ✅ Reset button enhanced with better feedback');
console.log('   ✅ Country filter enhanced with flags and API integration');
console.log('   ✅ Label filter enhanced with better feedback');
console.log('   ✅ Added delete label functionality in edit modal');
console.log('   ✅ All dropdowns now provide user feedback');

// Global error handler to catch any remaining issues
window.addEventListener('error', function(event) {
    console.error('Global error caught:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Show user-friendly error message for critical errors
    if (event.message.includes('parseCardData') || 
        event.message.includes('showToast') || 
        event.message.includes('handleEdit')) {
        
        if (typeof showErrorToast === 'function') {
            showErrorToast('A technical error occurred. Please refresh the page.');
        } else {
            console.error('Critical error - please refresh the page');
        }
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('fetch') || 
         event.reason.message.includes('API'))) {
        
        if (typeof showErrorToast === 'function') {
            showErrorToast('Network error occurred. Please check your connection.');
        }
    }
});

console.log('🛡️ Global error handlers initialized');

// Image Modal Functions
function openImageModal() {
    const previewImage = document.getElementById('previewImage');
    const previewFilename = document.getElementById('previewFilename');
    const modalImage = document.getElementById('modalImage');
    const modalFilename = document.getElementById('modalImageFilename');
    const imageModal = document.getElementById('imageModal');
    
    if (previewImage && modalImage && imageModal) {
        modalImage.src = previewImage.src;
        modalImage.alt = previewImage.alt;
        
        if (previewFilename && modalFilename) {
            modalFilename.textContent = previewFilename.textContent;
        }
        
        imageModal.classList.add('show');
        
        // Add click handler to close modal when clicking outside image
        setTimeout(() => {
            imageModal.addEventListener('click', function(e) {
                if (e.target === imageModal) {
                    closeImageModal();
                }
            });
        }, 100);
    }
}

function closeImageModal() {
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.classList.remove('show');
    }
}

// Add keyboard support for image modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const imageModal = document.getElementById('imageModal');
        if (imageModal && imageModal.classList.contains('show')) {
            closeImageModal();
        }
    }
});

// Make functions globally available
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;