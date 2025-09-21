/**
 * @interface ValidationResult
 * Represents the structure of a validation result for the NPM Access Token.
 */
export interface ValidationResult {
  /**
   * The HTTP status code of the validation result.
   * @type {number}
   */
  status: number;

  /**
   * The name of the application performing the validation.
   * @type {string}
   */
  app: string;

  /**
   * Optional data related to the validation result.
   * @type {{ validate?: { message: string; response: any; report?: string }; provider?: string[]; services?: string[] }}
   */
  data?: {
    /**
     * Information about the validation process.
     * @type {{ state: string;, message: string; response: any; report?: string }}
     */
    validate: {
      state: string;
      /** The message describing the validation result. */
      message: string;

      /** The response received from the validation request. */
      response: string;

      /** An optional report email or contact. */
      report: string;
    };

    /** An optional array of providers associated with the validation. */
    provider: string;

    /** An optional array of services associated with the validation. */
    services: string;
  };

  /**
   * Optional error information related to the validation.
   * @type {{ message: string }}
   */
  error?: {
    /** A message describing the error encountered during validation. */
    message: string;
  };

  /**
   * The timestamp indicating when the validation was performed, in ISO format.
   * @type {string}
   */
  timestamp: string;
}
