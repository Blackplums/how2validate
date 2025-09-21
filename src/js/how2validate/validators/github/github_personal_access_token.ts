/**
 * @module GitHubPersonalAccessTokenValidator
 * @description
 * This module provides functionality to validate a GitHub Personal Access Token by making an API call to the GitHub service.
 * It returns a validation status, processes the response from the API, and optionally sends an email report with the results.
 * 
 * @requires axios - Used for making HTTP requests to the GitHub API.
 * @requires ../../utility/tool_utility.js - Utility functions for handling status responses and errors.
 * @requires ../../handler/email_handler.js - Used for sending email reports on validation results.
 */

import { ValidationResult } from "../../utility/interface/validationResult.js";
import { 
  handleInactiveStatus, 
  handleErrors, 
  getUsernameFromEmail, 
  handleActiveStatus, 
  responseValidation 
} from "../../utility/tool_utility.js";
import { EmailResponse } from "../../utility/interface/EmailResponse.js";
import { SecretStatusMessage } from "../../utility/interface/secretStatusMessage.js";
import { sendEmail } from "../../handler/email_handler.js";
import axios from "axios";

/**
 * @function validateGitHubPersonalAccessToken
 * @description
 * Validates a GitHub Personal Access Token by making an API call to the GitHub API.
 * Checks the token's validity, handles errors, and returns a validation result.
 * Optionally sends an email summarizing the validation results.
 * 
 * @async
 * @param {string} provider - The provider name (e.g., "GitHub").
 * @param {string} service - The name of the service being validated.
 * @param {string} secret - The GitHub Personal Access Token to validate.
 * @param {boolean} responseFlag - A flag to indicate whether detailed response data should be returned.
 * @param {string} [report] - An optional email address to which a validation report should be sent.
 * @param {boolean} [isBrowser=true] - Indicates if the function is called from a browser environment (default is true).
 * 
 * @returns {Promise<ValidationResult>} - A promise that resolves to a `ValidationResult` object containing the validation result.
 */
export async function validateGitHubPersonalAccessToken(
  provider: string,
  service: string,
  secret: string,
  responseFlag: boolean,
  report: string,
  isBrowser: boolean = true
): Promise<ValidationResult> {
  const validationResponse = {} as SecretStatusMessage;
  const url = "https://api.github.com/user";
  const nocacheHeaders = { "Cache-Control": "no-cache" };
  const headers = { Authorization: `Bearer ${secret}` };

  try {
    const responseData = await axios.get(url, {
      headers: { ...nocacheHeaders, ...headers },
    });

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

      return responseValidation(activeResponse, responseFlag);
    } else {
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

      return responseValidation(inactiveResponse, responseFlag);
    }
  } catch (error) {
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

    return responseValidation(errResponse, responseFlag);
  } finally {
    if (report) {
      const emailResponse: EmailResponse = {
        provider: provider,
        service: service,
        state: validationResponse.state,
        message: validationResponse.message,
        response: validationResponse.response,
      };

      sendEmail(report, getUsernameFromEmail(report), emailResponse)
        .then(() => console.info("Validation report sent successfully"))
        .catch((error) => console.error("Error sending validation report", error));
    }
  }
}
