import argparse
import json
import logging
import re
import keyring
from typing import Union

from how2validate.utility.config_utility import get_version
from how2validate.utility.interface.validationResult import ValidationResult
from how2validate.utility.tool_utility import format_string, get_secretprovider, get_secretscope, get_secretservices, update_tool, validate_choice
from how2validate.utility.log_utility import setup_logging
from how2validate.handler.validator_handler import validator_handle_service
from how2validate.utility.token_utility import is_token_stored, save_token, delete_token, get_stored_token


# Custom formatter to remove choices display but keep custom help text
class CustomHelpFormatter(argparse.RawTextHelpFormatter):
    """
    Custom help formatter for the CLI tool to align and format options.

    Methods:
        _format_action_invocation: Overrides the default action invocation to align options.
    """

    def _format_action_invocation(self, action):
        """Format action invocation with aligned option strings."""
        parts = []
        if action.option_strings:
            # Format the option strings with a comma separator
            parts.append(', '.join(action.option_strings))
        if action.nargs in [argparse.OPTIONAL, argparse.ZERO_OR_MORE, argparse.ONE_OR_MORE]:
            parts.append(f"<{action.dest.upper()}>")
        return ' '.join(parts)

def validate_email(email: str) -> bool:
    """
    Validate the provided email format using a regular expression.

    Args:
        email (str): The email address to validate.

    Returns:
        bool: True if the email is valid, otherwise False.
    """
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def parse_arguments() -> argparse.Namespace:
    """
    Parse command-line arguments for the How2Validate CLI tool.

    Returns:
        argparse.Namespace: Parsed arguments as a namespace object.
    """
    parser = argparse.ArgumentParser(
        prog="How2Validate Tool",
        description="Validate various types of secrets for different services.",
        usage="%(prog)s [options]",
        epilog="Ensuring the authenticity of your secrets.",
        formatter_class=CustomHelpFormatter
    )

    # Retrieve choices from environment variables or configuration
    provider = get_secretprovider()
    services = get_secretservices()

    # Define the CLI arguments
    parser.add_argument('-secretscope', action='store_true',
                        help='Explore the secret universe. Your next target awaits.')
    parser.add_argument('-p', '--provider', type=lambda s: validate_choice(s, provider), required=False,
                        help='Specify your provider. Unleash your validation arsenal.')
    parser.add_argument('-s', '--service', type=lambda s: validate_choice(s, services), required=False,
                        help='Specify your target service. Validate your secrets with precision.')
    parser.add_argument('-sec', '--secret', required=False,
                        help='Unveil your secrets to verify their authenticity.')
    parser.add_argument('-r', '--response', action='store_true',
                        help='Monitor the status. View if your secret is Active or InActive.')
    parser.add_argument('-R', '--report', action='store_true', default=False,
                        help='Get detailed reports. Receive validated secrets via email [Alpha Feature].')
    parser.add_argument('-token', type=str, required=False,
                        help='Secure your token in the vault, fetch it on demand, or shred it when done. (SubCommands: "delete", "list")')
    parser.add_argument('-v', '--version', action='version', version=f'How2Validate Tool version {get_version()}',
                        help='Expose the version.')
    parser.add_argument('--update', action='store_true',
                        help='Hack the tool to the latest version.')

    # Parse the arguments
    args = parser.parse_args()

    # Validate the email if the report option is provided
    if args.report and not is_token_stored():
        parser.error(f"No API Token found. Use '-token' option to store one.")

    return args

def validate(provider: str, service: str, secret: str, response: bool, report: bool = False, isBrowser: bool = True) -> Union[ValidationResult, str]:
    """
    Validate the provided secret using the specified provider and service.

    Args:
        provider (str): The provider to use for validation.
        service (str): The service to validate the secret with.
        secret (str): The secret to be validated.
        response (bool): Whether to get a response status for the secret.
        report (bool): The report option , Use after storing valida token. Defaults to False.
        isBrowser (bool, optional): Whether the validation is performed in a browser. Defaults to True.

    Returns:
        Union[ValidationResult, str]: The validation result or error message.

    Raises:
        ValueError: If the report email is invalid.
    """
    logging.info(f"Started validating secret...")
    if isBrowser and report and not is_token_stored():
        logging.error(f"No valid token found. Please store one using `-token` flag.")
    else:
        result = validator_handle_service(format_string(provider), format_string(service), secret, response, report, isBrowser)
        return json.dumps(result.to_dict(), indent=4)

def main(args=None):
    """
    Main function to execute the How2Validate CLI tool logic.

    Args:
        args (argparse.Namespace, optional): Parsed arguments from the command-line. Defaults to None.
    """
    setup_logging()
    if args is None:
        args = parse_arguments()

    if args.update:
        try:
            logging.info("Initiating tool update...")
            update_tool()
            logging.info("Tool updated successfully.")
        except Exception as e:
            logging.error(f"Error during tool update: {e}")
        return
    
    if args.secretscope:
        try:
            get_secretscope()
        except Exception as e:
            logging.error(f"Error fetching Scoped secret services: {e}")
        return
    
    if args.token is not None:
        if args.token.lower() == "delete":
            try:
                delete_token()
                logging.info("API Token deleted successfully.")
            except keyring.errors.PasswordDeleteError:
                logging.error("No API Token found to delete.")
            return
        elif args.token.lower() == "list":
            token = get_stored_token()
            if token:
                logging.info(f"Stored API Token: {token}")
            else:
                logging.error("No API Token found. Use '-token' option to store one.")
            return
        elif (
            not args.token
            or not isinstance(args.token, str)
            or not args.token.startswith("h2v-")
            or len(args.token) != 52 
        ):
            logging.error("Invalid API Token. Token must be a non-empty string starting with 'h2v-'.\nSee https://how2validate.vercel.app/apitoken for details.")
            return
        try:
            delete_token()
        except keyring.errors.PasswordDeleteError:
            pass
        save_token(args.token)
        logging.info("Token stored/updated successfully.")
        return

    if not args.provider or not args.service or not args.secret:
        logging.error("Missing required arguments: -Provider, -Service, -Secret")
        logging.error("Use '-h' or '--help' for usage information.")
        return
    
    if args.report and (not args.provider or not args.service or not args.secret):
        logging.error("Missing required arguments: -Provider, -Service, -Secret")
        logging.error("Use '-h' or '--help' for usage information.")
        return

    try:
        logging.info(f"Initiating validation for service: {args.service} with a provided secret.")
        result = validate(args.provider, args.service, args.secret, args.response, args.report, False)
        logging.info("Validation completed successfully.")
    except Exception as e:
        logging.error(f"An error occurred during validation: {e}")
