/**
 * @module config_utility
 * @description
 * This module provides functionality to initialize and access configuration settings
 * by reading from a config.json file. It ensures that the configuration is loaded
 * before any dependent functions are used.
 *
 * @requires fs
 * @requires path
 * @requires url
 */

import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from 'url';

/**
 * Interface representing the structure of the configuration.
 */
interface Config {
  DEFAULT?: {
    package_name?: string;
    version?: string;
  };
  SECRET?: {
    secret_active?: string;
    secret_inactive?: string;
  };
}

/**
 * Holds the loaded configuration. Initialized to null until `initConfig` is called.
 */
let config: Config | null = null;

/**
 * Get the directory name of the current module.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initializes the configuration by reading the config.json file.
 * This function reads the config file from the provided path or defaults to
 * the root configuration file located two levels above the current directory.
 *
 * @function initConfig
 * @param {string} [configFilePath] - The custom file path for config.json (optional).
 * If not provided, the function will attempt to load the config file from
 * the default location.
 * 
 * @throws {Error} If the config file cannot be read or parsed.
 * 
 * @example
 * initConfig(); // Initializes with default config path
 * initConfig('/custom/path/config.json'); // Initializes with a custom config file path
 */
export function initConfig(configFilePath?: string): void {
  const resolvedPath = configFilePath || path.resolve(__dirname, "..", "..", "config.json");
  
  try {
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Configuration file not found at path: ${resolvedPath}`);
    }

    const configContent = fs.readFileSync(resolvedPath, "utf-8");
    config = JSON.parse(configContent); // Parse JSON content
  } catch (error) {
    throw error; // Rethrow to prevent application from running with invalid config
  }
}

/**
 * Retrieves the package name from the 'DEFAULT' section of the configuration.
 *
 * @function getPackageName
 * @returns {string | undefined} The package name if available.
 * @throws {Error} If the configuration is not initialized.
 * 
 * @example
 * const packageName = getPackageName();
 * console.log(packageName); // Outputs the package name from config
 * 
 * @symbol package_name - The name of the package defined in the DEFAULT section.
 */
export function getPackageName(): string | undefined {
  if (config && config.DEFAULT && config.DEFAULT.package_name) {
    return config.DEFAULT.package_name;
  } else {
    throw new Error("Configuration not initialized or 'package_name' not set. Call initConfig() first.");
  }
}

/**
 * Retrieves the active secret status from the 'SECRET' section of the configuration.
 *
 * @function getActiveSecretStatus
 * @returns {string | undefined} The active secret status.
 * @throws {Error} If the configuration is not initialized.
 * 
 * @example
 * const activeSecret = getActiveSecretStatus();
 * console.log(activeSecret); // Outputs the active secret status from config
 * 
 * @symbol secret_active - The status of the active secret defined in the SECRET section.
 */
export function getActiveSecretStatus(): string{
  if (config && config.SECRET && config.SECRET.secret_active) {
    return config.SECRET.secret_active;
  } else {
    throw new Error("Configuration not initialized or 'secret_active' not set. Call initConfig() first.");
  }
}

/**
 * Retrieves the inactive secret status from the 'SECRET' section of the configuration.
 *
 * @function getInactiveSecretStatus
 * @returns {string | undefined} The inactive secret status.
 * @throws {Error} If the configuration is not initialized.
 * 
 * @example
 * const inactiveSecret = getInactiveSecretStatus();
 * console.log(inactiveSecret); // Outputs the inactive secret status from config
 * 
 * @symbol secret_inactive - The status of the inactive secret defined in the SECRET section.
 */
export function getInactiveSecretStatus(): string {
  if (config && config.SECRET && config.SECRET.secret_inactive) {
    return config.SECRET.secret_inactive;
  } else {
    throw new Error("Configuration not initialized or 'secret_inactive' not set. Call initConfig() first.");
  }
}

/**
 * Retrieves the version from the 'DEFAULT' section of the configuration.
 *
 * @function getVersion
 * @returns {string | undefined} The version if available.
 * @throws {Error} If the configuration is not initialized.
 * 
 * @example
 * const version = getVersion();
 * console.log(version); // Outputs the version from config
 * 
 * @symbol version - The version of the package defined in the DEFAULT section.
 */
export function getVersion(): string | undefined {
  if (config && config.DEFAULT && config.DEFAULT.version) {
    return config.DEFAULT.version;
  } else {
    throw new Error("Configuration not initialized or 'version' not set. Call initConfig() first.");
  }
}

/**
 * Retrieves the application name from the 'DEFAULT' section of the configuration.
 *
 * @function getAppName
 * @returns {string | undefined} The application name if available.
 * @throws {Error} If the configuration is not initialized.
 * 
 * @example
 * const appName = getAppName();
 * console.log(appName); // Outputs the application name from config
 * 
 * @symbol appName - The name of the application defined in the DEFAULT section.
 */
export function getAppName(): string | undefined {
  if (config && config.DEFAULT && config.DEFAULT.package_name) {
    return config.DEFAULT.package_name;
  } else {
    throw new Error("Configuration not initialized or 'package_name' not set. Call initConfig() first.");
  }
}

// Automatically initialize config when the file is imported
// You can comment this out if you prefer explicit initialization in your API routes
initConfig();