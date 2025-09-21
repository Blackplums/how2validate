import * as fs from "fs"; // Importing the 'fs' module for file system operations
import * as path from "path"; // Importing the 'path' module for handling file and directory paths
import { fileURLToPath } from 'url'; // Importing fileURLToPath to convert URL to path
import * as logging from "loglevel"; // Importing loglevel for logging messages
import Table from 'cli-table3'; // Importing cli-table3 for formatted table display
import { execSync } from "child_process";

import { getActiveSecretStatus, getInactiveSecretStatus, getPackageName } from "./config_utility.js"; // Importing a function to get the package name from configuration
import { ValidationResult } from "./interface/validationResult.js";
import { getSecretStatusMessage } from "./log_utility.js";
import axios, { AxiosError } from "axios";

// Convert import.meta.url to __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the TokenManager JSON file
const tokenManager_filePath = path.join(
  __dirname,
  "..",
  "..",
  "tokenManager.json"
);

const appName = 'How2Validate'; // Initialize appName

// Function to get the current timestamp in ISO format
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Type guard to check if the error is an instance of Error
function isError(error: unknown): error is Error {
  return error instanceof Error;
}


export function getScopedProviders(
  filePath: string = tokenManager_filePath
): string[] {
  // Read the JSON file and parse its contents
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const enabledSecretsServices: string[] = [];

  // Iterate through each provider in the data
  for (const provider in data) {
    const tokens = data[provider];
    // Check each token's enabled status
    for (const tokenInfo of tokens) {
      if (tokenInfo.is_enabled) {
        enabledSecretsServices.push(provider); // Add enabled provider to the list
      }
    }
  }
  return enabledSecretsServices; // Return the list of enabled secret providers
}

/**
 * Get the enabled secret providers from the TokenManager JSON file.
 * @param {string} filePath - The path to the TokenManager JSON file (default: tokenManager_filePath).
 * @returns {string[]} An array of enabled secret providers.
 */
export function getSecretProviders(
  filePath: string = tokenManager_filePath
): object {

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        status: 400,
        app: appName,
        error: {
          message: "Invalid request: Missing required parameter 'provider'."
        },
        timestamp: getCurrentTimestamp()
      };
    }

    // Read the JSON file and parse its contents
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const enabledSecretsServices: string[] = [];

    // Iterate through each provider in the data
    for (const provider in data) {
      const tokens = data[provider];

      // Check each token's enabled status
      for (const tokenInfo of tokens) {
        if (tokenInfo.is_enabled) {
          enabledSecretsServices.push(provider); // Add enabled provider to the list
        }
      }
    }

    // Handle the case of no enabled secret providers
    if (enabledSecretsServices.length === 0) {
      return {
        status: 403,
        app: appName,
        error: {
          message: "Access denied."
        },
        timestamp: getCurrentTimestamp()
      };
    }

    // Return successful response with providers
    return {
      status: 200,
      app: appName,
      data: {
        provider: enabledSecretsServices
      },
      timestamp: getCurrentTimestamp()
    };
  } catch (error) {
    // Check for specific error types and handle them
    if (isError(error)) {
      // Check for authentication failure (for demonstration purposes)
      if (error.message === "Authentication required") {
        return {
          status: 401,
          app: appName,
          error: {
            message: "Authentication required."
          },
          timestamp: getCurrentTimestamp()
        };
      }

      // Handle general error case
      return {
        status: 500,
        app: appName,
        error: {
          message: error.message || "Internal server error occurred."
        },
        timestamp: getCurrentTimestamp()
      };
    }

    // Handle unknown error type
    return {
      status: 500,
      app: appName,
      error: {
        message: "An unknown error occurred."
      },
      timestamp: getCurrentTimestamp()
    };
  }
}

export function getScopedServices(
  filePath: string = tokenManager_filePath,
  provider: string = ""
): string[] {
  // Read the JSON file and parse its contents
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const enabledSecretsServices: string[] = [];

  // Format the provider string for case-insensitive comparison
  const formattedProvider = formatString(provider);

  // Iterate through each provider in the data
  for (const currentProvider in data) {
    const formattedCurrentProvider = formatString(currentProvider);
    // If a specific provider is provided, check for a match
    if (formattedProvider && formattedProvider !== formattedCurrentProvider) {
      continue; // Skip to the next provider if there's no match
    }

    const tokens = data[currentProvider];
    // Check each token's enabled status
    for (const tokenInfo of tokens) {
      if (tokenInfo.is_enabled) {
        enabledSecretsServices.push(tokenInfo.display_name); // Add display name of enabled services
      }
    }
  }

  return enabledSecretsServices; // Return the list of enabled secret services
}

