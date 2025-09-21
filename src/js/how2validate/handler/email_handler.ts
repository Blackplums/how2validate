// @module email_handler
// @file src/js/how2validate/handler/email_handler.ts
// @description This module is responsible for sending emails using Zoho ZeptoMail.
// The email content is customized with secret validation results, passed as an EmailResponse object.
// It uses environment variables for ZeptoMail configuration and email template details.

// @ts-ignore
import { SendMailClient } from 'zeptomail'; // Import the ZeptoMail client library for sending emails
import dotenv from 'dotenv'; // Import dotenv to load environment variables
import { EmailResponse } from '../utility/interface/EmailResponse'; // Import the EmailResponse interface to structure email response data

// Load environment variables from .env file to make them accessible via process.env
dotenv.config();

// Initialize the SendMailClient using ZeptoMail credentials loaded from environment variables
const client = new SendMailClient({
    url: process.env.ZEPTOMAIL_URL, // URL for the ZeptoMail API
    token: process.env.ZEPTOMAIL_TOKEN, // API token to authenticate requests
});

/**
 * @function sendEmail
 * @description Sends an email using the ZeptoMail client. The email includes the results of a secret validation,
 * passed as an EmailResponse object. The email is customized with the recipient's name, email, and merge information 
 * (like provider, state, service, and response) from the validation results.
 * 
 * @param {string} toEmail - The email address of the recipient.
 * @param {string} toName - The name of the recipient.
 * @param {EmailResponse} emailResponse - An object containing details of the secret validation results (provider, state, service, and response).
 * 
 * @returns {Promise<void>} A promise that resolves when the email is successfully sent or logs an error message if it fails.
 * 
 * @throws {Error} Logs an error message if the email cannot be sent due to a failure in the email service.
 * 
 * @example
 * const response: EmailResponse = {
 *   provider: "AWS",
 *   state: "active",
 *   service: "S3",
 *   response: "Validation passed"
 * };
 * await sendEmail("recipient@example.com", "John Doe", response);
 */
export async function sendEmail(toEmail: string, toName: string, emailResponse: EmailResponse): Promise<void> {
    try {
        // Use the ZeptoMail client to send the email with a mail template and dynamic content.
        const response = await client.sendMail({
            mail_template_key: process.env.TEMPLATE_KEY, // The key to identify the ZeptoMail email template
            from: {
                address: process.env.FROM_EMAIL, // Sender's email address (from the environment variables)
                name: process.env.FROM_NAME, // Sender's name (from the environment variables)
            },
            to: [
                {
                    email_address: {
                        address: toEmail, // Recipient's email address
                        name: toName, // Recipient's name
                    },
                },
            ],
            // Merge information (dynamic data) into the email template for customized content
            merge_info: {
                secret_provider: emailResponse.provider, // Secret provider (e.g., AWS, GCP)
                secret_state: emailResponse.state, // State of the secret (e.g., active, inactive)
                secret_service: emailResponse.service, // Name of the service (e.g., S3, EC2)
                secret_report: emailResponse.response // Validation result (e.g., "Validation passed")
            },
            subject: "How2Validate Secret Validation Report" // Subject line of the email
        });
    } catch (error) {
        // Log any errors that occur during the email-sending process
        console.error('Error sending report email:', error);
    }
}
