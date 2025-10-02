// ClearAway UK Form Handler - Multiple submission methods for reliability

// Primary: Formsubmit.co form submission function
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
        
        const response = await fetch('https://formsubmit.co/el/ramito', {
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

// Backup: Simple email using mailto link
function submitFormViaMailto(formData) {
    console.log('Creating mailto link as backup...');
    
    let emailBody = `New Waste Removal Quote Request\n\n`;
    emailBody += `Name: ${formData.name}\n`;
    emailBody += `Postcode: ${formData.postcode}\n`;
    emailBody += `Contact: ${formData.contact}\n`;
    emailBody += `Details: ${formData.details}\n\n`;
    
    if (formData.images.length > 0) {
        emailBody += `Images uploaded: ${formData.images.map(img => img.name).join(', ')}\n`;
        emailBody += `Note: Images are attached to this form submission.\n`;
    } else {
        emailBody += `No images uploaded.\n`;
    }
    
    const subject = `New Waste Removal Quote Request - ${formData.name} (${formData.postcode})`;
    const mailtoLink = `mailto:michaelgaylee@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open mailto link
    window.open(mailtoLink, '_blank');
    
    return { success: true, message: 'Email client opened - please send the email manually.' };
}

// ClearAway UK Form Handler - Using Formsubmit.co for all submissions
// This ensures images are always included in emails