/**
 * Get the enabled secret services from the TokenManager JSON file.
 * @param {string} filePath - The path to the TokenManager JSON file (default: tokenManager_filePath).
 * @param {string} provider - The provider to filter services by (default: "").
 * @returns {string[]} An array of enabled secret services.
 */
export function getSecretServices(
  filePath: string = tokenManager_filePath,
  provider: string = ""
): object {

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        status: 400,
        app: appName,
        error: {
          message: "Invalid request: Missing required parameter 'provider'."
        },
        timestamp: getCurrentTimestamp()
      };
    }

    // Read the JSON file and parse its contents
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const enabledSecretsServices: string[] = [];

    // Format the provider string for case-insensitive comparison
    const formattedProvider = formatString(provider);

    // Iterate through each provider in the data
    for (const currentProvider in data) {
      const formattedCurrentProvider = formatString(currentProvider);
      // If a specific provider is provided, check for a match
      if (formattedProvider && formattedProvider !== formattedCurrentProvider) {
        continue; // Skip to the next provider if there's no match
      }

      const tokens = data[currentProvider];
      // Check each token's enabled status
      for (const tokenInfo of tokens) {
        if (tokenInfo.is_enabled) {
          enabledSecretsServices.push(tokenInfo.display_name); // Add display name of enabled services
        }
      }
    }

    // Handle the case of no enabled secret services
    if (enabledSecretsServices.length === 0) {
      return {
        status: 403,
        app: appName,
        error: {
          message: "Access denied."
        },
        timestamp: getCurrentTimestamp()
      };
    }

    // Return successful response with services
    return {
      status: 200,
      app: appName,
      data: {
        services: enabledSecretsServices
      },
      timestamp: getCurrentTimestamp()
    };
  } catch (error) {
    // Check for specific error types and handle them
    if (isError(error)) {
      // Check for authentication failure (for demonstration purposes)
      if (error.message === "Authentication required") {
        return {
          status: 401,
          app: appName,
          error: {
            message: "Authentication required."
          },
          timestamp: getCurrentTimestamp()
        };
      }

      // Handle general error case
      return {
        status: 500,
        app: appName,
        error: {
          message: error.message || "Internal server error occurred."
        },
        timestamp: getCurrentTimestamp()
      };
    }

    // Handle unknown error type
    return {
      status: 500,
      app: appName,
      error: {
        message: "An unknown error occurred."
      },
      timestamp: getCurrentTimestamp()
    };
  }
}

/**
 * Get and display secret providers and services from the TokenManager JSON file.
 * @param {string} filePath - The path to the TokenManager JSON file (default: tokenManager_filePath).
 */
export function getSecretscope(filePath: string = tokenManager_filePath): void {
  // Read and parse the JSON file contents
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const table = new Table({
    head: ['Provider', 'Service'],  // Table headers
    style: {
      head: ['green'],  // Header styling
      border: ['white']  // Border styling
    }
  });

  let hasEnabledServices = false;

  // Iterate over each provider and their tokens
  for (const provider in data) {
    const tokens = data[provider];
    for (const tokenInfo of tokens) {
      if (tokenInfo.is_enabled) {
        table.push([provider, tokenInfo['display_name']]);  // Add rows to the table
        hasEnabledServices = true;
      }
    }
  }

  // Display the table or a message if no services are enabled
  if (hasEnabledServices) {
    console.log(table.toString());
  } else {
    console.log('No enabled services found.');
  }
}

/**
 * Format the enabled service providers for display.
 * @param {string} filePath - The path to the TokenManager JSON file (default: tokenManager_filePath).
 * @returns {string} A formatted string of enabled service providers.
 */
export function formatServiceProviders(
  filePath: string = tokenManager_filePath
): string {
  // Read the JSON file and parse its contents
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const enabledSecretsServices: string[] = [];

  // Iterate through each provider in the data
  for (const provider in data) {
    const tokens = data[provider];
    // Check each token's enabled status
    for (const tokenInfo of tokens) {
      if (tokenInfo.is_enabled) {
        enabledSecretsServices.push(provider); // Add enabled provider to the list
      }
    }
  }

  // Format each service provider with a bullet point and join them into a single string
  return enabledSecretsServices.map((service) => ` - ${service}`).join("\n");
}

/**
 * Format the enabled services for display.
 * @param {string} filePath - The path to the TokenManager JSON file (default: tokenManager_filePath).
 * @returns {string} A formatted string of enabled services with their providers.
 */
export function formatServices(
  filePath: string = tokenManager_filePath
): string {
  // Read the JSON file and parse its contents
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const enabledSecretsServices: string[] = [];

  // Iterate through each provider in the data
  for (const provider in data) {
    const tokens = data[provider];
    // Check each token's enabled status
    for (const tokenInfo of tokens) {
      if (tokenInfo.is_enabled) {
        // Add formatted string of provider and service display name
        enabledSecretsServices.push(`${provider} - ${tokenInfo.display_name}`);
      }
    }
  }

  // Format each service with a bullet point and join them into a single string
  return enabledSecretsServices.map((service) => `  - ${service}`).join("\n");
}

