// EmailJS Setup for ClearAway UK
// This file contains the EmailJS configuration and form handling

// Initialize EmailJS with your public key
(function() {
    emailjs.init("cQSyErTmi14cOXyvR");
    console.log('EmailJS initialized with public key: cQSyErTmi14cOXyvR');
})();

// Test function to verify EmailJS is working
function testEmailJS() {
    console.log('Testing EmailJS...');
    const testParams = {
        from_name: 'Test User',
        from_postcode: 'TEST123',
        from_contact: 'test@example.com',
        from_details: 'This is a test message',
        to_email: 'michaelgaylee@gmail.com',
        reply_to: 'test@example.com',
        subject: 'Test Email from ClearAway UK',
        images_count: 0,
        images_summary: 'No images uploaded'
    };
    
    console.log('Test params size:', JSON.stringify(testParams).length, 'bytes');
    
    emailjs.send('service_e5mrftj', 'template_tcvsili', testParams)
        .then(function(response) {
            console.log('EmailJS test successful:', response);
        })
        .catch(function(error) {
            console.error('EmailJS test failed:', error);
        });
}

// Formsubmit.co form submission function (handles images perfectly)
async function submitFormViaFormsubmit(formData) {
    console.log('Formsubmit.co function called with data:', formData);
    try {
        console.log('Submitting form via Formsubmit.co...');
        
        // Create FormData for Formsubmit.co
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('postcode', formData.postcode);
        formDataToSend.append('contact', formData.contact);
        formDataToSend.append('details', formData.details);
        formDataToSend.append('_subject', `New Waste Removal Quote Request - ${formData.name} (${formData.postcode})`);
        formDataToSend.append('_replyto', formData.contact);
        formDataToSend.append('_next', 'https://athenafire999.github.io/clearaway-uk/');
        
        // Add images as base64 data (Formsubmit.co handles this perfectly)
        if (formData.images.length > 0) {
            formData.images.forEach((img, index) => {
                formDataToSend.append(`image_${index + 1}_name`, img.name);
                formDataToSend.append(`image_${index + 1}_data`, `data:${img.mimeType};base64,${img.base64}`);
            });
            
            // Add images summary
            formDataToSend.append('images_summary', `Images uploaded: ${formData.images.map(img => img.name).join(', ')}`);
        } else {
            formDataToSend.append('images_summary', 'No images uploaded');
        }
        
        console.log('Sending form data to Formsubmit.co...');
        
        const response = await fetch('https://formsubmit.co/michaelgaylee@gmail.com', {
            method: 'POST',
            body: formDataToSend
        });

        console.log('Formsubmit.co response:', response);
        
        if (response.ok) {
            console.log('Form submitted successfully via Formsubmit.co');
            return { success: true, message: 'Email sent successfully!' };
        } else {
            throw new Error('Formsubmit.co submission failed');
        }
        
    } catch (error) {
        console.error('Error submitting form via Formsubmit.co:', error);
        return { success: false, message: 'Failed to send email. Please try again.' };
    }
}

// ClearAway UK Form Handler - Using Formsubmit.co for all submissions
// This ensures images are always included in emails
