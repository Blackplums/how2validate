import json
import logging
import requests
from how2validate.handler.email_handler import send_email
from how2validate.utility.interface.EmailResponse import EmailResponse
from how2validate.utility.interface.validationResult import ValidationProcess, ValidationResult
from how2validate.utility.tool_utility import handle_active_status, handle_inactive_status, handle_errors, response_validation

def validate_github_personal_access_token(
    provider: str, 
    service: str, 
    secret: str, 
    response_flag: bool, 
    report: str, 
    is_browser: bool = True
) -> ValidationResult:
    """
    Validates a GitHub personal access token by making a request to the GitHub API.

    Parameters:
    - provider (str): The provider name (e.g., "GitHub").
    - service (str): The name of the service being validated.
    - secret (str): The GitHub personal access token to validate.
    - response_flag (bool): Flag to indicate whether detailed response data should be returned.
    - report (str): An optional email address to which a validation report should be sent.
    - is_browser (bool): Indicates if the function is called from a browser environment (default is True).

    Returns:
    - ValidationResult: A structured response indicating the validation results.
    """
    # Initialize the response structure as an instance of the ValidationProcess class
    validation_response = ValidationProcess(
        state="",
        message="",
        response=None,
        report="email@how2validate.com"
    )

    # GitHub API endpoint for validating a personal access token
    url = "https://api.github.com/user"
    
    # Headers for the API request
    nocache_headers = {'Cache-Control': 'no-cache'}
    headers = {'Authorization': f'Bearer {secret}'}

    try:
        # Send a GET request to the GitHub API
        response_data = requests.get(url, headers={**nocache_headers, **headers})
        # Raise an error for unsuccessful HTTP status codes
        response_data.raise_for_status()

        # Handle successful response (HTTP 200)
        if response_data.status_code == 200:
            active_response = handle_active_status(
                provider,
                service,
                response_data,
                response_flag,
                report,
                is_browser
            )

            validation_response.state = active_response.data.validate.state
            validation_response.message = active_response.data.validate.message
            validation_response.response = json.dumps(active_response.to_dict(), indent=4)

            return response_validation(active_response, response_flag)

    except requests.HTTPError as error:
        # Handle 4xx client errors
        if 400 <= error.response.status_code < 500:
            inactive_response = handle_inactive_status(
                provider,
                service,
                response_flag,
                error,
                report,
                is_browser
            )

            validation_response.state = inactive_response.data.validate.state
            validation_response.message = inactive_response.data.validate.message
            validation_response.response = json.dumps(inactive_response.to_dict(), indent=4)

            return response_validation(inactive_response, response_flag)

        # Handle 5xx server errors
        elif 500 <= error.response.status_code < 600:
            error_response = handle_errors(
                provider,
                service,
                response_flag,
                report,
                error,
                is_browser
            )

            validation_response.state = error_response.data.validate.state
            validation_response.message = error_response.data.validate.message
            validation_response.response = json.dumps(error_response.to_dict(), indent=4)

            return response_validation(error_response, response_flag)

    finally:
        # Send the validation result via email if a report email is provided
        if report:
            email_response = EmailResponse(
                email=report,
                provider=provider,
                service=service,
                state=validation_response.state,
                message=validation_response.message,
                response=validation_response.response,
            )
            try:
                send_email(email_response)
                logging.info('Validation report sent successfully')
            except Exception as e:
                logging.error('Error sending validation report', exc_info=True)
