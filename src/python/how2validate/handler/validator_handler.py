from typing import Union

# list of Validators imported
from how2validate.validators.adafruit.adafruit_io_key import validate_adafruit_io_key
from how2validate.validators.aiven.aiven_auth_token import validate_aiven_auth_token
from how2validate.validators.anthropic.anthropic_api_key import validate_anthropic_api_key
from how2validate.validators.github.github_personal_access_token import validate_github_personal_access_token
from how2validate.validators.hugging_face.hf_org_api_key import validate_hf_org_api_key
from how2validate.validators.hugging_face.hf_user_access_token import validate_hf_user_access_token
from how2validate.validators.npm.npm_access_token import validate_npm_access_token
from how2validate.validators.openai.openai_api_key import validate_openai_api_key
from how2validate.validators.pagerduty.pagerduty_api_key import validate_pagerduty_api_key
from how2validate.validators.sentry.sentry_auth_token import validate_sentry_auth_token
from how2validate.validators.slack.slack_api_token import validate_slack_api_token
from how2validate.validators.snyk.snyk_auth_key import validate_snyk_auth_key
from how2validate.validators.sonarcloud.sonarcloud_token import validate_sonarcloud_token

from how2validate.utility.interface.validationResult import ValidationResult


# Create a dictionary that maps service names to their corresponding validator functions
service_handlers = {
    "adafruit_io_key": validate_adafruit_io_key,
    "aiven_auth_token": validate_aiven_auth_token,
    "anthropic_api_key": validate_anthropic_api_key,
    "github_personal_access_token": validate_github_personal_access_token,
    "hf_org_api_key": validate_hf_org_api_key,
    "hf_user_access_token": validate_hf_user_access_token,
    "npm_access_token": validate_npm_access_token,
    "openai_api_key": validate_openai_api_key,
    "pagerduty_api_key": validate_pagerduty_api_key,
    "sentry_auth_token": validate_sentry_auth_token,
    "slack_api_token": validate_slack_api_token,
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
