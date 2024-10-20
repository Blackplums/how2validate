import logging
import os
import configparser

# Global variable to hold the configuration
config = None

def init_config():
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

# Function to get the package name from the DEFAULT section
def get_package_name():
    if config:
        return config.get('DEFAULT', 'package_name')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")

# Function to get the active secret status from the SECRET section
def get_active_secret_status():
    if config:
        return config.get('SECRET', 'secret_active')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")

# Function to get the inactive secret status from the SECRET section
def get_inactive_secret_status():
    if config:
        return config.get('SECRET', 'secret_inactive')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")
    
# Function to get the version from the DEFAULT section
def get_version():
    if config:
        return config.get('DEFAULT', 'version')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")

# Function to get the app name from the DEFAULT section
def get_app_name():
    if config:
        return config.get('DEFAULT', 'app_name')
    else:
        raise ValueError("Configuration not initialized. Call init_config() first.")

# Initialization block to load the config when the module is imported or run
init_config()
