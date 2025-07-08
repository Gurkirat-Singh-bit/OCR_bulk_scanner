// Country data with flags and names
const COUNTRIES = [
    { name: 'Afghanistan', flag: '🇦🇫' }, { name: 'Albania', flag: '🇦🇱' }, { name: 'Algeria', flag: '🇩🇿' },
    { name: 'Argentina', flag: '🇦🇷' }, { name: 'Armenia', flag: '🇦🇲' }, { name: 'Australia', flag: '🇦🇺' },
    { name: 'Austria', flag: '🇦🇹' }, { name: 'Azerbaijan', flag: '🇦🇿' }, { name: 'Bangladesh', flag: '🇧🇩' },
    { name: 'Belgium', flag: '🇧🇪' }, { name: 'Brazil', flag: '🇧🇷' }, { name: 'Bulgaria', flag: '🇧🇬' },
    { name: 'Canada', flag: '🇨🇦' }, { name: 'Chile', flag: '🇨🇱' }, { name: 'China', flag: '🇨🇳' },
    { name: 'Colombia', flag: '🇨🇴' }, { name: 'Croatia', flag: '🇭🇷' }, { name: 'Czech Republic', flag: '🇨🇿' },
    { name: 'Denmark', flag: '🇩🇰' }, { name: 'Egypt', flag: '🇪🇬' }, { name: 'Finland', flag: '🇫🇮' },
    { name: 'France', flag: '🇫🇷' }, { name: 'Germany', flag: '🇩🇪' }, { name: 'Greece', flag: '🇬🇷' },
    { name: 'India', flag: '🇮🇳' }, { name: 'Indonesia', flag: '🇮🇩' }, { name: 'Iran', flag: '🇮🇷' },
    { name: 'Ireland', flag: '🇮🇪' }, { name: 'Israel', flag: '🇮🇱' }, { name: 'Italy', flag: '🇮🇹' },
    { name: 'Japan', flag: '🇯🇵' }, { name: 'Kazakhstan', flag: '🇰🇿' }, { name: 'Malaysia', flag: '🇲🇾' },
    { name: 'Mexico', flag: '🇲🇽' }, { name: 'Netherlands', flag: '🇳🇱' }, { name: 'Nigeria', flag: '🇳🇬' },
    { name: 'Norway', flag: '🇳🇴' }, { name: 'Pakistan', flag: '🇵🇰' }, { name: 'Poland', flag: '🇵🇱' },
    { name: 'Portugal', flag: '🇵🇹' }, { name: 'Romania', flag: '🇷🇴' }, { name: 'Russia', flag: '🇷🇺' },
    { name: 'Singapore', flag: '🇸🇬' }, { name: 'South Korea', flag: '🇰🇷' }, { name: 'Spain', flag: '🇪🇸' },
    { name: 'Sweden', flag: '🇸🇪' }, { name: 'Switzerland', flag: '🇨🇭' }, { name: 'Turkey', flag: '🇹🇷' },
    { name: 'Ukraine', flag: '🇺🇦' }, { name: 'United Kingdom', flag: '🇬🇧' }, { name: 'United States', flag: '🇺🇸' }
];

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
        initializePreviewPanel();
        
        // Populate country filter after a slight delay to ensure cards are rendered
        setTimeout(() => {
            populateCountryFilter();
        }, 500);
        
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
        
        // Handle direct card clicks for preview
        if (e.target.closest('.card-item') && !e.target.closest('button') && !e.target.closest('.card-actions')) {
            const card = e.target.closest('.card-item');
            const cardId = card?.dataset.cardId;
            if (cardId) {
                console.log('🃏 Card clicked for preview', cardId);
                openPreview(parseInt(cardId));
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
    
    console.log('🔍 Button elements found:', {
        createLabelBtn: !!createLabelBtn,
        createFirstLabel: !!createFirstLabel
    });
    
    if (createLabelBtn) {
        createLabelBtn.addEventListener('click', function(e) {
            console.log('🏷️ Create Label Button clicked!', e);
            e.preventDefault();
            showModal('createLabelModal');
        });
        console.log('✅ Create label button listener added');
    } else {
        console.error('❌ Create label button not found!');
    }
    
    if (createFirstLabel) {
        createFirstLabel.addEventListener('click', function(e) {
            console.log('🏷️ Create First Label Button clicked!', e);
            e.preventDefault();
            showModal('createLabelModal');
        });
        console.log('✅ Create first label button listener added');
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function(e) {
            console.log('📤 Export Button clicked!', e);
            e.preventDefault();
            handleExport();
        });
        console.log('✅ Export button listener added');
    } else {
        console.error('❌ Export button not found!');
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
    // Search both normal view cards and gallery view cards
    const normalCards = document.querySelectorAll('.card-item');
    const galleryCards = document.querySelectorAll('.gallery-card-item');
    const allCards = [...normalCards, ...galleryCards];
    const queryLower = query.toLowerCase();
    
    allCards.forEach(card => {
        const cardData = safelyCallFunction(parseCardData, card);
        if (!cardData) return; // Skip if parsing failed
        
        const searchableText = [
            cardData.name || '',
            cardData.company || '',
            cardData.email || '',
            cardData.phone || '',
            cardData.country || '',
            cardData.designation || '',
            cardData.event_name || '',
            cardData.event_host || '',
            cardData.event_location || ''
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
    // Show both normal view cards and gallery view cards
    const normalCards = document.querySelectorAll('.card-item');
    const galleryCards = document.querySelectorAll('.gallery-card-item');
    const allCards = [...normalCards, ...galleryCards];
    
    allCards.forEach(card => {
        card.style.display = 'block';
    });
    updateVisibleCounters();
}

// 121-160: Filter functionality
function populateCountryFilter() {
    const countryFilter = document.getElementById('countryFilter');
    if (!countryFilter) {
        console.error('❌ Country filter element not found');
        return;
    }
    
    console.log('🌍 Populating country filter with counts...');
    
    // Clear existing options except "All Countries"
    while (countryFilter.children.length > 1) {
        countryFilter.removeChild(countryFilter.lastChild);
    }
    
    // Get all cards and count by country (both normal and gallery view)
    const normalCards = document.querySelectorAll('.card-item');
    const galleryCards = document.querySelectorAll('.gallery-card-item');
    // Use Set to avoid double counting the same card
    const allCardIds = new Set();
    const uniqueCards = [];
    
    [...normalCards, ...galleryCards].forEach(card => {
        const cardId = card.dataset.cardId;
        if (cardId && !allCardIds.has(cardId)) {
            allCardIds.add(cardId);
            uniqueCards.push(card);
        }
    });
    
    const countryCount = new Map();
    
    console.log(`Found ${uniqueCards.length} unique cards to analyze`);
    
    if (uniqueCards.length === 0) {
        console.warn('No cards found for country analysis');
        return;
    }
    
    uniqueCards.forEach((card, index) => {
        try {
            const cardData = parseCardData(card);
            console.log(`Card ${index + 1}:`, cardData);
            
            if (cardData) {
                let country = 'Unknown';
                
                // Try to get country from different sources
                if (cardData.country && cardData.country !== 'UNKNOWN' && cardData.country.toUpperCase() !== 'UNKNOWN' && cardData.country.trim() !== '') {
                    // If it's a country code, convert to country name
                    const countryCode = cardData.country.toUpperCase();
                    const countryCodeMapping = {
                        'IN': 'India', 'US': 'United States', 'GB': 'United Kingdom', 'DE': 'Germany',
                        'FR': 'France', 'IT': 'Italy', 'NL': 'Netherlands', 'SE': 'Sweden', 'AU': 'Australia',
                        'CA': 'Canada', 'JP': 'Japan', 'CN': 'China', 'RU': 'Russia', 'BR': 'Brazil'
                    };
                    
                    if (countryCodeMapping[countryCode]) {
                        country = countryCodeMapping[countryCode];
                    } else if (cardData.country.length > 2) {
                        // It's already a country name
                        country = cardData.country;
                    } else {
                        country = cardData.country;
                    }
                } else {
                    // Try to extract from flag if available
                    const flagElement = card.querySelector('.country-flag');
                    if (flagElement && flagElement.textContent !== '🌍') {
                        // Try to match flag to country name
                        const flag = flagElement.textContent;
                        const countryFromFlag = COUNTRIES.find(c => c.flag === flag);
                        if (countryFromFlag) {
                            country = countryFromFlag.name;
                        }
                    }
                }
                
                console.log(`Card ${index + 1} country:`, country);
                countryCount.set(country, (countryCount.get(country) || 0) + 1);
            }
        } catch (error) {
            console.error(`Error processing card ${index + 1}:`, error);
        }
    });
    
    console.log('Country counts:', Array.from(countryCount.entries()));
    
    // Convert to array and sort by count (descending) then by name
    const sortedCountries = Array.from(countryCount.entries())
        .sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1]; // Sort by count descending
            return a[0].localeCompare(b[0]); // Then by name ascending
        });
    
    console.log('Sorted countries:', sortedCountries);
    
    // Add options with flags and counts
    sortedCountries.forEach(([country, count]) => {
        try {
            const countryData = COUNTRIES.find(c => c.name.toLowerCase() === country.toLowerCase());
            const flag = countryData ? countryData.flag : '🌍';
            
            const option = document.createElement('option');
            option.value = country;
            option.textContent = `${flag} ${country} (${count})`;
            option.dataset.flag = flag;
            countryFilter.appendChild(option);
            
            console.log(`Added option: ${flag} ${country} (${count})`);
        } catch (error) {
            console.error(`Error adding country option for ${country}:`, error);
        }
    });
    
    console.log(`✅ Country filter populated with ${sortedCountries.length} countries`);
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
    
    // Filter both normal view cards and gallery view cards
    const normalCards = document.querySelectorAll('.card-item');
    const galleryCards = document.querySelectorAll('.gallery-card-item');
    const allCards = [...normalCards, ...galleryCards];
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    allCards.forEach((card, index) => {
        try {
            const cardData = parseCardData(card);
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
            let cardCountry = 'Unknown';
            
            // Convert card country code to name if needed
            if (cardData.country && cardData.country !== 'UNKNOWN' && cardData.country.toUpperCase() !== 'UNKNOWN' && cardData.country.trim() !== '') {
                const countryCode = cardData.country.toUpperCase();
                const countryCodeMapping = {
                    'IN': 'India', 'US': 'United States', 'GB': 'United Kingdom', 'DE': 'Germany',
                    'FR': 'France', 'IT': 'Italy', 'NL': 'Netherlands', 'SE': 'Sweden', 'AU': 'Australia',
                    'CA': 'Canada', 'JP': 'Japan', 'CN': 'China', 'RU': 'Russia', 'BR': 'Brazil'
                };
                
                if (countryCodeMapping[countryCode]) {
                    cardCountry = countryCodeMapping[countryCode];
                } else if (cardData.country.length > 2) {
                    cardCountry = cardData.country;
                } else {
                    cardCountry = cardData.country;
                }
            } else {
                // Card has no country or UNKNOWN country
                cardCountry = 'Unknown';
            }
            
            console.log(`Card ${cardData.id} country comparison: "${cardCountry}" vs filter "${country}"`);
            
            if (cardCountry !== country) {
                show = false;
                console.log(`Card ${cardData.id} hidden by country filter: ${cardCountry} != ${country}`);
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
        } catch (error) {
            console.error(`Error filtering card ${index}:`, error);
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
    document.getElementById('editCountry').value = cardData.country || '';
    
    // Populate event fields
    document.getElementById('editEventName').value = cardData.event_name || '';
    document.getElementById('editEventHost').value = cardData.event_host || '';
    document.getElementById('editEventDate').value = cardData.event_date || '';
    document.getElementById('editEventLocation').value = cardData.event_location || '';
    document.getElementById('editEventDescription').value = cardData.event_description || '';
    
    // Set flag data if available
    const countryInput = document.getElementById('editCountry');
    if (cardData.flag) {
        countryInput.dataset.flag = cardData.flag;
    } else if (cardData.country) {
        // Try to get flag from country name
        const country = COUNTRIES.find(c => c.name.toLowerCase() === cardData.country.toLowerCase());
        countryInput.dataset.flag = country ? country.flag : '🌍';
    }
    
    // Populate label select dropdown
    populateEditLabelSelect(cardData.label_id);
    
    // Store card ID and current data for saving
    const editForm = document.getElementById('editCardForm');
    editForm.dataset.cardId = cardData.id;
    editForm.dataset.cardData = JSON.stringify(cardData);
    
    // Setup form submission if not already done
    if (!editForm.hasAttribute('data-listener')) {
        editForm.addEventListener('submit', handleSaveCard);
        editForm.setAttribute('data-listener', 'true');
    }
    
    showModal('editCardModal');
}

// Function to populate the label select dropdown in edit modal
function populateEditLabelSelect(selectedLabelId) {
    const labelSelect = document.getElementById('editLabelSelect');
    if (!labelSelect) {
        console.error('Label select element not found');
        return;
    }
    
    // Clear existing options except the first "No Label" option
    while (labelSelect.children.length > 1) {
        labelSelect.removeChild(labelSelect.lastChild);
    }
    
    // Fetch labels from API
    fetch('/api/labels')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.labels) {
                // Add option for each label
                data.labels.forEach(label => {
                    const option = document.createElement('option');
                    option.value = label.id;
                    option.textContent = label.name;
                    option.dataset.labelName = label.name;
                    option.dataset.labelColor = label.color;
                    
                    // Add color indicator
                    const labelHTML = `<span class="label-color-dot" style="background-color: ${label.color};"></span> ${label.name}`;
                    option.innerHTML = labelHTML;
                    
                    labelSelect.appendChild(option);
                });
                
                // Set selected value if provided
                if (selectedLabelId) {
                    labelSelect.value = selectedLabelId;
                }
            } else {
                console.error('Failed to load labels:', data.message || 'Unknown error');
            }
        })
        .catch(error => {
            console.error('Error loading labels:', error);
        });
}

function handleSaveCard(e) {
    e.preventDefault();
    
    const form = e.target;
    const cardId = form.dataset.cardId;
    let cardData = {};
    
    // Get stored card data if available
    try {
        cardData = JSON.parse(form.dataset.cardData || '{}');
    } catch (err) {
        console.error('Error parsing stored card data:', err);
    }
    
    const updatedData = {
        name: document.getElementById('editName').value.trim(),
        designation: document.getElementById('editDesignation').value.trim(),
        company: document.getElementById('editCompany').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        website: document.getElementById('editWebsite').value.trim(),
        country: document.getElementById('editCountry').value.trim(),
        flag: document.getElementById('editCountry').dataset.flag || '🌍',
        // Event fields
        event_name: document.getElementById('editEventName').value.trim(),
        event_host: document.getElementById('editEventHost').value.trim(),
        event_date: document.getElementById('editEventDate').value.trim(),
        event_location: document.getElementById('editEventLocation').value.trim(),
        event_description: document.getElementById('editEventDescription').value.trim()
    };
    
    showLoading('Saving changes...');
    
    // First save the basic card data
    fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Now handle label assignment if needed
            const labelSelect = document.getElementById('editLabelSelect');
            const labelId = labelSelect?.value;
            
            // If no select element found
            if (!labelSelect) {
                hideLoading();
                showToast('Card updated successfully!', 'success');
                hideModal('editCardModal');
                // Refresh the page to update the UI
                setTimeout(() => window.location.reload(), 1000);
                return;
            }
            
            // If "--No Label--" is selected and card currently has a label, remove it
            if (!labelId && cardData.label_id) {
                fetch(`/api/cards/${cardId}/label`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => response.json())
                .then(labelData => {
                    hideLoading();
                    if (labelData.success) {
                        showToast('Card updated and label removed successfully!', 'success');
                    } else {
                        showToast('Card updated but label removal failed', 'warning');
                    }
                    hideModal('editCardModal');
                    // Refresh the page to update the UI
                    setTimeout(() => window.location.reload(), 1000);
                })
                .catch(labelError => {
                    hideLoading();
                    console.error('Error removing label:', labelError);
                    showToast('Card updated but label removal failed', 'warning');
                    hideModal('editCardModal');
                    // Refresh the page to update the UI
                    setTimeout(() => window.location.reload(), 1000);
                });
                return;
            }
            
            // If no label is selected (and card had no label before)
            if (!labelId) {
                hideLoading();
                showToast('Card updated successfully!', 'success');
                hideModal('editCardModal');
                // Refresh the page to update the UI
                setTimeout(() => window.location.reload(), 1000);
                return;
            }
            
            // If there's a label selected, assign it to the card
            const selectedOption = labelSelect.options[labelSelect.selectedIndex];
            const labelName = selectedOption.dataset.labelName || selectedOption.text;
            
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
            .then(labelData => {
                hideLoading();
                if (labelData.success) {
                    showToast('Card updated and label assigned successfully!', 'success');
                } else {
                    showToast('Card updated but label assignment failed', 'warning');
                }
                hideModal('editCardModal');
                // Refresh the page to update the UI
                setTimeout(() => window.location.reload(), 1000);
            })
            .catch(labelError => {
                hideLoading();
                console.error('Error assigning label:', labelError);
                showToast('Card updated but label assignment failed', 'warning');
                hideModal('editCardModal');
                // Refresh the page to update the UI
                setTimeout(() => window.location.reload(), 1000);
            });
        } else {
            hideLoading();
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
    console.log('🎯 Export button clicked - showing export modal');
    showExportModal();
}

function showExportModal() {
    // Create or show export modal
    let modal = document.getElementById('exportModal');
    if (!modal) {
        modal = createExportModal();
        document.body.appendChild(modal);
    }
    
    // Populate labels and countries in the modal
    populateExportOptions();
    modal.style.display = 'flex';
}

function createExportModal() {
    const modal = document.createElement('div');
    modal.id = 'exportModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content export-modal">
            <div class="modal-header">
                <h3><i class="fas fa-download"></i> Export Data</h3>
                <button class="modal-close" onclick="hideExportModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="export-options">
                    <div class="export-option">
                        <button class="export-btn primary" onclick="exportAllData()">
                            <i class="fas fa-file-excel"></i>
                            <div>
                                <strong>Export All Data</strong>
                                <p>Download complete dataset with enhanced formatting</p>
                            </div>
                        </button>
                    </div>
                    
                    <div class="export-option">
                        <button class="export-btn advanced" onclick="exportAdvancedReport()">
                            <i class="fas fa-chart-line"></i>
                            <div>
                                <strong>Advanced Analytics Report</strong>
                                <p>Multi-sheet report with charts and data analysis</p>
                            </div>
                        </button>
                    </div>
                    
                    <div class="export-option">
                        <h4><i class="fas fa-tags"></i> Export by Labels</h4>
                        <div class="filter-group">
                            <div class="checkbox-group" id="labelCheckboxes"></div>
                            <label class="checkbox-label">
                                <input type="checkbox" id="includeUnlabeled">
                                <span class="checkmark"></span>
                                Include unlabeled cards
                            </label>
                        </div>
                        <button class="export-btn" onclick="exportByLabels()">
                            <i class="fas fa-tags"></i> Export Selected Labels
                        </button>
                    </div>
                    
                    <div class="export-option">
                        <h4><i class="fas fa-globe"></i> Export by Countries</h4>
                        <div class="filter-group">
                            <div class="checkbox-group" id="countryCheckboxes"></div>
                        </div>
                        <button class="export-btn" onclick="exportByCountries()">
                            <i class="fas fa-globe"></i> Export Selected Countries
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function hideExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function populateExportOptions() {
    populateExportLabels();
    populateExportCountries();
}

function populateExportLabels() {
    const container = document.getElementById('labelCheckboxes');
    if (!container) return;
    
    fetch('/api/labels')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.labels) {
                container.innerHTML = '';
                data.labels.forEach(label => {
                    const labelDiv = document.createElement('div');
                    labelDiv.className = 'checkbox-item';
                    labelDiv.innerHTML = `
                        <label class="checkbox-label">
                            <input type="checkbox" value="${label.id}" name="exportLabels">
                            <span class="checkmark"></span>
                            <span class="label-indicator" style="background-color: ${label.color}"></span>
                            ${label.name} (${label.card_count || 0} cards)
                        </label>
                    `;
                    container.appendChild(labelDiv);
                });
            }
        })
        .catch(error => console.error('Error loading labels:', error));
}

