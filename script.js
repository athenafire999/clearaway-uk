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

    // --- QUOTE FORM ---
    const quoteFormContainer = document.getElementById('quote-form-container');
    const quoteResultContainer = document.getElementById('quote-result-container');
    const quoteForm = document.getElementById('quote-form');
    const submitButton = document.getElementById('submit-button');
    const fileInput = document.getElementById('file-upload');
    const imagePreviewList = document.getElementById('image-preview-list');
    const formError = document.getElementById('form-error');
    const resetButton = document.getElementById('reset-button');
    const submittedDataSummary = document.getElementById('submitted-data-summary');
    
    let uploadedImages = []; // Array to store { base64, mimeType, name }

    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (!files) return;

        let currentErrors = [];
        const newImagesPromises = [];
        
        Array.from(files).forEach(file => {
            if (uploadedImages.some(img => img.name === file.name)) {
                return; // Skip already added files
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                currentErrors.push(`'${file.name}' is too large (max 10MB).`);
                return;
            }

            const promise = new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result?.toString().split(',')[1] || null;
                    resolve({ base64: base64String, mimeType: file.type, name: file.name });
                };
                reader.onerror = (error) => reject(`Failed to read file: ${file.name}`);
                reader.readAsDataURL(file);
            });
            newImagesPromises.push(promise);
        });
        
        if (currentErrors.length > 0) {
            showError(currentErrors.join(' '));
        } else {
            hideError();
        }

        Promise.all(newImagesPromises)
            .then(resolvedImages => {
                uploadedImages = [...uploadedImages, ...resolvedImages];
                renderImagePreviews();
            })
            .catch(err => {
                showError(typeof err === 'string' ? err : 'An unknown error occurred during file processing.');
            });
        
        // Reset file input to allow re-uploading the same file
        event.target.value = '';
    });

    function updateUploadButtonText() {
        const uploadLabel = document.querySelector('label[for="file-upload"] span');
        if (uploadedImages.length > 0) {
            uploadLabel.textContent = `${uploadedImages.length} file${uploadedImages.length > 1 ? 's' : ''} selected`;
        } else {
            uploadLabel.textContent = 'Upload files';
        }
    }

    function renderImagePreviews() {
        imagePreviewList.innerHTML = '';
        updateUploadButtonText(); // Update button text
        
        if(uploadedImages.length > 0) {
          const header = document.createElement('h3');
          header.className = 'text-sm font-medium text-gray-800';
          header.textContent = 'Selected files:';
          const list = document.createElement('ul');
          list.className = 'space-y-2';
          
          uploadedImages.forEach((image, index) => {
              const listItem = document.createElement('li');
              listItem.className = 'flex items-center justify-between text-sm text-gray-700 bg-gray-100 p-2 rounded-lg border border-gray-200';
              listItem.innerHTML = `
                  <span class="truncate flex-grow">${image.name}</span>
                  <button type="button" data-index="${index}" class="remove-image-btn ml-4 flex-shrink-0 text-red-600 hover:text-red-800 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded" aria-label="Remove ${image.name}">
                      Remove
                  </button>
              `;
              list.appendChild(listItem);
          });

          imagePreviewList.appendChild(header);
          imagePreviewList.appendChild(list);
        }
    }

    imagePreviewList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-image-btn')) {
            const indexToRemove = parseInt(event.target.getAttribute('data-index'), 10);
            uploadedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
            renderImagePreviews();
        }
    });
    
    function showError(message) {
        formError.textContent = message;
        formError.classList.remove('hidden');
    }

    function hideError() {
        formError.classList.add('hidden');
    }

    quoteForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Form submit event triggered');
        
        const name = document.getElementById('name').value;
        const postcode = document.getElementById('postcode').value;
        const contact = document.getElementById('contact').value;
        const details = document.getElementById('details').value;

        console.log('Form data:', { name, postcode, contact, details, imagesCount: uploadedImages.length });

        if (!name || !postcode || !contact || !details) {
            showError('Please fill in all required fields (Name, Postcode, Contact, and Details).');
            return;
        }
        
        // Photos are optional, but if none uploaded, show a warning
        if (uploadedImages.length === 0) {
            console.log('No photos uploaded, but continuing with form submission');
        }
        
        hideError();
        setSubmitting(true);

        // Add images as individual fields for better email formatting
        uploadedImages.forEach((img, index) => {
            const imageField = document.createElement('input');
            imageField.type = 'hidden';
            imageField.name = `image_${index + 1}_name`;
            imageField.value = img.name;
            quoteForm.appendChild(imageField);
            
            const imageSize = document.createElement('input');
            imageSize.type = 'hidden';
            imageSize.name = `image_${index + 1}_size`;
            imageSize.value = `${Math.round(img.base64.length * 0.75 / 1024)}KB`;
            quoteForm.appendChild(imageSize);
        });
        
        // Add images summary
        const imagesSummary = document.createElement('input');
        imagesSummary.type = 'hidden';
        imagesSummary.name = 'images_summary';
        imagesSummary.value = uploadedImages.length > 0 ? 
            `Images uploaded: ${uploadedImages.map(img => img.name).join(', ')}` : 
            'No images uploaded';
        quoteForm.appendChild(imagesSummary);
        
        // Add HTML formatted images for email
        if (uploadedImages.length > 0) {
            const imagesHtml = document.createElement('input');
            imagesHtml.type = 'hidden';
            imagesHtml.name = 'images_html';
            
            let htmlContent = '<h3>Uploaded Images:</h3>';
            uploadedImages.forEach((img, index) => {
                htmlContent += `
                    <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                        <h4>Image ${index + 1}: ${img.name}</h4>
                        <img src="data:${img.mimeType};base64,${img.base64}" 
                             style="max-width: 300px; max-height: 300px; border: 1px solid #ccc;" 
                             alt="${img.name}" />
                        <p><strong>File:</strong> ${img.name}</p>
                        <p><strong>Size:</strong> ${Math.round(img.base64.length * 0.75 / 1024)}KB</p>
                    </div>
                `;
            });
            
            imagesHtml.value = htmlContent;
            quoteForm.appendChild(imagesHtml);
        }
        
        // Add a hidden input for the subject
        const subjectInput = document.createElement('input');
        subjectInput.type = 'hidden';
        subjectInput.name = '_subject';
        subjectInput.value = `New Waste Removal Quote Request - ${name} (${postcode})`;
        quoteForm.appendChild(subjectInput);
        
        // Add a hidden input for the reply-to email
        const replyToInput = document.createElement('input');
        replyToInput.type = 'hidden';
        replyToInput.name = '_replyto';
        replyToInput.value = contact;
        quoteForm.appendChild(replyToInput);
        
        // Add a note about images
        const imageNoteInput = document.createElement('input');
        imageNoteInput.type = 'hidden';
        imageNoteInput.name = 'image_note';
        imageNoteInput.value = uploadedImages.length > 0 ? 
            'Note: Image files are included as base64 data in this form submission. You can view them in your Formspree dashboard.' : 
            'No images were uploaded with this request.';
        quoteForm.appendChild(imageNoteInput);
        
        // Show success message and let form submit naturally
        setTimeout(() => {
            console.log('Showing success screen and submitting form');
            console.log('Form action URL:', quoteForm.action);
            console.log('Form method:', quoteForm.method);
            
            showSuccessScreen({ name, postcode, contact, details, images: uploadedImages });
            setSubmitting(false);
            
            // Submit the form to Formspree using fetch
            console.log('Submitting form to Formspree...');
            
            // Create FormData
            const formData = new FormData();
            
            // Add basic fields
            formData.append('name', name);
            formData.append('postcode', postcode);
            formData.append('contact', contact);
            formData.append('details', details);
            formData.append('_subject', `New Waste Removal Quote Request - ${name} (${postcode})`);
            formData.append('_replyto', contact);
            
            // Add image information
            uploadedImages.forEach((img, index) => {
                formData.append(`image_${index + 1}_name`, img.name);
                formData.append(`image_${index + 1}_size`, `${Math.round(img.base64.length * 0.75 / 1024)}KB`);
            });
            
            // Add images summary
            formData.append('images_summary', uploadedImages.length > 0 ? 
                `Images uploaded: ${uploadedImages.map(img => img.name).join(', ')}` : 
                'No images uploaded');
            
            // Add detailed image information
            if (uploadedImages.length > 0) {
                let imageDetails = '=== UPLOADED IMAGES ===\n\n';
                uploadedImages.forEach((img, index) => {
                    imageDetails += `Image ${index + 1}:\n`;
                    imageDetails += `- Filename: ${img.name}\n`;
                    imageDetails += `- Type: ${img.mimeType}\n`;
                    imageDetails += `- Size: ${Math.round(img.base64.length * 0.75 / 1024)}KB\n`;
                    imageDetails += `- Base64 Data: data:${img.mimeType};base64,${img.base64.substring(0, 100)}...\n\n`;
                });
                formData.append('image_details', imageDetails);
            }
            
            // Submit to Formspree
            fetch('https://formspree.io/f/xgvnegba', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                console.log('Form submitted successfully!');
                console.log('Response status:', response.status);
                if (response.ok) {
                    console.log('Formspree accepted the submission');
                } else {
                    console.error('Formspree rejected the submission:', response.status);
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('There was an error submitting the form. Please try again.');
            });
        }, 1000);
    });
    
    function setSubmitting(isSubmitting) {
        submitButton.disabled = isSubmitting;
        if (isSubmitting) {
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
            `;
        } else {
            submitButton.innerHTML = 'Get My Quote';
        }
    }
    
    function showSuccessScreen(formData) {
        submittedDataSummary.innerHTML = `
          <h3 class="font-bold text-lg text-gray-800">Your Submitted Details:</h3>
          <p><span class="font-semibold">Name:</span> ${formData.name || 'N/A'}</p>
          <p><span class="font-semibold">Postcode:</span> ${formData.postcode}</p>
          <p><span class="font-semibold">Contact:</span> ${formData.contact}</p>
          <p><span class="font-semibold">Details:</span> ${formData.details}</p>
          <p><span class="font-semibold">Images Uploaded:</span> ${formData.images.length}</p>
        `;
        document.getElementById('hero-section').classList.add('hidden');
        quoteFormContainer.classList.add('hidden');
        quoteResultContainer.classList.remove('hidden');
    }

    resetButton.addEventListener('click', () => {
        quoteForm.reset();
        uploadedImages = [];
        renderImagePreviews();
        hideError();
        document.getElementById('hero-section').classList.remove('hidden');
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