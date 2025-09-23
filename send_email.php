<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$postcode = isset($_POST['postcode']) ? trim($_POST['postcode']) : '';
$contact = isset($_POST['contact']) ? trim($_POST['contact']) : '';
$details = isset($_POST['details']) ? trim($_POST['details']) : '';
$images = isset($_POST['images']) ? $_POST['images'] : [];

// Validate required fields
if (empty($name) || empty($postcode) || empty($contact) || empty($details)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit;
}

// Email configuration
$to = 'michaelgaylee@gmail.com'; // Your personal email
$subject = 'New Waste Removal Quote Request - ClearAway UK';
$from = 'noreply@clear-away.co.uk'; // Use your domain email

// Create email content
$message = "
<html>
<head>
    <title>New Quote Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #10b981; }
        .value { margin-top: 5px; }
        .images { margin-top: 20px; }
        .image { margin: 10px 0; text-align: center; }
        img { max-width: 300px; height: auto; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>New Waste Removal Quote Request</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>Name:</div>
                <div class='value'>" . htmlspecialchars($name) . "</div>
            </div>
            <div class='field'>
                <div class='label'>Postcode:</div>
                <div class='value'>" . htmlspecialchars($postcode) . "</div>
            </div>
            <div class='field'>
                <div class='label'>Contact (Email/Phone):</div>
                <div class='value'>" . htmlspecialchars($contact) . "</div>
            </div>
            <div class='field'>
                <div class='label'>Details:</div>
                <div class='value'>" . nl2br(htmlspecialchars($details)) . "</div>
            </div>
            <div class='field'>
                <div class='label'>Number of Images:</div>
                <div class='value'>" . count($images) . "</div>
            </div>
        </div>
    </div>
</body>
</html>
";

// Add images to email if any
if (!empty($images) && is_array($images)) {
    $message .= "<div class='images'>";
    foreach ($images as $index => $imageData) {
        if (isset($imageData['base64']) && isset($imageData['mimeType']) && isset($imageData['name'])) {
            $message .= "<div class='image'>";
            $message .= "<p><strong>" . htmlspecialchars($imageData['name']) . "</strong></p>";
            $message .= "<img src='data:" . htmlspecialchars($imageData['mimeType']) . ";base64," . htmlspecialchars($imageData['base64']) . "' alt='Waste Photo " . ($index + 1) . "'>";
            $message .= "</div>";
        }
    }
    $message .= "</div>";
}

// Email headers
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: " . $from . "\r\n";
$headers .= "Reply-To: " . htmlspecialchars($contact) . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Quote request sent successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send email. Please try again.']);
}
?>

