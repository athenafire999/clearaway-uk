// ClearAway UK Website JavaScript
document.addEventListener('DOMContentLoaded', () => {

    // --- NAVIGATION ---
    const pages = document.querySelectorAll('.page-section');
    const navButtons = {
        'page-home': document.getElementById('nav-home'),
        'page-services': document.getElementById('nav-services'),
        'page-how-we-work': document.getElementById('nav-how-we-work'),
        'page-service-area': document.getElementById('nav-service-area'),
        'page-contact': document.getElementById('nav-contact')
    };

    function navigateTo(pageId) {
        pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });
        window.scrollTo(0, 0);
    }

    navButtons['page-home'].addEventListener('click', () => navigateTo('page-home'));
    navButtons['page-services'].addEventListener('click', () => navigateTo('page-services'));
    navButtons['page-how-we-work'].addEventListener('click', () => navigateTo('page-how-we-work'));
    navButtons['page-service-area'].addEventListener('click', () => navigateTo('page-service-area'));
    navButtons['page-contact'].addEventListener('click', () => navigateTo('page-contact'));

    // --- QUOTE FORM HANDLING ---
    const quoteFormContainer = document.getElementById('quote-form-container');
    const quoteResultContainer = document.getElementById('quote-result-container');
    const quoteForm = document.getElementById('quote-form');
    const submitButton = document.getElementById('submit-button');
    const fileInput = document.getElementById('file-upload');
    const imagePreviewList = document.getElementById('image-preview-list');
    const formError = document.getElementById('form-error');
    const resetButton = document.getElementById('reset-button');
    const submittedDataSummary = document.getElementById('submitted-data-summary');

    // Store actual file objects here
    let uploadedFiles = []; 

    // 1. Handle File Selection
    fileInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        let currentErrors = [];
        
        files.forEach(file => {
            // Check duplicates
            if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                return;
            }
            // Check size (5MB limit for email reliability)
            if (file.size > 5 * 1024 * 1024) {
                currentErrors.push(`${file.name} is too large (max 5MB).`);
                return;
            }
            uploadedFiles.push(file);
        });
        
        if (currentErrors.length > 0) showError(currentErrors.join(' '));
        else hideError();

        renderImagePreviews();
        
        // Reset input so same file can be selected again if deleted
        event.target.value = ''; 
    });

    // 2. Render Previews
    function renderImagePreviews() {
        imagePreviewList.innerHTML = '';
        const labelSpan = document.querySelector('label[for="file-upload"] span');
        
        if (uploadedFiles.length > 0) {
            labelSpan.textContent = `${uploadedFiles.length} file(s) selected`;
            
            const list = document.createElement('ul');
            list.className = 'space-y-2';
            
            uploadedFiles.forEach((file, index) => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between text-sm text-gray-700 bg-gray-100 p-2 rounded-lg';
                li.innerHTML = `
                    <span class="truncate">${file.name}</span>
                    <button type="button" class="text-red-500 hover:text-red-700 font-bold ml-2" onclick="removeFile(${index})">
                        ✕
                    </button>
                `;
                list.appendChild(li);
            });
            imagePreviewList.appendChild(list);
        } else {
            labelSpan.textContent = 'Upload files';
        }
    }

    // 3. Remove File Function (needs to be global or attached to window)
    window.removeFile = function(index) {
        uploadedFiles.splice(index, 1);
        renderImagePreviews();
    };

    // 4. Handle Form Submission
    quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        // Change button state
        const originalBtnText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...`;

        // Create FormData
        const formData = new FormData(quoteForm);
        
        // Append the images from our array to the FormData
        uploadedFiles.forEach((file, index) => {
            // We append them as 'attachment1', 'attachment2', etc.
            formData.append(`attachment_${index + 1}`, file);
        });

        try {
            // Send to Formsubmit.co
            // REPLACE 'michaelgaylee@gmail.com' WITH YOUR REAL EMAIL IF DIFFERENT
            const response = await fetch('https://formsubmit.co/michaelgaylee@gmail.com', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showSuccessScreen({
                    name: formData.get('name'),
                    postcode: formData.get('postcode'),
                    contact: formData.get('email'),
                    details: formData.get('message'),
                    imageCount: uploadedFiles.length
                });
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error(error);
            showError("There was a problem sending your quote. Please try again or call us directly.");
            submitButton.disabled = false;
            submitButton.innerHTML = originalBtnText;
        }
    });

    function showSuccessScreen(data) {
        submittedDataSummary.innerHTML = `
            <h3 class="font-bold text-lg text-gray-800">Details Sent:</h3>
            <p><span class="font-semibold">Name:</span> ${data.name}</p>
            <p><span class="font-semibold">Postcode:</span> ${data.postcode}</p>
            <p><span class="font-semibold">Contact:</span> ${data.contact}</p>
            <p><span class="font-semibold">Images:</span> ${data.imageCount} uploaded</p>
        `;
        quoteFormContainer.classList.add('hidden');
        quoteResultContainer.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    function showError(msg) {
        formError.textContent = msg;
        formError.classList.remove('hidden');
    }

    function hideError() {
        formError.classList.add('hidden');
    }

    resetButton.addEventListener('click', () => {
        quoteForm.reset();
        uploadedFiles = [];
        renderImagePreviews();
        submitButton.disabled = false;
        submitButton.innerHTML = 'Get My Quote';
        quoteResultContainer.classList.add('hidden');
        quoteFormContainer.classList.remove('hidden');
    });


    // --- SERVICE AREA PAGE ---
    const serviceAreasData = [
        { name: 'Greater London', areas: ['City of London', 'Westminster', 'Kensington & Chelsea', 'Islington', 'Southwark', 'Lambeth', 'Croydon', 'Bromley', 'Richmond', 'Harrow', 'Ealing', 'Hounslow', 'Sutton', 'Merton'] },
        { name: 'Surrey', areas: ['Guildford', 'Woking', 'Epsom', 'Reigate', 'Redhill', 'Staines-upon-Thames', 'Farnham', 'Camberley', 'Esher', 'Walton-on-Thames'] },
        { name: 'Hampshire', areas: ['Basingstoke', 'Farnborough', 'Alddershot', 'Fleet', 'Winchester', 'Andover', 'Eastleigh'] },
        { name: 'Berkshire', areas: ['Reading', 'Slough', 'Bracknell', 'Maidenhead', 'Wokingham', 'Newbury', 'Windsor'] },
        { name: 'Buckinghamshire', areas: ['Aylesbury', 'High Wycombe', 'Amersham', 'Gerrards Cross', 'Beaconsfield'] },
    ];
    const serviceAreaListContainer = document.getElementById('service-area-list');
    const serviceAreaMap = document.getElementById('service-area-map');
    let expandedCounty = null;
    
    function renderServiceAreaList() {
        const container = document.createElement('div');
        container.className = 'space-y-3';

        serviceAreasData.forEach(county => {
            const isExpanded = expandedCounty === county.name;
            const countyElement = document.createElement('div');
            countyElement.className = 'border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white';
            countyElement.innerHTML = `
                <button 
                    data-county="${county.name}"
                    class="county-toggle-btn w-full flex justify-between items-center p-5 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-expanded="${isExpanded}"
                >
                    <span class="text-lg font-bold text-gray-800">${county.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div class="county-areas ${isExpanded ? '' : 'hidden'} p-5 bg-white border-t border-gray-200">
                    <ul class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-gray-700">
                        ${county.areas.map(area => `<li>${area}</li>`).join('')}
                    </ul>
                </div>
            `;
            container.appendChild(countyElement);
        });
        serviceAreaListContainer.innerHTML = '';
        serviceAreaListContainer.appendChild(container);
    }

    function updateMapHighlight() {
        const counties = serviceAreaMap.querySelectorAll('.county-group');
        counties.forEach(countyEl => {
            const countyName = countyEl.getAttribute('data-county');
            const shape = countyEl.querySelector('.county-shape');
            if (countyName === expandedCounty) {
                shape.classList.remove('fill-emerald-200');
                shape.classList.add('fill-emerald-400');
            } else {
                shape.classList.remove('fill-emerald-400');
                shape.classList.add('fill-emerald-200');
            }
        });
    }

    function toggleCounty(countyName) {
        expandedCounty = expandedCounty === countyName ? null : countyName;
        renderServiceAreaList();
        updateMapHighlight();
    }

    serviceAreaListContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.county-toggle-btn');
        if (button) {
            toggleCounty(button.getAttribute('data-county'));
        }
    });
    
    serviceAreaMap.addEventListener('click', (event) => {
         const countyGroup = event.target.closest('.county-group');
         if(countyGroup) {
            toggleCounty(countyGroup.getAttribute('data-county'));
         }
    });

    // Initial render
    renderServiceAreaList();

});

// Global map functions for inline onclick handlers
let expandedCounty = null;

const serviceAreasData = [
    { name: 'Greater London', areas: ['City of London', 'Westminster', 'Kensington & Chelsea', 'Islington', 'Southwark', 'Lambeth', 'Croydon', 'Bromley', 'Richmond', 'Harrow', 'Ealing', 'Hounslow', 'Sutton', 'Merton'] },
    { name: 'Surrey', areas: ['Guildford', 'Woking', 'Epsom', 'Reigate', 'Redhill', 'Staines-upon-Thames', 'Farnham', 'Camberley', 'Esher', 'Walton-on-Thames'] },
    { name: 'Hampshire', areas: ['Basingstoke', 'Farnborough', 'Alddershot', 'Fleet', 'Winchester', 'Andover', 'Eastleigh'] },
    { name: 'Berkshire', areas: ['Reading', 'Slough', 'Bracknell', 'Maidenhead', 'Wokingham', 'Newbury', 'Windsor'] },
    { name: 'Buckinghamshire', areas: ['Aylesbury', 'High Wycombe', 'Amersham', 'Gerrards Cross', 'Beaconsfield'] },
];

function toggleCounty(countyName) {
    console.log('Toggling county:', countyName);
    expandedCounty = expandedCounty === countyName ? null : countyName;
    renderServiceAreaList();
    updateMapHighlight();
}

function renderServiceAreaList() {
    const serviceAreaListContainer = document.getElementById('service-area-list');
    if (!serviceAreaListContainer) return;
    
    const container = document.createElement('div');
    container.className = 'space-y-3';

    serviceAreasData.forEach(county => {
        const isExpanded = expandedCounty === county.name;
        const countyElement = document.createElement('div');
        countyElement.className = 'border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white';
        countyElement.innerHTML = `
            <button 
                data-county="${county.name}"
                class="county-toggle-btn w-full flex justify-between items-center p-5 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-expanded="${isExpanded}"
                onclick="toggleCounty('${county.name}')"
            >
                <span class="text-lg font-bold text-gray-800">${county.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div class="county-areas ${isExpanded ? '' : 'hidden'} p-5 bg-white border-t border-gray-200">
                <ul class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-gray-700">
                    ${county.areas.map(area => `<li>${area}</li>`).join('')}
                </ul>
            </div>
        `;
        container.appendChild(countyElement);
    });
    serviceAreaListContainer.innerHTML = '';
    serviceAreaListContainer.appendChild(container);
}

function updateMapHighlight() {
    const serviceAreaMap = document.getElementById('service-area-map');
    if (!serviceAreaMap) return;
    
    const counties = serviceAreaMap.querySelectorAll('.county-group');
    counties.forEach(countyEl => {
        const countyName = countyEl.getAttribute('data-county');
        const shape = countyEl.querySelector('.county-shape');
        if (countyName === expandedCounty) {
            shape.style.fill = '#34d399'; // emerald-400
        } else {
            shape.style.fill = '#6ee7b7'; // emerald-300
        }
    });
}

function handleMapClick(event) {
    console.log('Map clicked:', event);
}

// Initialize the service area list when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        renderServiceAreaList();
    }, 500);
});

// Global navigation function for onclick handlers
window.navigateToPage = function(pageId) {
    console.log('Global navigation to:', pageId);
    
    // Hide all pages with stronger CSS
    const pages = document.querySelectorAll('.page-section');
    console.log('Found pages:', pages.length);
    
    pages.forEach(page => {
        page.style.setProperty('display', 'none', 'important');
        page.style.setProperty('visibility', 'hidden', 'important');
        page.style.setProperty('opacity', '0', 'important');
        console.log('Hiding page:', page.id);
    });
    
    // Show the target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.setProperty('display', 'block', 'important');
        targetPage.style.setProperty('visibility', 'visible', 'important');
        targetPage.style.setProperty('opacity', '1', 'important');
        window.scrollTo(0, 0);
        console.log('Successfully navigated to:', pageId);
        console.log('Target page display:', targetPage.style.display);
    } else {
        console.error('Page not found:', pageId);
    }
};

// Test function to verify the logo button works
window.testLogoClick = function() {
    console.log('Logo clicked!');
    navigateToPage('page-home');
};

// Mobile menu toggle function
window.toggleMobileMenu = function() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (mobileMenu.classList.contains('hidden')) {
        // Show menu
        mobileMenu.classList.remove('hidden');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
    } else {
        // Hide menu
        mobileMenu.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
};

    // Initialize mobile menu
    document.addEventListener('DOMContentLoaded', function() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', toggleMobileMenu);
        }
        
        // Add click event listener to submit button as backup
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                console.log('Submit button clicked');
                // Let the form's submit event handle it
            });
        }
    });