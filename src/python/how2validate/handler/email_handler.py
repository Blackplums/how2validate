import logging
import os
import json
import requests

# Load environment variables
from dotenv import load_dotenv

from how2validate.utility.interface import EmailResponse
from how2validate.utility.tool_utility import get_username_from_email
load_dotenv()

def send_email(email_response: EmailResponse) -> None:
    """
    Sends an email using the ZeptoMail API. The email includes the results of a secret validation,
    passed as an EmailResponse object. The email is customized with the recipient's name, email,
    and merge information (like provider, state, service, and response) from the validation results.

    Parameters:
    - email_response (EmailResponse): An object containing details of the secret validation results (email, provider, state, service, and response).

    Returns:
    - None: Logs an error message if the email cannot be sent due to a failure in the email service.
    """
    url = "https://api.zeptomail.in/v1.1/email/template"

    # Construct the payload for the email
    payload = {
        "mail_template_key": os.getenv("TEMPLATE_KEY"),
        "from": {
            "address": os.getenv("FROM_EMAIL"),
            "name": os.getenv("FROM_NAME"),
        },
        "to": [
            {
                "email_address": {
                    "address": email_response.email,
                    "name": get_username_from_email(email_response.email),
                },
            },
        ],
        "merge_info": {
            "secret_provider": email_response.provider, # Secret provider (e.g., AWS, GCP)
            "secret_state": email_response.state, # State of the secret (e.g., active, inactive)
            "secret_service": email_response.service, # Name of the service (e.g., S3, EC2)
            "secret_report": email_response.response # Validation result (e.g., "Validation passed")
        },
        "subject": "How2Validate Secret Validation Report",
    }

    headers = {
        'accept': "application/json",
        'content-type': "application/json",
        'authorization': f"{os.getenv('ZEPTOMAIL_TOKEN')}",
    }

    try:
        # Send the POST request to the ZeptoMail API
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        return response

    except Exception as e:
        # Log any errors that occur during the email-sending process
        logging.error(f'Error sending report email:', e)