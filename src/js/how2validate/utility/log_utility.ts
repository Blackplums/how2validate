// Importing utility functions to get secret status values from the config
import {
  getActiveSecretStatus,
  getInactiveSecretStatus,
} from "./config_utility.js";
import { SecretStatusMessage } from "./interface/secretStatusMessage.js";

/**
 * @module SecretStatus
 * This module provides functionality for retrieving and formatting messages about secret statuses.
 */

/**
 * Generates a formatted message regarding the status of a secret.
 * This function determines if the secret is active or inactive and constructs
 * a corresponding status message, with optional response data for additional context.
 *
 * @param {string} service - The name of the service associated with the secret.
 * @param {string} isActive - The current status of the secret (active or inactive).
 * This value is evaluated against the active/inactive statuses from the config.
 * @param {boolean} [response] - Optional boolean indicating whether there is a response (not utilized in formatting).
 * @param {any} [responseData] - Optional data to provide additional context, appended to the message if available.
 * @returns {SecretStatusMessage} A formatted message describing the secret's status and any response data (if provided).
 * 
 * @throws {Error} If the isActive value is not recognized (neither active nor inactive).
 * 
 * @example
 * const service = "Payment Service";
 * const isActive = getActiveSecretStatus(); // or getInactiveSecretStatus()
 * const message = getSecretStatusMessage(service, isActive);
 * console.log(message);
 * // Output: "The provided secret 'Payment Service' is currently active and operational."
 *
 * @symbol state - The state of the secret based on its status (active or inactive).
 * @symbol message - A formatted message describing the secret's current operational status.
 * @symbol response - Additional response data if provided, or an empty string if not.
 */
export function getSecretStatusMessage(
  service: string,
  isActive: string,
  responseData: string
): SecretStatusMessage {
  let state: string;
  let msgData: string;
  let resData: string = "";
  let status: string;

  // Check if the secret is active or inactive based on the provided status
  if (isActive === getActiveSecretStatus()) {
    state = getActiveSecretStatus();
    status = "active and operational"; // Set status message for active secret
  } else if (isActive === getInactiveSecretStatus()) {
    state = getInactiveSecretStatus();
    status = "inactive and not operational"; // Set status message for inactive secret
  } else {
    state = `Unexpected isActive value: ${isActive}. Expected 'Active' or 'Inactive'.`;
    // Throw an error if the status doesn't match the expected active/inactive values
    throw new Error(
      `Unexpected isActive value: ${isActive}. Expected 'Active' or 'Inactive'.`
    );
  }

  // Base message about the secret's status
  msgData = `The provided secret '${service}' is currently ${status}.`; // Assign value without redeclaration
  resData = `\n${responseData}`;

  return {
    state: state,
    message: msgData,
    response: resData ? resData : `{}`, // Ensure it returns the initialized variable
  }; // Return the formatted status message
}
