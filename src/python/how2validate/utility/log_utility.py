import logging
import sys
from typing import Any
from how2validate.utility.config_utility import get_active_secret_status, get_inactive_secret_status
from how2validate.utility.interface.validationResult import ValidationProcess

def setup_logging():
    """
    Configures the logging settings for the application.

    This function sets the logging level to INFO and specifies the log message format.
    It directs the log output to standard output (stdout).
    """
    logging.basicConfig(
        level=logging.INFO,
        format='%(message)s',
        handlers=[logging.StreamHandler(sys.stdout)]
    )

def get_secret_status_message(service: str, is_active: str, response_data: Any) -> ValidationProcess:
    """
    Generates a formatted message regarding the status of a secret.

    Args:
        service (str): The name of the service associated with the secret.
        is_active (str): The current status of the secret (active or inactive).
        response_data (Any): Optional data to provide additional context, appended to the message if available.

    Returns:
        ValidationProcess: A data class containing the state, status message, and optional response data.

    Raises:
        ValueError: If the is_active value is not recognized (neither active nor inactive).

    Example:
        >>> message = get_secret_status_message("Payment Service", get_active_secret_status(), None)
        >>> print(message.message)
        "The provided secret 'Payment Service' is currently active and operational."
    """
    
    # Check if the secret is active or inactive based on the provided status
    if is_active == get_active_secret_status():
        state = get_active_secret_status()  # Set state for active secret
        status = "active and operational"    # Set status message for active secret
    elif is_active == get_inactive_secret_status():
        state = get_inactive_secret_status()  # Set state for inactive secret
        status = "inactive and not operational"  # Set status message for inactive secret
    else:
        # Raise an error if the is_active value is not recognized
        raise ValueError(f"Unexpected is_active value: {is_active}. Expected 'Active' or 'InActive'.")

    # Construct the base message about the secret's status
    message = f"The provided secret '{service}' is currently {status}."
    
    # If response data is provided, append it to the message
    if response_data:
        response_data = f"\n{response_data}"

    # Return the ValidationProcess object containing the status and response
    return ValidationProcess(
        state=state,
        message=message,
        response=response_data if response_data else "{}"
    )