/**
 * Format a string by converting it to lowercase and replacing spaces with underscores.
 * @param {string} inputString - The string to format.
 * @returns {string} The formatted string.
 * @throws {Error} An error if the input is not a string.
 */
export function formatString(inputString: string): string {
  if (typeof inputString !== "string") {
    throw new Error("Input must be a string"); // Ensure input is a string
  }

  return inputString.toLowerCase().replace(/ /g, "_"); // Format the string
}

/**
 * Validate a user's choice against a list of valid choices.
 * @param {string} value - The value to validate.
 * @param {string[]} validChoices - An array of valid choices.
 * @returns {string} The formatted value if valid.
 * @throws {Error} An error if the value is not valid.
 */
export function validateChoice(value: string, validChoices: string[]): string {
  const formattedValue = formatString(value); // Format the user's choice
  const formattedChoices = validChoices.map((choice) => formatString(choice)); // Format valid choices

  if (!formattedChoices.includes(formattedValue)) {
    // Throw an error if the choice is invalid
    throw new Error(
      `Invalid choice: '${value}'. Choose from ${validChoices.join(", ")}.`
    );
  }

  return formattedValue; // Return the formatted value
}

/**
 * Redact a secret by masking part of it with asterisks.
 * @param {string} secret - The secret to redact.
 * @returns {string} The redacted secret.
 * @throws {Error} An error if the input is not a string.
 */
export function redactSecret(secret: string): string {
  if (typeof secret !== "string") {
    throw new Error("Input must be a string"); // Ensure input is a string
  }

  if (secret.length <= 5) {
    return secret; // Return the secret as is if it's 5 characters or less
  }

  // Redact the secret by keeping the first 5 characters and masking the rest
  return secret.slice(0, 5) + "*".repeat(secret.length - 5);
}

export function getUsernameFromEmail(email: string): string {
  // Split the email at the "@" character to get the username
  const username = email.split('@')[0];

  // Convert the username to sentence case
  const sentenceCaseUsername = username
    .split('.')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return sentenceCaseUsername;
}

/**
 * Update the tool to the latest version using the appropriate package manager.
 */
export function updateTool(): void {
  logging.info("Updating the tool..."); // Log the update initiation

  // Determine the package manager being used
  const packageManager = detectPackageManager();
  const packageName = getPackageName(); // Get the package name

  try {
    // Execute the appropriate command based on the package manager
    switch (packageManager) {
      case "npm":
        execSync(`npm install --global ${packageName}`, { stdio: "inherit" });
        break;
      case "yarn":
        execSync(`yarn global add ${packageName}`, { stdio: "inherit" });
        break;
      case "pnpm":
        execSync(`pnpm add --global ${packageName}`, { stdio: "inherit" });
        break;
      case "bun":
        execSync(`bun add ${packageName} --global`, { stdio: "inherit" });
        break;
      default:
        logging.warn("Unknown package manager. Please update manually."); // Log warning for unknown package manager
    }
  } catch (error) {
    logging.error(`Failed to update the tool: ${error}`); // Log error message if update fails
  }
}

/**
 * Detect the package manager being used in the project.
 * @returns {string} The name of the detected package manager.
 */
function detectPackageManager(): string {
  const hasNpm = fs.existsSync(path.join(__dirname, "..", "node_modules")); // Check for npm
  const hasYarn = fs.existsSync(path.join(__dirname, "..", "yarn.lock")); // Check for yarn
  const hasPnpm = fs.existsSync(path.join(__dirname, "..", "pnpm-lock.yaml")); // Check for pnpm
  const hasBun = fs.existsSync(path.join(__dirname, "..", "bun.lockb")); // Check for bun

  if (hasBun) return "bun"; // Return bun if found
  if (hasPnpm) return "pnpm"; // Return pnpm if found
  if (hasYarn) return "yarn"; // Return yarn if found
  if (hasNpm) return "npm"; // Return npm if found

  return "unknown"; // Return unknown if none found
}

/**
 * Handle the active secret status and create a ValidationResult.
 * @param {string} service - The name of the service being validated.
 * @param {any} responseData - The data from the API response.
 * @param {boolean} responseFlag - A flag to indicate whether to include detailed response data.
 * @param {string} report - The report string (usually an email).
 * @param {string} provider - The provider name.
 * @param {string} appName - The application name.
 * @param {string} timestamp - The current timestamp.
 * @param {boolean} isBrowser - Flag to indicate if the function is called from the browser.
 * @returns {ValidationResult} - The ValidationResult object.
 */
