import { validateAdafruitIOKey } from "../validators/adafruit/adafruit_io_key.js"; // Import the Adafruit token validator
import { validateAivenAuthToken } from "../validators/aiven/aiven_auth_token.js"; // Import the Aiven API key validator
import { validateAnthropicAPIKey } from "../validators/anthropic/anthropic_api_key.js";  // Import the Anthropic API Key validator
import { validateHFOrgApiKey } from "../validators/hugging_face/hf_org_api_key.js"; // Import the Hugging Face API Key validator
import { validateHFUserAccessToken } from "../validators/hugging_face/hf_user_access_token.js"; // Import the Hugging Face API Key validator
import { validateNpmAccessToken } from "../validators/npm/npm_access_token.js"; // Import the NPM access token validator
import { validatePagerDutyAPIKey } from "../validators/pagerduty/pagerduty_api_key.js";  // Import the PagerDuty validator
import { validateSentryAuthToken } from "../validators/sentry/sentry_auth_token.js"; // Import the Sentry Auth Token validator
import { validateSnykAuthKey } from "../validators/snyk/snyk_auth_key.js"; // Import the Snyk authentication key validator
import { validateSonarcloudToken } from "../validators/sonarcloud/sonarcloud_token.js"; // Import the Sonarcloud token validator

import { ValidationResult } from "../utility/interface/validationResult.js"; // Import the ValidationResult type

/**
 * @module validatorHandleService
 * 
 * This module handles the validation of secrets for various services using their respective validator functions.
 */

/**
 * @typedef {function} ValidatorFunction
 * @param {string} provider - The name of the provider for the service being validated.
 * @param {string} service - The name of the service being validated.
 * @param {string} secret - The secret (e.g., API key, token) to validate.
 * @param {boolean} response - Indicates whether to include response data in the output.
 * @param {string} [report] - Optional email address for sending validation reports.
 * @param {boolean} [isBrowser=true] - Indicates if the validation is occurring in a browser environment.
 * @returns {Promise<ValidationResult>} A promise that resolves to a validation result object.
 */
type ValidatorFunction = (
  provider: string,
  service: string,
  secret: string,
  response: boolean,
  report: string,
  isBrowser: boolean
) => Promise<ValidationResult>;



/** 
 * Map of service names to their corresponding validator functions.
 * @type {Record<string, ValidatorFunction>}
 */
const serviceHandlers: Record<string, ValidatorFunction> = {
  adafruit_io_key: validateAdafruitIOKey, // Adafruit Io Key validator
  aiven_auth_token: validateAivenAuthToken, // Aiven Auth token
  anthropic_api_key: validateAnthropicAPIKey, // Anthropic API Key
  hf_org_api_key: validateHFOrgApiKey, // HuggingFace API Key
  hf_user_access_token: validateHFUserAccessToken, // HuggingFace API Key
  npm_access_token: validateNpmAccessToken, // NPM access token validator
  pagerduty_api_key: validatePagerDutyAPIKey, // PagerDuty API key
  sentry_auth_token: validateSentryAuthToken, // Sentry Auth Token
  snyk_auth_key: validateSnykAuthKey, // Snyk auth key validator
  sonarcloud_token: validateSonarcloudToken, // Sonarcloud token validator
  // Add additional services and their validators here
};

/**
 * Handles the validation of a service's secret.
 * This function retrieves the appropriate validator function for the specified service
 * and invokes it with the provided secret and parameters.
 * 
 * @param {string} provider - The name of the provider for the service to validate.
 * @param {string} service - The name of the service to validate.
 * @param {string} secret - The secret (e.g., API key, token) to validate.
 * @param {boolean} response - A boolean indicating whether to include response data in the output.
 * @param {string} [report] - An optional email address for sending validation reports.
 * @param {boolean} [isBrowser=true] - Indicates if the validation is occurring in a browser environment.
 * @returns {Promise<ValidationResult | string>} A promise that resolves to the validation result or an error message.
 * 
 * @example
 * const result = await validatorHandleService('snyk_auth_key', 'my-secret-key', true);
 * console.log(result); // Outputs the validation result for the specified service
 */
export async function validatorHandleService(
  provider: string,
  service: string,
  secret: string,
  response: boolean,
  report: string,
  isBrowser: boolean = true
): Promise<ValidationResult | string> {
  // Retrieve the handler function based on the provided service name
  const handler = serviceHandlers[service];

  if (handler) {
    // If a handler exists, call it with the provided parameters
    return handler(provider, service, secret, response, report, isBrowser);
  } else {
    // Return an error message if no handler is found for the given service
    return `Error: No handler for service '${service}'`;
  }
}
