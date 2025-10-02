// EmailJS Setup for ClearAway UK
// This file contains the EmailJS configuration and form handling

// Initialize EmailJS with your public key
(function() {
    emailjs.init("cQSyErTmi14cOXyvR");
})();

// EmailJS form submission function
async function submitFormViaEmailJS(formData) {
    console.log('EmailJS function called with data:', formData);
    try {
        // Prepare email template parameters
        const templateParams = {
            from_name: formData.name,
            from_postcode: formData.postcode,
            from_contact: formData.contact,
            from_details: formData.details,
            to_email: 'michaelgaylee@gmail.com', // Your email
            reply_to: formData.contact,
            subject: `New Waste Removal Quote Request - ${formData.name} (${formData.postcode})`,
            images_count: formData.images.length,
            images_summary: formData.images.length > 0 ? 
                `Images uploaded: ${formData.images.map(img => img.name).join(', ')}` : 
                'No images uploaded'
        };

        console.log('Template params:', templateParams);

        // Add image data if any images were uploaded
        if (formData.images.length > 0) {
            formData.images.forEach((img, index) => {
                templateParams[`image_${index + 1}_name`] = img.name;
                templateParams[`image_${index + 1}_size`] = `${Math.round(img.base64.length * 0.75 / 1024)}KB`;
                templateParams[`image_${index + 1}_data`] = img.base64;
            });
        }

        console.log('Sending email via EmailJS...');
        
        // Send email using EmailJS
        const response = await emailjs.send(
            'service_e5mrftj', // Your EmailJS service ID
            'template_tcvsili', // Your EmailJS template ID
            templateParams
        );

        console.log('EmailJS response:', response);
        
        if (response.status === 200) {
            console.log('Email sent successfully via EmailJS');
            return { success: true, message: 'Email sent successfully!' };
        } else {
            throw new Error('EmailJS returned non-200 status');
        }
        
    } catch (error) {
        console.error('Error sending email via EmailJS:', error);
        return { success: false, message: 'Failed to send email. Please try again.' };
    }
}

// Alternative: Simple form submission without images (using Formsubmit.co)
async function submitFormSimple(formData) {
    try {
        const response = await fetch('https://formsubmit.co/michaelgaylee@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.name,
                postcode: formData.postcode,
                contact: formData.contact,
                details: formData.details,
                images_count: formData.images.length,
                images_summary: formData.images.length > 0 ? 
                    `Images uploaded: ${formData.images.map(img => img.name).join(', ')}` : 
                    'No images uploaded',
                _subject: `New Waste Removal Quote Request - ${formData.name} (${formData.postcode})`,
                _replyto: formData.contact
            })
        });

        if (response.ok) {
            return { success: true, message: 'Form submitted successfully!' };
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        return { success: false, message: 'Failed to submit form. Please try again.' };
    }
}