export function handleActiveStatus(
  provider: string,
  service: string,
  responseData: any,
  responseFlag: boolean,
  report: string,
  isBrowser: boolean
): ValidationResult {
  const res = getSecretStatusMessage(
    service,
    getActiveSecretStatus() as string,
    JSON.stringify(responseData.data, null, 4)
  );

  const activeResponseData: ValidationResult = {
    status: responseData.status,
    app: appName,
    data: {
      validate: {
        state: res.state,
        message: res.message,
        response: res.response,
        report: report ? report : "email@how2validate.com",
      },
      provider: provider,
      services: service,
    },
    timestamp: getCurrentTimestamp(),
  };

  // Log the result if not in the browser environment
  if (!isBrowser) {
    console.info(`${res.message}${responseFlag ? `\nHere is the additional response data:\n${JSON.stringify(activeResponseData, null, 4)}` : ""}`);
  }

  return activeResponseData;
}


/**
 * Handle the case when the token is inactive or invalid.
 *
 * @function handleInactiveStatus
 * @param {string} service - The name of the service being validated.
 * @param {boolean} responseFlag - A flag to indicate whether to include detailed response data.
 * @param {any} [data] - Optional additional data to include in the response.
 * @param {boolean} [isBrowser] - Flag to indicate if the function is called from the browser.
 *
 * @returns {ValidationResult} - A validation result object indicating the inactive status.
 */
export function handleInactiveStatus(
  provider: string,
  service: string,
  responseFlag: boolean,
  data?: any,
  report?: string,
  isBrowser: boolean = true
): ValidationResult{
  const appName = "How2Validate";
  const timestamp = getCurrentTimestamp();

  const res = getSecretStatusMessage(
    service,
    getInactiveSecretStatus() as string,
    data ? JSON.stringify(data) : "No additional data."
  );

  const inactiveResponseData = {
    status: data.status,
    app: appName,
    data: {
      validate: {
        state: res.state,
        message: res.message!,
        response: res.response,
        report: report ? report : "email@how2validate.com",
      },
      provider: provider,
      services: service
    },
    timestamp,
  };

  if (!isBrowser) {
    console.info(`${res.message}${responseFlag ? `\nHere is the additional response data:\n${JSON.stringify(inactiveResponseData, null, 4)}` : ""}`);
  }

  return inactiveResponseData;
}

/**
 * Handle errors that occur during the validation process.
 *
 * @function handleErrors
 * @param {unknown} error - The error object that was thrown.
 * @param {string} service - The name of the service being validated.
 * @param {boolean} responseFlag - A flag to indicate whether to include detailed response data.
 * @param {boolean} [isBrowser] - Flag to indicate if the function is called from the browser.
 *
 * @returns {ValidationResult} - A validation result object based on the type of error.
 */
export function handleErrors(
  provider: string,
  service: string,
  responseFlag: boolean,
  report: string,
  error: unknown,
  isBrowser: boolean = true
): ValidationResult {
  const appName = "How2Validate";
  const timestamp = getCurrentTimestamp();

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status || 500;

    const res = getSecretStatusMessage(
      service,
      getInactiveSecretStatus() as string,
      axiosError.response?.data
        ? JSON.stringify(axiosError.response?.data, null, 4)
        : "Authentication failed."
    );

    const errResponseData: ValidationResult = {
      status: status,
      app: appName,
      data: {
        validate: {
          state: res.state,
          message: res.message,
          response: res.response,
          report: report ? report : "email@how2validate.com",
        },
        provider: provider,
        services: service
      },
      error:{
        message: res.response,
      },
      timestamp,
    };

    if (!isBrowser) {
      console.info(`${res.message}${responseFlag ? `\nHere is the additional response data:\n${JSON.stringify(errResponseData, null, 4)}` : ""}`);
    }

    return errResponseData;
  }

  return {
    status: 500, // Default status
    app: appName,
    data: {
      validate: {
        state: getInactiveSecretStatus() as string,
        message: "An unexpected error occurred.",
        response: "{}",
        report: report || "email@how2validate.com",
      },
      provider: provider,
      services: service,
    },
    timestamp,
  };;
}

/**
 * Validates the response and modifies the message field based on the response flag.
 * 
 * @param {ValidationResult} activeRes - The active response object that contains validation data.
 * @param {boolean} responseFlag - Flag to indicate whether to retain the original message or set it to an empty string.
 */
export function responseValidation(resData: ValidationResult, responseFlag: boolean): ValidationResult {
  if (resData.data && resData.data.validate && resData.data.validate.message !== undefined) {
    resData.data.validate.message = responseFlag ? resData.data.validate.message : "";
  }
  return resData;
}

