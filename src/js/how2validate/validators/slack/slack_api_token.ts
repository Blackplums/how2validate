/**
 * @module SlackApiTokenValidator
 * @description
 * This module provides functionality to validate a Slack API token by making an API call to the Slack service.
 * It processes the response from the API, checks if the token is valid, and optionally sends an email report with the validation results.
 *
 * The module depends on various utilities for handling configuration, logging, and secret statuses.
 *
 * @requires axios - Used for making HTTP requests to the Slack API.
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
 * @function validateSlackApiToken
 * @description
 * This function validates a Slack API token by making an API call to the Slack API.
 * Based on the response from Slack, it checks the validity of the token, handles errors, and 
 * returns an appropriate validation result.
 * 
 * If a `report` email is provided, the function also sends an email summarizing the validation results.
 * 
 * @async
 * @param {string} provider - The provider name (e.g., "Slack") for which the secret is being validated.
 * @param {string} service - The name of the service being validated.
 * @param {string} secret - The Slack API token or secret to validate.
 * @param {boolean} responseFlag - A flag to indicate whether detailed response data should be returned.
 * @param {string} [report] - An optional email address to which a validation report should be sent.
 * @param {boolean} [isBrowser=true] - Indicates if the function is called from a browser environment (default is false).
 * 
 * @returns {Promise<ValidationResult>} - A promise that resolves to a `ValidationResult` object containing the validation result.
 * 
 * @throws {Error} - If the validation process encounters an issue, it throws an error.
 * 
 * @example
 * const validation = await validateSlackApiToken("Slack", "slack_api_token", "your-slack-token", true, "user@example.com");
 * console.log(validation);
 */
export async function validateSlackApiToken(
  provider: string,
  service: string,
  secret: string,
  responseFlag: boolean,
  report: string,
  isBrowser: boolean = true
): Promise<ValidationResult> {
  // Initialize the response structure
  const validationResponse = {} as SecretStatusMessage;

  // Define Slack API endpoint for checking token authentication
  const url = "https://slack.com/api/auth.test?pretty=1"; // Slack API endpoint to validate the token
  const nocacheHeaders = { "Cache-Control": "no-cache" }; // Avoid cache when making the request
  const headers = { Authorization: `Bearer ${secret}` }; // Attach the Slack authentication token in the request headers

  try {
    // Send a GET request to Slack API to validate the token
    const responseData = await axios.get(url, {
      headers: { ...nocacheHeaders, ...headers },
    });

    // If the token is valid (successful response), handle active status
    if (responseData.status === 200) {
      const activeResponse = handleActiveStatus(
        provider,
        service,
        responseData,
        responseFlag,
        report,
        isBrowser
      );

      validationResponse.state = activeResponse.data?.validate.state!;
      validationResponse.message = activeResponse.data?.validate.message!;
      validationResponse.response = activeResponse.data?.validate.response!;

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

      validationResponse.state = inactiveResponse.data?.validate.state!;
      validationResponse.message = inactiveResponse.data?.validate.message!;
      validationResponse.response = inactiveResponse.data?.validate.response!;

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

    validationResponse.state = errResponse.data?.validate.state!;
    validationResponse.message = errResponse.data?.validate.message!;
    validationResponse.response = errResponse.data?.validate.response!;

    // Return the error response as the validation result
    return responseValidation(errResponse, responseFlag);
  } finally {
    // If a report email is provided, send the validation result via email
    if (report) {
      const emailResponse: EmailResponse = {
        provider: provider,
        service: service,
        state: validationResponse.state,
        message: validationResponse.message,
        response: validationResponse.response,
      };

      // Send the email and log success or failure
      sendEmail(report, getUsernameFromEmail(report), emailResponse)
        .then(() => {
          console.info("Validation report sent successfully");
        })
        .catch((error) => {
          console.error("Error sending validation report", error);
        });
    }
  }
}
