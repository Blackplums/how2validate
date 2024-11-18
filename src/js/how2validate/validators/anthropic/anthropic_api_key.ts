/**
 * @module AnthropicAPIKeyValidator
 * @description
 * This module provides functionality to validate an Anthropic API Key by making an API call to the Anthropic service.
 * It checks the validity of the key by sending a test message to the specified endpoint.
 *
 * @requires axios - Used for making HTTP requests to the Anthropic API.
 * @requires ../../utility/tool_utility.js - Utility functions for handling status responses and errors.
 * @requires ../../handler/email_handler.js - Used for sending email reports on validation results.
 */

import { ValidationResult } from "../../utility/interface/validationResult.js";
import {
  handleInactiveStatus,
  handleErrors,
  getUsernameFromEmail,
  handleActiveStatus,
  responseValidation,
} from "../../utility/tool_utility.js";
import { EmailResponse } from "../../utility/interface/EmailResponse.js";
import { SecretStatusMessage } from "../../utility/interface/secretStatusMessage.js";
import { sendEmail } from "../../handler/email_handler.js";
import axios from "axios";

/**
 * @function validateAnthropicAPIKey
 * @description
 * Validates an Anthropic API Key by making a test API call to the Anthropic endpoint.
 * Based on the response, checks the validity of the key, handles errors, and returns an appropriate validation result.
 *
 * If a `report` email is provided, the function also sends an email summarizing the validation results.
 *
 * @async
 * @param {string} provider - The provider name (e.g., "Anthropic") for which the secret is being validated.
 * @param {string} service - The name of the service being validated.
 * @param {string} secret - The Anthropic API Key to validate.
 * @param {boolean} responseFlag - A flag to indicate whether detailed response data should be returned.
 * @param {string} [report] - An optional email address to which a validation report should be sent.
 * @param {boolean} [isBrowser=true] - Indicates if the function is called from a browser environment (default is true).
 *
 * @returns {Promise<ValidationResult>} - A promise that resolves to a `ValidationResult` object containing the validation result.
 *
 * @throws {Error} - If the validation process encounters an issue, it throws an error.
 */
export async function validateAnthropicAPIKey(
  provider: string,
  service: string,
  secret: string,
  responseFlag: boolean,
  report: string,
  isBrowser: boolean = true
): Promise<ValidationResult> {
  // Initialize the response structure
  const validation_response = {} as SecretStatusMessage;

  // Define Anthropic API endpoint and headers for the validation request
  const url = "https://api.anthropic.com/v1/messages";
  const headers = {
    "x-api-key": secret,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  };
  const payload = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello, world" }],
  };

  try {
    // Send a POST request to Anthropic API to validate the key
    const responseData = await axios.post(url, payload, { headers });

    // If the key is valid (successful response), handle active status
    if (responseData.status === 200) {
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
      // Handle inactive key or other statuses
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
          console.info("Validation report sent successfully");
        })
        .catch((error) => {
          console.error("Error sending validation report", error);
        });
    }
  }
}
