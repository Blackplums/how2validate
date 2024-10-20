import json
import requests

from how2validate.utility.config_utility import get_active_secret_status, get_inactive_secret_status
from how2validate.utility.log_utility import get_secret_status_message

def validate_snyk_auth_key(provider, service, secret, response, report, isBrowser):
    """
    Validates the Snyk API key by making a request to the Snyk user API.
    Raises an exception if the validation fails or returns an appropriate message if the token is inactive.

    Parameters:
    - service (str): The name of the service.
    - secret (str): The Snyk API key (secret) to validate.
    - response (bool): If True, the function will return the response data in addition to the status message.
    - report (bool): Unused parameter, assumed for future extension.

    Returns:
    - A status message indicating whether the secret is active or inactive.
    - Optionally, the response data if `response` is True.
    """
    
    # Snyk API endpoint for getting the user information
    url = "https://snyk.io/api/v1/user"
    
    # Headers to ensure no caching and to authorize the request using the provided API key (token)
    nocache_headers = {'Cache-Control': 'no-cache'}
    headers_map = {'Authorization': f'token {secret}'}

    try:
        # Send a GET request to the Snyk API with combined headers (nocache + authorization)
        response_data = requests.get(url, headers={**nocache_headers, **headers_map})
        
        # Raise an HTTPError if the response has an unsuccessful status code (4xx or 5xx)
        response_data.raise_for_status()

        # Check if the request was successful (HTTP 200)
        if response_data.status_code == 200:
            # If `response` is False, return the active status message without response data
            if not response:
                return get_secret_status_message(service, get_active_secret_status(), response)
            else:
                # Attempt to parse the JSON response and return it
                try:
                    json_response = response_data.json()
                    return get_secret_status_message(service, get_active_secret_status(), response, json.dumps(json_response, indent=4))
                except json.JSONDecodeError:
                    # Return an error message if the response isn't valid JSON
                    return get_secret_status_message(service, get_active_secret_status(), response, "Response is not a valid JSON.")
        else:
            # If the response status code is not 200, treat the secret as inactive
            if not response:
                return get_secret_status_message(service, get_inactive_secret_status(), response)
            else:
                # Return the status message along with the raw text of the response
                return get_secret_status_message(service, get_inactive_secret_status(), response, response_data.text)

    # Exception handling for specific HTTP errors
    except requests.HTTPError as e:
        if not response:
            return get_secret_status_message(service, get_inactive_secret_status(), response)
        else:
            return get_secret_status_message(service, get_inactive_secret_status(), response, e.response.text)

    # General request exceptions (e.g., network issues)
    except requests.RequestException as e:
        if not response:
            return get_secret_status_message(service, get_inactive_secret_status(), response)
        else:
            return get_secret_status_message(service, get_inactive_secret_status(), response, e.response.text)

    # Handle connection errors
    except requests.ConnectionError as e:
        if not response:
            return get_secret_status_message(service, get_inactive_secret_status(), response)
        else:
            return get_secret_status_message(service, get_inactive_secret_status(), response, e.response.text)

    # Handle incorrect URLs
    except requests.URLRequired as e:
        if not response:
            return get_secret_status_message(service, get_inactive_secret_status(), response)
        else:
            return get_secret_status_message(service, get_inactive_secret_status(), response, e.response.text)

    # Handle excessive redirects
    except requests.TooManyRedirects as e:
        if not response:
            return get_secret_status_message(service, get_inactive_secret_status(), response)
        else:
            return get_secret_status_message(service, get_inactive_secret_status(), response, e.response.text)

    # Handle connection timeouts
    except requests.ConnectTimeout as e:
        if not response:
            return get_secret_status_message(service, get_inactive_secret_status(), response)
        else:
            return get_secret_status_message(service, get_inactive_secret_status(), response, e.response.text)

    # Handle read timeouts
    except requests.ReadTimeout as e:
        if not response:
            return get_secret_status_message(service, get_inactive_secret_status(), response)
        else:
            return get_secret_status_message(service, get_inactive_secret_status(), response, e.response.text)

    # Handle request timeouts in general
    except requests.Timeout as e:
        if not response:
            return get_secret_status_message(service, get_inactive_secret_status(), response)
        else:
            return get_secret_status_message(service, get_inactive_secret_status(), response, e.response.text)

    # Handle JSON decoding errors
    except json.JSONDecodeError as e:
        if not response:
            return get_secret_status_message(service, get_inactive_secret_status(), response)
        else:
            return get_secret_status_message(service, get_inactive_secret_status(), response, e.response.text)
