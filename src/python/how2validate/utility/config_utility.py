import logging
import os
import configparser

# Global variable to hold the configuration
config = None

def init_config():
    """
    Initializes the configuration by loading the config.ini file.

    This function creates an instance of ConfigParser, determines the path to the
    config.ini file, and attempts to read it. If the file is not found, an error
    message is logged.

    Raises:
        FileNotFoundError: If the config.ini file cannot be found at the specified path.
    """
    global config
    config = configparser.ConfigParser()

    # Get the directory of the current file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the config.ini file
    config_file_path = os.path.join(current_dir, '..', '..', 'config.ini')

    try:
        config.read(config_file_path)
        # Optionally handle any loading errors here
    except FileNotFoundError:
        logging.error(f"Error: The file '{config_file_path}' was not found.")

def get_package_name():
    """
    Retrieves the package name from the DEFAULT section of the configuration.

    Returns:
        str: The package name defined in the config.ini file.

    Raises:
        ValueError: If the configuration has not been initialized.
    """
    if config:
        return config.get('DEFAULT', 'package_name')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")

def get_active_secret_status():
    """
    Retrieves the active secret status from the SECRET section of the configuration.

    Returns:
        str: The active secret status defined in the config.ini file.

    Raises:
        ValueError: If the configuration has not been initialized.
    """
    if config:
        return config.get('SECRET', 'secret_active')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")

def get_inactive_secret_status():
    """
    Retrieves the inactive secret status from the SECRET section of the configuration.

    Returns:
        str: The inactive secret status defined in the config.ini file.

    Raises:
        ValueError: If the configuration has not been initialized.
    """
    if config:
        return config.get('SECRET', 'secret_inactive')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")

def get_version():
    """
    Retrieves the version from the DEFAULT section of the configuration.

    Returns:
        str: The version defined in the config.ini file.

    Raises:
        ValueError: If the configuration has not been initialized.
    """
    if config:
        return config.get('DEFAULT', 'version')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")

def get_app_name():
    """
    Retrieves the app name from the DEFAULT section of the configuration.

    Returns:
        str: The app name defined in the config.ini file.

    Raises:
        ValueError: If the configuration has not been initialized.
    """
    if config:
        return config.get('DEFAULT', 'app_name')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")

def get_report_urls():
    """
    Reads the [REPORT] section from config.ini and returns a dict of URLs.
    """
    if config:
        return dict(config['REPORT'])
    else:
        raise ValueError("Report Url's not initialized. Call init_config() first.")

# Initialization block to load the config when the module is imported or run
init_config()
