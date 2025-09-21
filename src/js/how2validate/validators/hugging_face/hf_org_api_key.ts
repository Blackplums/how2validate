/**
 * @module HFOrgApiKeyValidator
 * @description
 * This module provides functionality to validate a Hugging Face user access token by making an API call to the Hugging Face service.
 * It processes the response, checks token validity, and optionally sends an email report with the validation results.
 *
 * The module depends on various utilities for handling configuration, logging, and secret statuses.
 *
 * @requires axios - Used for making HTTP requests to the Hugging Face API.
 * @requires ../../utility/tool_utility.js - Utility functions for handling status responses and errors.
 * @requires ../../handler/email_handler.js - Used for sending email reports on validation results.
 */

import { ValidationResult } from "../../utility/interface/validationResult.js";
import {
  handleInactiveStatus,
  handleErrors,
  handleActiveStatus,
  responseValidation,
  getUsernameFromEmail,
} from "../../utility/tool_utility.js";
import { EmailResponse } from "../../utility/interface/EmailResponse.js";
import { SecretStatusMessage } from "../../utility/interface/secretStatusMessage.js";
import { sendEmail } from "../../handler/email_handler.js";
import axios from "axios";

/**
 * @function validateHFOrgApiKey
 * @description
 * Validates a Hugging Face user access token by making an API call to the Hugging Face API.
 * Based on the response, it checks token validity, handles errors, and returns an appropriate validation result.
 * 
 * Optionally sends an email summarizing the validation results if a `report` email is provided.
 * 
 * @async
 * @param {string} provider - The provider name (e.g., "Hugging Face") for which the secret is being validated.
 * @param {string} service - The name of the service being validated.
 * @param {string} secret - The Hugging Face user access token to validate.
 * @param {boolean} responseFlag - Indicates whether detailed response data should be returned.
 * @param {string} [report] - An optional email address for receiving a validation report.
 * @param {boolean} [isBrowser=true] - Indicates if the function is called from a browser environment (default is false).
 * 
 * @returns {Promise<ValidationResult>} - A promise that resolves to a `ValidationResult` object containing the validation result.
 * 
 * @throws {Error} - If the validation process encounters an issue, it throws an error.
 */
export async function validateHFOrgApiKey(
  provider: string,
  service: string,
  secret: string,
  responseFlag: boolean,
  report: string,
  isBrowser: boolean = true
): Promise<ValidationResult> {
  // Initialize the response structure
  const validation_response = {} as SecretStatusMessage;

  // Define the Hugging Face API endpoint for user authentication
  const url = "https://huggingface.co/api/whoami-v2";
  const nocacheHeaders = { "Cache-Control": "no-cache" };
  const headers = { Authorization: `Bearer ${secret}` };

  try {
    // Send a GET request to the Hugging Face API
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

      validation_response.state = activeResponse.data?.validate.state!;
      validation_response.message = activeResponse.data?.validate.message!;
      validation_response.response = activeResponse.data?.validate.response!;

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