function populateExportCountries() {
    const container = document.getElementById('countryCheckboxes');
    if (!container) return;
    
    // Get unique countries from current cards
    const cards = document.querySelectorAll('.card-item');
    const countryStats = {};
    
    cards.forEach(card => {
        try {
            const cardData = parseCardData(card);
            if (cardData && cardData.country) {
                const country = cardData.country;
                const flag = cardData.flag || '🌍';
                const key = `${flag} ${country}`;
                countryStats[key] = (countryStats[key] || 0) + 1;
            }
        } catch (e) {
            console.error('Error parsing card for country stats:', e);
        }
    });
    
    container.innerHTML = '';
    Object.entries(countryStats)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([countryDisplay, count]) => {
            const countryCode = countryDisplay.split(' ')[1]; // Extract country code
            const countryDiv = document.createElement('div');
            countryDiv.className = 'checkbox-item';
            countryDiv.innerHTML = `
                <label class="checkbox-label">
                    <input type="checkbox" value="${countryCode}" name="exportCountries">
                    <span class="checkmark"></span>
                    ${countryDisplay} (${count} cards)
                </label>
            `;
            container.appendChild(countryDiv);
        });
}

function exportAllData() {
    showLoading('Preparing complete export...');
    
    // Use the enhanced download endpoint
    window.location.href = '/download';
    
    setTimeout(() => {
        hideLoading();
        hideExportModal();
        showToast('Complete export initiated!', 'success');
    }, 2000);
}

