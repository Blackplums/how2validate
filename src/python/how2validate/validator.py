import argparse
import logging
import re
from typing import Union

from how2validate.utility.config_utility import get_version
from how2validate.utility.interface.validationResult import ValidationResult
from how2validate.utility.tool_utility import format_string, get_secretprovider, get_secretscope, get_secretservices, update_tool, validate_choice
from how2validate.utility.log_utility import setup_logging
from how2validate.handler.validator_handler import validator_handle_service

# Call the logging setup function
setup_logging()

# Custom formatter to remove choices display but keep custom help text
class CustomHelpFormatter(argparse.RawTextHelpFormatter):
    """Custom help formatter for aligned options."""

    def _format_action_invocation(self, action):
        """Format action invocation with aligned option strings."""
        parts = []
        if action.option_strings:
            # Format the option strings with a comma separator
            parts.append(', '.join(action.option_strings))
        if action.nargs in [argparse.OPTIONAL, argparse.ZERO_OR_MORE, argparse.ONE_OR_MORE]:
            parts.append(f"<{action.dest.upper()}>")
        return ' '.join(parts)

def validate_email(email):
    """Validate the provided email format."""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def parse_arguments():
    parser = argparse.ArgumentParser(
        prog="How2Validate Tool",
        description="Validate various types of secrets for different services.",
        usage="%(prog)s [options]",
        epilog="Ensuring the authenticity of your secrets.",
        formatter_class=CustomHelpFormatter
    )

    # Retrieve choices from environment variable
    provider = get_secretprovider()
    services = get_secretservices()

    # Define arguments
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
    parser.add_argument('-R', '--report', type=str, required=False,
                        help='Get detailed reports. Receive validated secrets via email [Alpha Feature].')
    parser.add_argument('-v', '--version', action='version', version=f'How2Validate Tool version {get_version()}',
                        help='Expose the version.')
    parser.add_argument('--update', action='store_true',
                        help='Hack the tool to the latest version.')

    # Parse the arguments
    args = parser.parse_args()

    # Check if the report argument is provided and validate the email
    if args.report and not validate_email(args.report):
        parser.error(f"Invalid email address: {args.report}")

    return args

def validate(provider:str, service:str, secret:str, response:bool, report:str, isBrowser:bool = True) -> Union[ValidationResult, str]:
    
    logging.info(f"Started validating secret...")
    if isBrowser:
        # Check if the report argument is provided and validate the email
        if report and not validate_email(report):
            logging.error(f"Invalid email address: {report}")
        else:
            result = validator_handle_service(format_string(provider), format_string(service), secret, response, report, isBrowser)
            # return f"{result}"

def main(args=None):
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

    if not args.provider or not args.service or not args.secret:
        logging.error("Missing required arguments: -Provider, -Service, -Secret")
        logging.error("Use '-h' or '--help' for usage information.")
        return
    
    # Check and validate the `--report` argument if required arguments missing 
    if args.report and (not args.provider or not args.service or not args.secret):
        logging.error("Missing required arguments: -Provider, -Service, -Secret")
        logging.error("Use '-h' or '--help' for usage information.")
        return

    try:
        logging.info(f"Initiating validation for service: {args.service} with a provided secret.")
        result = validate(args.provider, args.service, args.secret, args.response, args.report,False)
        logging.info("Validation completed successfully.")
    except Exception as e:
        logging.error(f"An error occurred during validation: {e}")