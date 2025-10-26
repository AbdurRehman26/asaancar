<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - AsaanCar</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f8fafc;
            color: #1f2937;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #f3e8f2;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #7e246c;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
            margin-bottom: 30px;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #7e246c 0%, #6a1f5c 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(126, 36, 108, 0.3);
            transition: all 0.2s ease;
            margin-bottom: 30px;
        }
        .verify-button:hover {
            background: linear-gradient(135deg, #6a1f5c 0%, #5a1a4f 100%);
            box-shadow: 0 6px 8px -1px rgba(126, 36, 108, 0.4);
            transform: translateY(-1px);
            color: #ffffff !important;
        }
        .security-note {
            background-color: #f3f4f6;
            border-left: 4px solid #7e246c;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 30px;
        }
        .security-note h3 {
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 10px 0;
        }
        .security-note p {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
            margin: 0 0 10px 0;
        }
        .footer a {
            color: #7e246c;
            text-decoration: none;
            font-weight: 500;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #6b7280;
            text-decoration: none;
            font-size: 14px;
        }
        .social-links a:hover {
            color: #7e246c;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .verify-button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <img src="{{ url('images/car-logo.png') }}" alt="AsaanCar Logo" class="logo">
            <h1>Welcome to AsaanCar</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="greeting">
                Hello there!
            </div>

            <div class="message">
                Thank you for signing up with AsaanCar - Pakistan's trusted car rental service. 
                We're excited to have you on board!
            </div>

            <div class="message">
                To complete your registration and start exploring our wide range of rental cars, 
                please verify your email address by clicking the button below:
            </div>

            <div style="text-align: center;">
                <a href="{{ $url }}" class="verify-button">
                    Verify Email Address
                </a>
            </div>

            <div class="security-note">
                <h3>🔒 Security Information</h3>
                <p>
                    This verification link will expire in 60 minutes for your security. 
                    If you didn't create an account with AsaanCar, you can safely ignore this email.
                </p>
            </div>

            <div class="message">
                <strong>What's next?</strong><br>
                Once verified, you'll be able to:
            </div>

            <ul style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; padding-left: 20px;">
                <li>Browse our extensive collection of rental cars</li>
                <li>Book cars for your travel needs</li>
                <li>Manage your bookings and reservations</li>
                <li>Access exclusive deals and offers</li>
            </ul>

            <div class="message">
                If you're having trouble clicking the button, you can also copy and paste this link into your browser:
            </div>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 14px; color: #4b5563;">
                {{ $url }}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                <strong>AsaanCar</strong> - Your trusted partner for seamless car rental experiences
            </p>
            <p>
                Currently available in Karachi. We'll be expanding to other cities soon!
            </p>
            
            <div class="divider"></div>
            
            <p>
                Need help? Contact us at 
                <a href="mailto:support@asaancar.com">support@asaancar.com</a>
            </p>
            
            <div class="social-links">
                <a href="#">Website</a>
                <a href="#">Support</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 12px; color: #9ca3af;">
                © {{ date('Y') }} AsaanCar. All rights reserved.<br>
                This email was sent to your email address.
            </p>
        </div>
    </div>
</body>
</html>
