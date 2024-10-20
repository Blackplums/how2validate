# src/python/how2validate/utility/log_utility.py

import logging
import sys
from how2validate.utility.config_utility import get_active_secret_status, get_inactive_secret_status
from how2validate.utility.interface.validationResult import ValidationProcess

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(message)s',
        handlers=[logging.StreamHandler(sys.stdout)]
    )

def get_secret_status_message(service, is_active, response_data) -> ValidationProcess:
    """
    Generates a formatted message regarding the status of a secret.
    
    Parameters:
    - service (str): The name of the service associated with the secret.
    - is_active (str): The current status of the secret (active or inactive).
    - response_data (any): Optional data to provide additional context, appended to the message if available.
    
    Returns:
    - dict (ValidationProcess): A formatted message describing the secret's status and any response data (if provided).
    
    Raises:
    - ValueError: If the is_active value is not recognized (neither active nor inactive).
    
    Example:
    >>> message = get_secret_status_message("Payment Service", get_active_secret_status())
    >>> print(message)
    "The provided secret 'Payment Service' is currently active and operational."
    """
    
    # Check if the secret is active or inactive based on the provided status
    if is_active == get_active_secret_status():
        state = get_active_secret_status()
        status = "active and operational"  # Set status message for active secret
    elif is_active == get_inactive_secret_status():
        state = get_inactive_secret_status()
        status = "inactive and not operational"  # Set status message for inactive secret
    else:
        raise ValueError(f"Unexpected is_active value: {is_active}. Expected 'Active' or 'InActive'.")

    # Base message about the secret's status
    message = f"The provided secret '{service}' is currently {status}."
    if response_data:
        response_data = f"\n{response_data}"

    return ValidationProcess(
                state=state,
                message=message,
                response=response_data if response_data else "{}"
            )