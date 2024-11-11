from typing import Union

# list of Validators imported
from how2validate.validators.adafruit.adafruit_io_key import validate_adafruit_io_key
from how2validate.validators.npm.npm_access_token import validate_npm_access_token
from how2validate.validators.snyk.snyk_auth_key import validate_snyk_auth_key
from how2validate.validators.sonarcloud.sonarcloud_token import validate_sonarcloud_token

from how2validate.utility.interface.validationResult import ValidationResult


# Create a dictionary that maps service names to their corresponding validator functions
service_handlers = {
    "adafruit_io_key": validate_adafruit_io_key,
    "npm_access_token": validate_npm_access_token,
    "snyk_auth_key": validate_snyk_auth_key,
    "sonarcloud_token": validate_sonarcloud_token,
    # Add additional service validators as needed
}

def validator_handle_service(
        provider: str,
        service: str,
        secret: str,
        response: bool,
        report: str,
        is_browser: bool = True
    ) -> Union[ValidationResult, str]:
    """
    Handles the validation of a service's secret.

    This function retrieves the appropriate validator function for the specified service
    and invokes it with the provided secret and other parameters.

    :param provider: The name of the provider for the service to validate.
    :param service: The name of the service to validate.
    :param secret: The secret (e.g., API key, token) to validate.
    :param response: A boolean indicating whether to include response data in the output.
    :param report: An email address for sending validation reports (required).
    :param is_browser: Boolean to indicate if the validation is in a browser environment.
    :returns: A ValidationResult object or an error message string.
    """
    # Retrieve the handler function based on the provided service name
    handler = service_handlers.get(service)

    if handler:
        # If a handler exists, call it with the provided parameters
        return handler(provider, service, secret, response, report, is_browser)
    else:
        # Return an error message if no handler is found for the given service
        return f"Error: No handler for service '{service}'"
