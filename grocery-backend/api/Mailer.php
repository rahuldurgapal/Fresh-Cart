<?php
class Mailer {
    
    /**
     * Send an order confirmation email to the customer.
     * Note: This is an architectural stub for production deployment.
     * To activate live emails, replace the standard mail() function below 
     * with PHPMailer & SMTP credentials (e.g. Gmail App Passwords, SendGrid).
     */
    public static function sendOrderConfirmation($to_email, $customer_name, $order_id, $total_amount) {
        $subject = "Order Placed Successfully - FreshCart #ORD-$order_id";
        
        $message = "
        <html>
        <head>
        <title>Order Confirmation</title>
        </head>
        <body>
        <p>Hi $customer_name,</p>
        <p>Thank you for shopping with FreshCart! Your order <b>#ORD-$order_id</b> has been received and is currently being processed.</p>
        <p><b>Total Amount:</b> ₹" . number_format($total_amount, 2) . "</p>
        <br>
        <p>You can track the live status of your delivery in the 'My Orders' section of the application.</p>
        <p>Regards,<br>The FreshCart Team</p>
        </body>
        </html>
        ";

        // Always set content-type when sending HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: noreply@freshcart-app.com' . "\r\n";

        // In a real environment, uncomment the mail() function or integrate PHPMailer here.
        // mail($to_email, $subject, $message, $headers);
        
        // Mock logging for development purposes
        error_log("MAILER_MOCK: Sent order $order_id confirmation to $to_email.");
        
        return true;
    }
}
?>
