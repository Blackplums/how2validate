/**
 * @module SnykAuthKeyValidator
 * @description
 * This module provides functionality to validate a Snyk Auth Key by making an API call to the Snyk service.
 * It returns a validation status, processes the response from the API, and optionally sends an email report with the results.
 * 
 * This module depends on various utilities for handling configuration, logging, and secret statuses.
 * 
 * @requires axios - Used for making HTTP requests to the Snyk API.
 * @requires ../../utility/tool_utility.js - Utility functions for handling status responses and errors.
 * @requires ../../handler/email_handler.js - Used for sending email reports on validation results.
 */

import { ValidationResult } from "../../utility/interface/validationResult.js"; // Interface for validation results
import { 
  handleInactiveStatus, 
  handleErrors, 
  getUsernameFromEmail, 
  handleActiveStatus, 
  responseValidation 
} from "../../utility/tool_utility.js"; // Utility functions for handling statuses and errors
import { EmailResponse } from "../../utility/interface/EmailResponse.js"; // Interface for email response structure
import { SecretStatusMessage } from "../../utility/interface/secretStatusMessage.js"; // Interface for secret status messages
import { sendEmail } from "../../handler/email_handler.js"; // Function to send email using Zoho ZeptoMail
import axios from "axios"; // Axios for making API requests

/**
 * @function validateSnykAuthKey
 * @description
 * This function validates a Snyk authentication key by making an API call to the Snyk API.
 * Based on the response from Snyk, it checks the validity of the token, handles errors, and 
 * returns an appropriate validation result.
 * 
 * If a `report` email is provided, the function also sends an email summarizing the validation results.
 * 
 * @async
 * @param {string} provider - The provider name (e.g., "Snyk") for which the secret is being validated.
 * @param {string} service - The name of the service being validated.
 * @param {string} secret - The Snyk authentication token or secret to validate.
 * @param {boolean} responseFlag - A flag to indicate whether detailed response data should be returned.
 * @param {string} [report] - An optional email address to which a validation report should be sent.
 * @param {boolean} [isBrowser=true] - Indicates if the function is called from a browser environment (default is false).
 * 
 * @returns {Promise<ValidationResult>} - A promise that resolves to a `ValidationResult` object containing the validation result.
 * 
 * @throws {Error} - If the validation process encounters an issue, it throws an error.
 * 
 * @example
 * const validation = await validateSnykAuthKey("Snyk", "snyk_auth_key", "your-snyk-token", true, "user@example.com");
 * console.log(validation);
 */
export async function validateSnykAuthKey(
  provider: string,
  service: string,
  secret: string,
  responseFlag: boolean,
  report: string,
  isBrowser: boolean = true
): Promise<ValidationResult> {
  // Initialize the response structure
  const validation_response = {} as SecretStatusMessage;

  // Define Snyk API endpoint for checking user authentication
  const url = "https://snyk.io/api/v1/user";
  const nocacheHeaders = { "Cache-Control": "no-cache" }; // Avoid cache when making the request
  const headers = { Authorization: `token ${secret}` }; // Attach the Snyk authentication token in the request headers

  try {
    // Send a GET request to Snyk API to validate the token
    const responseData = await axios.get(url, {
      headers: { ...nocacheHeaders, ...headers },
    });

    // If the token is valid (successful response), handle active status
    if (responseData.status) {
      const activeResponse = handleActiveStatus(
        provider,
        service,
        responseData,
        responseFlag,
        report,
        isBrowser
      );

      validation_response.state = activeResponse.data?.validate.state!;
      validation_response.message = activeResponse.data?.validate.message!;
      validation_response.response = activeResponse.data?.validate.response!;

      // Return the formatted validation result
      return responseValidation(activeResponse, responseFlag);
    } else {
      // Handle inactive token or other statuses
      const inactiveResponse = handleInactiveStatus(
        provider,
        service,
        responseFlag,
        responseData.data,
        report,
        isBrowser
      );

      validation_response.state = inactiveResponse.data?.validate.state!;
      validation_response.message = inactiveResponse.data?.validate.message!;
      validation_response.response = inactiveResponse.data?.validate.response!;

      // Return the formatted validation result
      return responseValidation(inactiveResponse, responseFlag);
    }
  } catch (error) {
    // Handle errors in the validation process
    const errResponse = handleErrors(
      provider, 
      service, 
      responseFlag, 
      report, 
      error, 
      isBrowser
    );

    validation_response.state = errResponse.data?.validate.state!;
    validation_response.message = errResponse.data?.validate.message!;
    validation_response.response = errResponse.data?.validate.response!;

    // Return the error response as the validation result
    return responseValidation(errResponse, responseFlag);
  } finally {
    // If a report email is provided, send the validation result via email
    if (report) {
      const emailResponse: EmailResponse = {
        provider: provider,
        service: service,
        state: validation_response.state,
        message: validation_response.message,
        response: validation_response.response,
      };

      // Send the email and log success or failure
      sendEmail(report, getUsernameFromEmail(report), emailResponse)
        .then(() => {
          console.info('Validation report sent successfully');
        })
        .catch((error) => {
          console.error('Error sending validation report', error);
        });
    }
  }
}
