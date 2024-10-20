import argparse
import datetime
import json
import logging
import os
import subprocess
import sys

import requests
from tabulate import tabulate

from how2validate.utility.config_utility import get_active_secret_status, get_inactive_secret_status, get_package_name, get_app_name
from how2validate.utility.interface.validationResult import ValidationData, ValidationProcess, ValidationResult
from how2validate.utility.log_utility import get_secret_status_message, setup_logging

# Call the logging setup function
setup_logging()

# Get the directory of the current file
current_dir = os.path.dirname(__file__)

# Path to the TokenManager JSON file
file_path = os.path.join(current_dir, '..', '..', 'tokenManager.json')

appName = f"{get_app_name()}"; 

def get_current_timestamp() -> str:
    """
    Function to get the current timestamp in ISO format.

    Returns:
        str: Current UTC timestamp in ISO 8601 format.
    """
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def is_error(error: any) -> bool:
    """
    Type guard to check if the error is an instance of Exception.

    Args:
        error (unknown): The error to check.

    Returns:
        bool: True if the error is an instance of Exception, False otherwise.
    """
    return isinstance(error, Exception)

def get_secretprovider(file_path = file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    enabled_secrets_services = []
    
    for provider, tokens in data.items():
        for token_info in tokens:
            if token_info['is_enabled']:
                enabled_secrets_services.append(f"{provider}")
    
    return enabled_secrets_services

def get_secretservices(file_path = file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    enabled_secrets_services = []
    
    for provider, tokens in data.items():
        for token_info in tokens:
            if token_info['is_enabled']:
                enabled_secrets_services.append(f"{token_info['display_name']}")
    
    return enabled_secrets_services

def get_secretscope(file_path = file_path):
    """
    Reads a JSON file containing provider tokens and logs a table of enabled services.

    Args:
        file_path (str): The path to the JSON file containing provider tokens. 
                         Defaults to the global variable `file_path`.

    Raises:
        FileNotFoundError: If the specified file cannot be found or read.
    
    Returns:
        None: This function logs a formatted table of enabled provider services.
              If no enabled services are found, it logs a relevant message.
    """
    # Open and load the JSON file
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    scoped_services = []

    # Iterate over each provider and its tokens
    for provider, tokens in data.items():
        for token_info in tokens:
            # Check if the token is enabled
            if token_info['is_enabled']:
                # Add the provider and service (token display name) to the scoped services list
                scoped_services.append([provider, token_info['display_name']])

    # Log the result as a table
    if scoped_services:
        # Log the table using the tabulate function with fancy formatting
        logging.info(tabulate(scoped_services, headers=['Provider', 'Service'], tablefmt='fancy_outline'))
    else:
        # Log a message if no enabled services are found
        logging.info("No enabled services found.")

def format_string(input_string):
    """
    Converts a string to lowercase and replaces spaces with underscores.

    Args:
        input_string (str): The input string to format.

    Returns:
        str: The formatted string with lowercase and underscores.
    """
    if not isinstance(input_string, str):
        raise ValueError("Input must be a string")
    
    return input_string.lower().replace(' ', '_')

def validate_choice(value, valid_choices):
    """
    Validates if the provided value is among the valid choices after formatting.

    Args:
        value (str): The input value to validate.
        valid_choices (list): The list of valid choices.

    Raises:
        argparse.ArgumentTypeError: If the value is not in valid_choices.

    Returns:
        str: The formatted and validated value.
    """
    formatted_value = format_string(value)
    formatted_choices = [format_string(choice) for choice in valid_choices]  # Format valid choices

    if formatted_value not in formatted_choices:
        raise argparse.ArgumentTypeError(
            f"Invalid choice: '{value}'. Choose from {', '.join(valid_choices)}."
        )
    
    return formatted_value

def redact_secret(secret):
    """
    Redacts a secret by keeping the first 5 characters and replacing the rest with asterisks.

    Args:
        secret (str): The secret string to redact.

    Returns:
        str: The redacted secret.
    """
    if not isinstance(secret, str):
        raise ValueError("Input must be a string")
    
    if len(secret) <= 5:
        return secret  # Return the secret as is if it's 5 characters or less

    return secret[:5] + '*' * (len(secret) - 5)

def update_tool():
    """Update the tool to the latest version."""
    logging.info("Updating the tool...")
    # Use 'pip3' for Python 3.x and 'pip' for Python 2.x or if Python 3.x is the default interpreter
    pip_command = "pip3" if sys.version_info.major == 3 else "pip"
    try:
        subprocess.run([pip_command, "install", "--upgrade",
                       f"{get_package_name()}"], check=True)
        logging.info(f"Tool updated to the latest version.")
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to update the tool: {e}")

def get_username_from_email(email: str) -> str:
    """
    Extracts the username from an email address and converts it to sentence case.

    Args:
        email (str): The email address from which to extract the username.

    Returns:
        str: The username in sentence case.
    """
    # Split the email at the "@" character to get the username
    username = email.split('@')[0]

    # Convert the username to sentence case
    sentence_case_username = ' '.join(
        word.capitalize() for word in username.split('.')
    )

    return sentence_case_username

def handle_active_status(
    provider: str,
    service: str,
    response_data: any,
    response_flag: bool,
    report: str,
    is_browser: bool
) -> ValidationResult:
    """
    Handle the active status of the service and format the response.

    Args:
        provider (str): The provider name.
        service (str): The name of the service.
        response_data (any): The response data from the service.
        response_flag (bool): Flag indicating whether to include response data.
        report (str): Report email address.
        is_browser (bool): Indicates if the function is called from a browser environment.

    Returns:
        ValidationResult: A structured response containing validation information.
    """
    res = get_secret_status_message(
        service,
        get_active_secret_status(),
        json.dumps(response_data.text, indent=4)
    )
    active_response_data = ValidationResult(
        status=response_data.status_code,
        app=appName,
        data=ValidationData(
            validate=ValidationProcess(
                state=res.state,
                message=res.message,
                response=json.loads(res.response),
                report=report if report else "email@how2validate.com"
            ),
            provider=provider,
            services=service,
        ),
        timestamp=get_current_timestamp()
    )

    # Log the result if not in the browser environment
    if not is_browser:
        logging.info(
            f"{res.message}" +
            (f"\nHere is the additional response data:\n{json.loads(res.response)}" if response_flag else "")
        )

    return active_response_data


def handle_inactive_status(
    provider: str,
    service: str,
    response_flag: bool,
    data: any = None,
    report: str = None,
    is_browser: bool = False
) -> ValidationResult:
    """
    Handle the case when the token is inactive or invalid.

    Args:
        provider (str): The name of the provider.
        service (str): The name of the service being validated.
        response_flag (bool): A flag to indicate whether to include detailed response data.
        data (any, optional): Optional additional data to include in the response.
        report (str, optional): Report email address.
        is_browser (bool): Indicates if the function is called from a browser environment.

    Returns:
        ValidationResult: A validation result object indicating the inactive status.
    """

    res = get_secret_status_message(
        service,
        get_inactive_secret_status(),
        json.dumps(data) if data else "No additional data."
    )

    inactive_response_data = ValidationResult(
        status=data.get('status'),
        app=appName, 
        data=ValidationData(
            validate=ValidationProcess(
                state=res.state,
                message=res.message,
                response=json.loads(res.response),
                report=report if report else "email@how2validate.com"
            ),
            provider=provider,
            services=service,
        ),
        timestamp=get_current_timestamp()
    )

    # Log the result if not in the browser environment
    if not is_browser:
        logging.info(
            f"{res.message}" +
            (f"\nHere is the additional response data:\n{json.loads(res.response)}" if response_flag else "")
        )

    return inactive_response_data

def handle_errors(
    provider: str,
    service: str,
    response_flag: bool,
    report: str,
    error: Exception,  # Using Exception to catch all types of errors
    is_browser: bool = False
) -> ValidationResult:
    """
    Handle errors that occur during the validation process.

    Args:
        provider (str): The name of the provider.
        service (str): The name of the service being validated.
        response_flag (bool): A flag to indicate whether to include detailed response data.
        report (str): Report email address.
        error (Exception): The error object that was thrown.
        is_browser (bool): Indicates if the function is called from a browser environment.

    Returns:
        ValidationResult: A validation result object based on the type of error.
    """

    if isinstance(error, requests.HTTPError):  # Check if it's an HTTP error
        status = error.response.status_code if error.response else 500
        error_data = error.response.json() if error.response and error.response.content else "Authentication failed."

        res = get_secret_status_message(
            service,
            get_inactive_secret_status(),
            json.dumps(error_data, indent=4)
        )

        err_response_data = ValidationResult(
            status=status,
            app=appName,  # Replace with the actual app name variable if defined
            data=ValidationData(
                validate=ValidationProcess(
                    state=res.state,
                    message=res.message,
                    response=json.loads(res.response),
                    report=report if report else "email@how2validate.com"
                ),
                provider=provider,
                services=service,
            ),
            timestamp=get_current_timestamp()
        )

        # Log the result if not in the browser environment
        if not is_browser:
            logging.info(
                f"{res.message}" +
                (f"\nHere is the additional response data:\n{json.loads(res.response)}" if response_flag else "")
            )

        return err_response_data

    # Handle unexpected errors
    return ValidationResult(
            status=500,
            app=appName,  # Replace with the actual app name variable if defined
            data=ValidationData(
                validate=ValidationProcess(
                    state=get_inactive_secret_status(),
                    message="An unexpected error occurred.",
                    response="{}",
                    report=report if report else "email@how2validate.com"
                ),
                provider=provider,
                services=service,
            ),
            timestamp=get_current_timestamp()
        )

def response_validation(res_data: ValidationResult, response_flag: bool) -> ValidationResult:
    """
    Validates the response and modifies the message field based on the response flag.

    Args:
        res_data (ValidationResult): The active response object that contains validation data.
        response_flag (bool): Flag to indicate whether to retain the original message or set it to an empty string.

    Returns:
        ValidationResult: Modified response data.
    """
    # Check if the `res_data` object has the required attributes and values
    if res_data.data and res_data.data.validate and res_data.data.validate.response:
        # Modifying the message based on the response_flag
        res_data.data.validate.response = res_data.data.validate.response if response_flag else ""

    return res_data