function exportAdvancedReport() {
    showLoading('Preparing advanced analytics report...');
    
    // Use the advanced download endpoint
    window.location.href = '/download/advanced';
    
    setTimeout(() => {
        hideLoading();
        hideExportModal();
        showToast('Advanced analytics report initiated!', 'success');
    }, 2000);
}

function exportByLabels() {
    const selectedLabels = Array.from(document.querySelectorAll('input[name="exportLabels"]:checked'))
        .map(cb => parseInt(cb.value));
    const includeUnlabeled = document.getElementById('includeUnlabeled')?.checked || false;
    
    if (selectedLabels.length === 0 && !includeUnlabeled) {
        showToast('Please select at least one label or include unlabeled cards', 'warning');
        return;
    }
    
    showLoading('Preparing label-filtered export...');
    
    // Use the filtered download endpoint
    const params = new URLSearchParams();
    selectedLabels.forEach(id => params.append('labels', id));
    if (includeUnlabeled) {
        params.append('include_unlabeled', 'true');
    }
    params.append('type', 'labels');
    
    window.location.href = `/download/filtered?${params.toString()}`;
    
    setTimeout(() => {
        hideLoading();
        hideExportModal();
        showToast('Label-filtered export initiated!', 'success');
    }, 2000);
}

function exportByCountries() {
    const selectedCountries = Array.from(document.querySelectorAll('input[name="exportCountries"]:checked'))
        .map(cb => cb.value);
    
    if (selectedCountries.length === 0) {
        showToast('Please select at least one country', 'warning');
        return;
    }
    
    showLoading('Preparing country-filtered export...');
    
    // Use the filtered download endpoint
    const params = new URLSearchParams();
    selectedCountries.forEach(country => params.append('countries', country));
    params.append('type', 'countries');
    
    window.location.href = `/download/filtered?${params.toString()}`;
    
    setTimeout(() => {
        hideLoading();
        hideExportModal();
        showToast('Country-filtered export initiated!', 'success');
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
    console.log('🔍 showModal called with modalId:', modalId);
    const modal = document.getElementById(modalId);
    console.log('🔍 Modal element found:', !!modal);
    
    if (modal) {
        modal.style.display = 'flex';
        console.log('✅ Modal displayed:', modalId);
        
        // Initialize country autocomplete for edit card modal
        if (modalId === 'editCardModal') {
            initializeCountryAutocomplete();
        }
        
        // Focus first input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    } else {
        console.error('❌ Modal not found:', modalId);
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

function showToast(message, type = 'success', duration = 4000) {
    // Also log to console for debugging
    console.log(`Toast [${type}]: ${message}`);
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style the toast
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'var(--success-light)' : type === 'error' ? 'var(--error-light)' : type === 'warning' ? 'var(--warning-light)' : 'var(--accent-primary)'};
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
    
    // Remove after specified duration
    setTimeout(() => {
        toast.remove();
    }, duration);
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
                
                // Check if card is approved for dragging
                const cardId = evt.item.dataset.cardId;
                const approvalStatus = loadApprovalStatusLocally(cardId);
                
                if (approvalStatus !== 'approved') {
                    // Add visual feedback for non-approved cards
                    evt.item.style.opacity = '0.5';
                    evt.item.style.border = '2px dashed #ef4444';
                    
                    // Show temporary message
                    showToast('⚠️ This card needs reviewer approval before sorting', 'warning', 2000);
                }
            },
            onEnd: function(evt) {
                evt.item.classList.remove('dragging');
                // Reset styling
                evt.item.style.opacity = '';
                evt.item.style.border = '';
                
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
                
                // Check if card is approved for dragging
                const cardId = evt.item.dataset.cardId;
                const approvalStatus = loadApprovalStatusLocally(cardId);
                
                if (approvalStatus !== 'approved') {
                    // Add visual feedback for non-approved cards
                    evt.item.style.opacity = '0.5';
                    evt.item.style.border = '2px dashed #ef4444';
                    
                    // Show temporary message
                    showToast('⚠️ This card needs reviewer approval before sorting', 'warning', 2000);
                }
            },
            onEnd: function(evt) {
                evt.item.classList.remove('dragging');
                // Reset styling
                evt.item.style.opacity = '';
                evt.item.style.border = '';
                
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
    // Check if card is approved before allowing assignment
    const approvalStatus = loadApprovalStatusLocally(cardId);
    console.log(`🔍 Checking approval status for card ${cardId}: ${approvalStatus}`);
    
    if (approvalStatus !== 'approved') {
        showToast('❌ Cards can only be labeled after reviewer approval (green tick)', 'error');
        
        // Revert the card back to its original position
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        return;
    }
    
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
            showToast('✅ Card moved successfully!', 'success');
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
    // Check if card is approved before allowing removal from label
    const approvalStatus = loadApprovalStatusLocally(cardId);
    console.log(`🔍 Checking approval status for card ${cardId} before removal: ${approvalStatus}`);
    
    if (approvalStatus !== 'approved') {
        showToast('❌ Cards can only be moved after reviewer approval (green tick)', 'error');
        
        // Revert the card back to its original position
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        return;
    }
    
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
            showToast('✅ Card moved to unsorted!', 'success');
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
    
    if (previewImage && card.image_base64) {
        previewImage.src = card.image_base64;
        previewImage.alt = `Business card for ${card.name || 'Unknown'}`;
    }
    
    // Populate card information section
    populateCardInfo(card);
    
    // Set form fields with fallback values (for edit mode if it exists)
    setFieldValue('previewName', card.name || 'N/A');
    setFieldValue('previewCompany', card.company || 'N/A');
    setFieldValue('previewDesignation', card.designation || 'N/A');
    setFieldValue('previewEmail', card.email || 'N/A');
    setFieldValue('previewPhone', card.phone || 'N/A');
    setFieldValue('previewWebsite', card.website || 'N/A');
    
    // Set event form fields if they exist
    setFieldValue('previewEventName', card.event_name || '');
    setFieldValue('previewEventHost', card.event_host || '');
    setFieldValue('previewEventDate', card.event_date || '');
    setFieldValue('previewEventLocation', card.event_location || '');
    setFieldValue('previewEventDescription', card.event_description || '');
    
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

function populateCardInfo(card) {
    // Update card name and flag in header
    const cardName = document.getElementById('previewCardName');
    const cardFlag = document.getElementById('previewCardFlag');
    
    if (cardName) {
        cardName.textContent = card.name || 'Unknown Name';
    }
    
    if (cardFlag) {
        cardFlag.textContent = card.flag || '🌍';
    }
    
    // Helper function to show/hide info items based on data availability
    function updateInfoItem(itemId, fieldId, value) {
        const item = document.getElementById(itemId);
        const field = document.getElementById(fieldId);
        
        if (item && field) {
            if (value && value.trim() && value.trim() !== 'N/A') {
                field.textContent = value.trim();
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        }
    }
    
    // Update each field, hiding empty ones
    updateInfoItem('previewCompanyItem', 'previewCardCompany', card.company);
    updateInfoItem('previewEmailItem', 'previewCardEmail', card.email);
    updateInfoItem('previewPhoneItem', 'previewCardPhone', card.phone);
    updateInfoItem('previewWebsiteItem', 'previewCardWebsite', card.website);
    updateInfoItem('previewDesignationItem', 'previewCardDesignation', card.designation);
    
    // Handle event information section
    const hasEventInfo = card.event_name || card.event_host || card.event_date || card.event_location || card.event_description;
    const eventSection = document.getElementById('previewEventSection');
    
    if (eventSection) {
        if (hasEventInfo) {
            // Show event section and populate fields
            eventSection.style.display = 'block';
            updateInfoItem('previewEventNameItem', 'previewEventName', card.event_name);
            updateInfoItem('previewEventHostItem', 'previewEventHost', card.event_host);
            updateInfoItem('previewEventDateItem', 'previewEventDate', card.event_date);
            updateInfoItem('previewEventLocationItem', 'previewEventLocation', card.event_location);
            updateInfoItem('previewEventDescriptionItem', 'previewEventDescription', card.event_description);
        } else {
            // Hide event section if no event data
            eventSection.style.display = 'none';
        }
    }
    
    console.log('✅ Card info populated for:', card.name || 'Unknown');
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

// View Mode and Approval Status Management
let currentViewMode = 'normal';

// Initialize view mode functionality
function initializeViewMode() {
    console.log('🔄 Initializing view mode functionality');
    
    // Set default view mode
    const manageContent = document.querySelector('.manage-content');
    if (manageContent) {
        manageContent.classList.add('normal-view');
    }
    
    // Add event listeners for view toggle buttons
    const normalViewBtn = document.getElementById('normalViewBtn');
    const reviewerViewBtn = document.getElementById('reviewerViewBtn');
    const galleryViewBtn = document.getElementById('galleryViewBtn');
    
    if (normalViewBtn) {
        normalViewBtn.addEventListener('click', () => switchViewMode('normal'));
    }
    
    if (reviewerViewBtn) {
        reviewerViewBtn.addEventListener('click', () => switchViewMode('reviewer'));
    }
    
    if (galleryViewBtn) {
        galleryViewBtn.addEventListener('click', () => switchViewMode('gallery'));
    }
}

// Switch between normal, reviewer, and gallery view modes
function switchViewMode(mode) {
    console.log(`🔄 Switching to ${mode} view mode`);
    
    currentViewMode = mode;
    const manageContent = document.querySelector('.manage-content');
    const manageLayout = document.querySelector('.manage-layout');
    const galleryView = document.getElementById('galleryView');
    const normalBtn = document.getElementById('normalViewBtn');
    const reviewerBtn = document.getElementById('reviewerViewBtn');
    const galleryBtn = document.getElementById('galleryViewBtn');
    
    if (!manageContent || !normalBtn || !reviewerBtn || !galleryBtn) return;
    
    // Hide/show appropriate views
    if (mode === 'gallery') {
        manageLayout.style.display = 'none';
        galleryView.style.display = 'block';
        initializeGalleryView();
    } else {
        manageLayout.style.display = 'grid';
        galleryView.style.display = 'none';
    }
    
    // Update CSS classes
    manageContent.classList.remove('normal-view', 'reviewer-view', 'gallery-view');
    manageContent.classList.add(`${mode}-view`);
    
    // Update button states
    normalBtn.classList.toggle('active', mode === 'normal');
    reviewerBtn.classList.toggle('active', mode === 'reviewer');
    galleryBtn.classList.toggle('active', mode === 'gallery');
    
    showToast(`Switched to ${mode} view`, 'success');
}

// Gallery View Functions
let currentGalleryCard = null;

function initializeGalleryView() {
    console.log('🖼️ Initializing gallery view');
    
    // Add event listeners to gallery cards
    const galleryCards = document.querySelectorAll('.gallery-card-item');
    galleryCards.forEach(card => {
        card.addEventListener('click', () => selectGalleryCard(card));
    });
    
    // Add event listeners to gallery action buttons
    const galleryEditBtn = document.getElementById('galleryEditBtn');
    const galleryDeleteBtn = document.getElementById('galleryDeleteBtn');
    
    if (galleryEditBtn) {
        galleryEditBtn.addEventListener('click', () => editGalleryCard());
    }
    
    if (galleryDeleteBtn) {
        galleryDeleteBtn.addEventListener('click', () => deleteGalleryCard());
    }
    
    console.log('✅ Gallery view initialized');
}

function selectGalleryCard(cardElement) {
    console.log('🖼️ Selecting gallery card');
    
    // Remove previous selection
    document.querySelectorAll('.gallery-card-item').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to current card
    cardElement.classList.add('selected');
    
    // Parse card data
    const cardData = safelyCallFunction(parseCardData, cardElement);
    if (!cardData) {
        showErrorToast('Error: Could not read card data');
        return;
    }
    
    currentGalleryCard = cardData;
    
    // Populate gallery preview
    populateGalleryPreview(cardData);
}

function populateGalleryPreview(card) {
    console.log('🖼️ Populating gallery preview for:', card.name || 'Unknown');
    
    const previewContent = document.getElementById('galleryPreviewContent');
    const previewLoaded = document.getElementById('galleryPreviewLoaded');
    
    if (!previewContent || !previewLoaded) return;
    
    // Hide placeholder, show loaded content
    previewContent.style.display = 'none';
    previewLoaded.style.display = 'block';
    
    // Set image
    const previewImage = document.getElementById('galleryPreviewImage');
    if (previewImage && card.image_base64) {
        previewImage.src = card.image_base64;
        previewImage.alt = `Business card for ${card.name || 'Unknown'}`;
    }
    
    // Set card name
    const cardName = document.getElementById('galleryCardName');
    if (cardName) {
        cardName.textContent = card.name || 'Unknown Name';
    }
    
    // Helper function to update info items
    function updateGalleryInfoItem(itemId, fieldId, value) {
        const item = document.getElementById(itemId);
        const field = document.getElementById(fieldId);
        
        if (item && field) {
            if (value && value.trim() && value.trim() !== 'N/A') {
                field.textContent = value.trim();
                item.style.display = 'grid';
            } else {
                item.style.display = 'none';
            }
        }
    }
    
    // Update basic information
    updateGalleryInfoItem('galleryCompanyItem', 'galleryCompany', card.company);
    updateGalleryInfoItem('galleryEmailItem', 'galleryEmail', card.email);
    updateGalleryInfoItem('galleryPhoneItem', 'galleryPhone', card.phone);
    updateGalleryInfoItem('galleryWebsiteItem', 'galleryWebsite', card.website);
    updateGalleryInfoItem('galleryCountryItem', 'galleryCountry', card.country);
    updateGalleryInfoItem('galleryDesignationItem', 'galleryDesignation', card.designation);
    
    // Handle event information
    const hasEventInfo = card.event_name || card.event_host || card.event_date || card.event_location || card.event_description;
    const eventSection = document.getElementById('galleryEventSection');
    
    if (eventSection) {
        if (hasEventInfo) {
            eventSection.style.display = 'block';
            updateGalleryInfoItem('galleryEventNameItem', 'galleryEventName', card.event_name);
            updateGalleryInfoItem('galleryEventHostItem', 'galleryEventHost', card.event_host);
            updateGalleryInfoItem('galleryEventDateItem', 'galleryEventDate', card.event_date);
            updateGalleryInfoItem('galleryEventLocationItem', 'galleryEventLocation', card.event_location);
            updateGalleryInfoItem('galleryEventDescriptionItem', 'galleryEventDescription', card.event_description);
        } else {
            eventSection.style.display = 'none';
        }
    }
    
    console.log('✅ Gallery preview populated');
}

function editGalleryCard() {
    if (!currentGalleryCard) {
        showErrorToast('No card selected');
        return;
    }
    
    console.log('✏️ Editing gallery card:', currentGalleryCard.name);
    
    // Switch to normal view and trigger edit
    switchViewMode('normal');
    setTimeout(() => {
        // Find the card in normal view and trigger edit
        const cardElement = document.querySelector(`[data-card-id="${currentGalleryCard.id}"]`);
        if (cardElement) {
            const editBtn = cardElement.querySelector('.edit-card-btn');
            if (editBtn) {
                editBtn.click();
            }
        }
    }, 300);
}

function deleteGalleryCard() {
    if (!currentGalleryCard) {
        showErrorToast('No card selected');
        return;
    }
    
    console.log('🗑️ Deleting gallery card:', currentGalleryCard.name);
    
    const cardName = currentGalleryCard.name || 'Unknown';
    if (confirm(`Are you sure you want to delete the business card for "${cardName}"?`)) {
        fetch(`/api/cards/${currentGalleryCard.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessToast('Card deleted successfully');
                // Reload the page to refresh gallery view
                window.location.reload();
            } else {
                showErrorToast('Failed to delete card: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error deleting card:', error);
            showErrorToast('Error deleting card');
        });
    }
}

// Initialize approval status functionality
function initializeApprovalStatus() {
    console.log('✅ Initializing approval status functionality');
    
    // Add click event listeners to all status indicators
    document.addEventListener('click', function(e) {
        const statusIndicator = e.target.closest('.status-indicator');
        if (statusIndicator) {
            e.preventDefault();
            e.stopPropagation();
            handleStatusIndicatorClick(statusIndicator);
        }
    });
    
    // Load saved approval statuses
    loadAllApprovalStatuses();
}

// Handle status indicator click
function handleStatusIndicatorClick(indicator) {
    const cardId = indicator.closest('.card-approval-status').dataset.cardId;
    const currentStatus = indicator.dataset.status;
    
    console.log(`🎯 Status indicator clicked for card ${cardId}, current status: ${currentStatus}`);
    
    // Cycle through statuses: pending -> approved -> rejected -> issue -> pending
    const statusCycle = ['pending', 'approved', 'rejected', 'issue'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const newStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    
    updateCardApprovalStatus(cardId, newStatus);
}

// Update card approval status
function updateCardApprovalStatus(cardId, status) {
    console.log(`✅ Updating card ${cardId} approval status to: ${status}`);
    
    // Update all status indicators for this card
    const indicators = document.querySelectorAll(`[data-card-id="${cardId}"] .status-indicator`);
    indicators.forEach(indicator => {
        indicator.dataset.status = status;
    });
    
    // Update card visual styling based on approval status
    const cardElements = document.querySelectorAll(`[data-card-id="${cardId}"]`);
    cardElements.forEach(cardElement => {
        if (status === 'approved') {
            cardElement.setAttribute('data-approved', 'true');
        } else {
            cardElement.removeAttribute('data-approved');
        }
    });
    
    // Save status locally
    saveApprovalStatusLocally(cardId, status);
    
    const statusText = {
        'approved': 'Approved ✓ - Ready for sorting',
        'rejected': 'Rejected ✕ - Cannot be sorted', 
        'issue': 'Marked as having issues ⚠️ - Cannot be sorted',
        'pending': 'Set to pending review ⏳ - Cannot be sorted'
    };
    
    showToast(`${statusText[status]}`, status === 'approved' ? 'success' : 'warning');
}

// Save approval status to localStorage
function saveApprovalStatusLocally(cardId, status) {
    const approvalData = JSON.parse(localStorage.getItem('cardApprovalStatus') || '{}');
    approvalData[cardId] = status;
    localStorage.setItem('cardApprovalStatus', JSON.stringify(approvalData));
}

// Load approval status from localStorage
function loadApprovalStatusLocally(cardId) {
    const approvalData = JSON.parse(localStorage.getItem('cardApprovalStatus') || '{}');
    return approvalData[cardId] || 'pending';
}

// Load all saved approval statuses
function loadAllApprovalStatuses() {
    const cards = document.querySelectorAll('.card-item[data-card-id]');
    cards.forEach(card => {
        const cardId = card.dataset.cardId;
        const savedStatus = loadApprovalStatusLocally(cardId);
        
        const indicator = card.querySelector('.status-indicator');
        if (indicator) {
            indicator.dataset.status = savedStatus;
        }
        
        // Set visual styling based on approval status
        if (savedStatus === 'approved') {
            card.setAttribute('data-approved', 'true');
        } else {
            card.removeAttribute('data-approved');
        }
    });
    
    console.log('✅ All approval statuses loaded and visual styling applied');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Add delay to ensure other initialization is complete
    setTimeout(() => {
        initializeViewMode();
        initializeApprovalStatus();
    }, 200);
});

// Make functions globally available
window.initializeViewMode = initializeViewMode;
window.switchViewMode = switchViewMode;
window.updateCardApprovalStatus = updateCardApprovalStatus;

// Add keyboard support for image modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const imageModal = document.getElementById('imageModal');
        if (imageModal && imageModal.classList.contains('show')) {
            closeImageModal();
        }
    }
});

// Image Modal Functions
function openImageModal() {
    const previewImage = document.getElementById('previewImage');
    const modalImage = document.getElementById('modalImage');
    const modalFilename = document.getElementById('modalImageFilename');
    const imageModal = document.getElementById('imageModal');
    
    if (previewImage && modalImage && imageModal) {
        modalImage.src = previewImage.src;
        modalImage.alt = previewImage.alt;
        
        if (modalFilename) {
            modalFilename.textContent = 'Business Card Image';
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

// Country Autocomplete Functionality
function initializeCountryAutocomplete() {
    const countryInput = document.getElementById('editCountry');
    const dropdown = document.getElementById('countryDropdown');
    
    if (!countryInput || !dropdown) return;
    
    let selectedIndex = -1;
    
    // Show dropdown on focus
    countryInput.addEventListener('focus', function() {
        dropdown.style.display = 'block';
        populateCountryDropdown();
    });
    
    // Filter countries on input
    countryInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterCountries(searchTerm);
        selectedIndex = -1;
    });
    
    // Handle keyboard navigation
    countryInput.addEventListener('keydown', function(e) {
        const options = dropdown.querySelectorAll('.country-option:not([style*="display: none"])');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
                updateSelection(options);
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(options);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && options[selectedIndex]) {
                    selectCountry(options[selectedIndex]);
                }
                break;
            case 'Escape':
                dropdown.style.display = 'none';
                selectedIndex = -1;
                break;
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!countryInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
            selectedIndex = -1;
        }
    });
}

function populateCountryDropdown() {
    const dropdown = document.getElementById('countryDropdown');
    dropdown.innerHTML = '';
    
    COUNTRIES.forEach(country => {
        const option = document.createElement('div');
        option.className = 'country-option';
        option.innerHTML = '<span class="country-flag">' + country.flag + '</span><span class="country-name">' + country.name + '</span>';
        option.addEventListener('click', () => selectCountry(option));
        dropdown.appendChild(option);
    });
}

function filterCountries(searchTerm) {
    const dropdown = document.getElementById('countryDropdown');
    const options = dropdown.querySelectorAll('.country-option');
    
    options.forEach(option => {
        const countryName = option.querySelector('.country-name').textContent.toLowerCase();
        if (countryName.includes(searchTerm)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

function updateSelection(options) {
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === selectedIndex);
    });
    
    if (selectedIndex >= 0 && options[selectedIndex]) {
        options[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
}

function selectCountry(option) {
    const countryInput = document.getElementById('editCountry');
    const dropdown = document.getElementById('countryDropdown');
    const countryName = option.querySelector('.country-name').textContent;
    
    countryInput.value = countryName;
    dropdown.style.display = 'none';
    
    const flag = option.querySelector('.country-flag').textContent;
    countryInput.dataset.flag = flag;
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