/**
 * @module OpenAIApiKeyValidator
 * @description
 * This module provides functionality to validate an OpenAI API key by making an API call to the OpenAI service.
 * It returns a validation status, processes the response from the API, and optionally sends an email report with the results.
 *
 * This module depends on various utilities for handling configuration, logging, and secret statuses.
 *
 * @requires axios - Used for making HTTP requests to the OpenAI API.
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
 * @function validateOpenAIApiKey
 * @description
 * This function validates an OpenAI API key by making an API call to the OpenAI API.
 * Based on the response from OpenAI, it checks the validity of the key, handles errors, and
 * returns an appropriate validation result.
 *
 * If a `report` email is provided, the function also sends an email summarizing the validation results.
 *
 * @async
 * @param {string} provider - The provider name (e.g., "OpenAI") for which the secret is being validated.
 * @param {string} service - The name of the service being validated.
 * @param {string} secret - The OpenAI API key to validate.
 * @param {boolean} responseFlag - A flag to indicate whether detailed response data should be returned.
 * @param {string} [report] - An optional email address to which a validation report should be sent.
 * @param {boolean} [isBrowser=true] - Indicates if the function is called from a browser environment (default is false).
 *
 * @returns {Promise<ValidationResult>} - A promise that resolves to a `ValidationResult` object containing the validation result.
 *
 * @throws {Error} - If the validation process encounters an issue, it throws an error.
 */
export async function validateOpenAIApiKey(
  provider: string,
  service: string,
  secret: string,
  responseFlag: boolean,
  report: string,
  isBrowser: boolean = true
): Promise<ValidationResult> {
  const validation_response = {} as SecretStatusMessage;

  const url = "https://api.openai.com/v1/me";
  const headers = { Authorization: `Bearer ${secret}` };

  try {
    const responseData = await axios.get(url, { headers });

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
    if (report) {
      const emailResponse: EmailResponse = {
        provider: provider,
        service: service,
        state: validation_response.state,
        message: validation_response.message,
        response: validation_response.response,
      };

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
