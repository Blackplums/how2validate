/**
 * @module How2Validate CLI Tool
 * This module provides a command-line interface (CLI) tool for validating secrets across various services and providers.
 * The tool allows users to specify providers, services, and secrets for validation, and supports features such as 
 * status monitoring, report generation, and tool updates.
 */

import { Command } from "commander"; // Importing Commander for building CLI applications
import validator from 'validator';
import {
  getActiveSecretStatus,
  getInactiveSecretStatus,
  getVersion,
} from "./utility/config_utility.js"; // Importing configuration utility functions
import {
  formatString,
  getScopedProviders,
  getScopedServices,
  getSecretProviders,
  getSecretscope,
  getSecretServices,
  updateTool,
  validateChoice,
} from "./utility/tool_utility.js"; // Importing utility functions for secret validation
import { validatorHandleService } from "./handler/validator_handler.js"; // Importing the validation handler
import { fileURLToPath } from "url";
import { ValidationResult } from "./utility/interface/validationResult.js";

/**
 * Creates a new instance of the Commander program to build the CLI application.
 * @type {Command}
 */
const program = new Command();

/**
 * Configure the CLI program details including name, description, and version.
 */
program
  .name("How2Validate Tool") // Set the name of the CLI tool
  .description("Validate various types of secrets for different services.") // Description of what the tool does
  .version(
    `How2Validate Tool version ${getVersion() as string}`,
    "-v, --version",
    "Expose the version."
  ); // Set the version and help flag

/**
 * Retrieve the list of supported secret providers.
 * @type {string[]}
 */
const providerChoices = getScopedProviders();

/**
 * Retrieve the list of supported secret services.
 * @type {string[]}
 */
const serviceChoices = getScopedServices();

/**
 * Define CLI options using Commander.
 * 
 * - `-secretscope`: Option for secret scope.
 * - `-provider`: Option to specify a provider with validation.
 * - `-service`: Option to specify a service with validation.
 * - `-secret`: Option to specify the secret to validate.
 * - `-response`: Option to check if the secret is active or inactive.
 * - `-report`: Option to get reports via email (Alpha feature).
 * - `--update`: Option to update the tool.
 */
program
  .option(
    "-secretscope",
    `Explore the secret universe. Your next target awaits.`
  )
  .option(
    "-p, --provider <PROVIDER>",
    `Specify your provider. Unleash your validation arsenal.`,
    (value: string) => validateChoice(value, providerChoices)
  )
  .option(
    "-s, --service <SERVICE>",
    `Specify your target service. Validate your secrets with precision.`,
    (value: string) => validateChoice(value, serviceChoices)
  )
  .option("-sec, --secret <SECRET>", "Unveil your secrets to verify their authenticity.")
  .option(
    "-r, --response",
    `Monitor the status. View if your secret ${getActiveSecretStatus()} or ${getInactiveSecretStatus()}.`
  )
  .option("-R, --report <E-mail>", "Get detailed reports. Receive validated secrets via email [Alpha Feature].",
    (value: string) => validateEmail(value) // Use the validation function here
  )
  .option("--update", "Hack the tool to the latest version.");

/**
 * Get the list of available providers.
 * @returns {string[]} Array of provider names.
 */
export function getProvider(): object {
  return getSecretProviders();
}

/**
 * Get the list of available services for a given provider.
 * @param {string} provider - The provider to get services for.
 * @returns {string[]} Array of service names.
 */
export function getService(provider: string): object {
  return getSecretServices(undefined, provider);
}

/**
 * Validate the provided secret using the given provider, service, and options.
 *
 * @async
 * @function validate
 * @param {string} provider - The provider to use for validation.
 * @param {string} service - The service to validate the secret with.
 * @param {string} secret - The secret that needs to be validated.
 * @param {boolean} response - Whether to get a response status for the secret.
 * @param {string} report - Whether to generate a report for the validation.
 * @param {boolean} [isBrowser=true] - Whether the validation is being run in a browser environment.
 * @returns {Promise<void>} - A promise that resolves when validation is complete.
 * @throws Will throw an error if validation fails.
 */
export async function validate(
  provider: string,
  service: string,
  secret: string,
  response: boolean,
  report: string,
  isBrowser:boolean = true
): Promise<ValidationResult | string> {
  const result = await validatorHandleService(
    formatString(provider),
    formatString(service),
    secret,
    response,
    report,
    isBrowser
  ); // Call the handler for validation
  return result;
}

// Email validation function
/**
 * Validates an email address.
 * @param {string} email - The email address to validate.
 * @returns {string} The validated email address.
 * @throws Will throw an error if the email is invalid.
 */
function validateEmail(email: string) {
  if (validator.isEmail(email)) {
    return email; // Return the email if valid
  } else {
    throw new Error(`Invalid email address: ${email}`);
  }
}

/**
 * Main function that executes the CLI program logic.
 * Parses the command-line arguments and performs actions based on the options provided.
 *
 * @async
 * @function main
 * @returns {Promise<void>} - A promise that resolves when the program execution is complete.
 * @throws Will throw an error if an unexpected issue occurs during execution.
 */
async function main(): Promise<void> {
  program.parse(process.argv); // Parse command-line arguments

  // Convert options keys to lowercase for consistency
  const options = Object.fromEntries(
    Object.entries(program.opts()).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]) // Normalize option keys
  );

  // Check for the secretscope option
  if (options.secretscope) {
    try {
      getSecretscope();
      return; // Exit after processing
    } catch (error) {
      console.error(`Error fetching Scoped secret services: ${error}`);
      return;
    }
  }

  // Check and validate the -R --report email if all required arguments are provided
  if (options.report && (!options.provider || !options.service || !options.secret)) {
      console.error("Missing required arguments: -provider, -service, -secret");
      console.error("Use '-h' or '--help' for tool usage information.");
      return;
  }

  // Check for the update option
  if (options.update) {
    try {
      console.info("Initiating tool update...");
      await updateTool(); // Call the update function
      console.info("Tool updated successfully.");
      return; // Exit after updating
    } catch (error) {
      console.error(`Error during tool update: ${error}`); // Log any errors
      return;
    }
  }

  // Validate required arguments
  if (!options.provider || !options.service || !options.secret) {
    console.error("Missing required arguments: -provider, -service, -secret");
    console.error("Use '-h' or '--help' for tool usage information.");
    return;
  }

  // Attempt to validate the secret
  try {
    console.info(
      `Initiating validation for service: ${options.service} with a provided secret.`
    );
    await validate(
      options.provider,
      options.service,
      options.secret,
      options.response,
      options.report,
      false
    ); // Call validate function
    console.info("Validation completed successfully.");
  } catch (error) {
    console.error(`An error occurred during validation: ${error}`); // Handle validation errors
    console.log(`Error: ${error}`);
  }
}

/**
 * Execute the main function only if the script is run directly from the command line.
 */
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => console.error(`Unexpected error: ${error}`));
}
