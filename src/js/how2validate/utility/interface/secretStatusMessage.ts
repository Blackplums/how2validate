/**
 * @module SecretValidation
 * This module handles the validation of secrets, including the Snyk Auth Key.
 */

/**
 * @interface SecretStatusMessage
 * Represents the structure of a validation result for the Snyk Auth Key.
 *
 * @symbol state - The current state of the validation, which may be undefined.
 * @symbol message - A message describing the validation result, which may be undefined.
 * @symbol response - The response from the validation process, which may be undefined.
 */
export interface SecretStatusMessage {
  state: string;
  message: string;
  response: string;
}
