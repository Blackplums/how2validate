import argparse
import pytest
from how2validate.validator import validate_email, parse_arguments, validate, main
from how2validate.utility.interface.validationResult import ValidationResult
from how2validate.utility.tool_utility import get_secretprovider, get_secretservices, validate_choice, get_current_timestamp

#Mock the current timestamp
current_timestamp = get_current_timestamp()

def test_parse_arguments_valid(mocker):
    """Test parse_arguments with valid arguments."""
    mocker.patch('how2validate.validator.get_secretprovider', return_value=["aws", "azure"])
    mocker.patch('how2validate.validator.get_secretservices', return_value=["s3", "keyvault"])
    mocker.patch('argparse.ArgumentParser.parse_args', return_value=mocker.MagicMock(
        provider="aws",
        service="s3",
        secret="dummy_secret",
        response=True,
        report=None,
        update=False,
        secretscope=False
    ))

    args = parse_arguments()
    assert args.provider == "aws"
    assert args.service == "s3"
    assert args.secret == "dummy_secret"

def test_validate_success(mocker):
    """Test validate function with valid inputs."""
    mock_result = mocker.MagicMock()
    mock_result.to_dict.return_value = {"status": "success"}
    mocker.patch('how2validate.validator.validator_handle_service', return_value=mock_result)

    result = validate("aws", "s3", "dummy_secret", True, None, False)
    assert '"status": "success"' in result

def test_main_with_valid_arguments(mocker):
    """Test the main function with valid arguments."""
    # Mock the arguments
    mock_args = mocker.MagicMock(
        provider="aws",
        service="s3",
        secret="dummy_secret",
        response=True,
        report=False,
        update=False,
        secretscope=False,
        token=None 
    )

    # Mock dependencies
    mocker.patch('how2validate.validator.parse_arguments', return_value=mock_args)
    mocker.patch('how2validate.validator.setup_logging')
    mock_validate = mocker.patch('how2validate.validator.validate', return_value='{"status": "success"}')

    # Call the main function
    main(mock_args)

    # Assertions
    mock_validate.assert_called_once_with(
        "aws", "s3", "dummy_secret", True, False, False
    )

def test_main_missing_arguments(mocker):
    """Test the main function with missing required arguments."""
    # Mock the arguments with missing provider, service, and secret
    mock_args = mocker.MagicMock(
        provider=None,
        service=None,
        secret=None,
        response=True,
        report=None,
        update=False,
        secretscope=False,
        token=None  # Add token argument
    )

    # Mock dependencies
    mocker.patch('how2validate.validator.parse_arguments', return_value=mock_args)
    mocker.patch('how2validate.validator.setup_logging')
    mock_logging_error = mocker.patch('how2validate.validator.logging.error')

    # Call the main function
    main(mock_args)

    # Assertions
    mock_logging_error.assert_any_call("Missing required arguments: -Provider, -Service, -Secret")
    mock_logging_error.assert_any_call("Use '-h' or '--help' for usage information.")

def test_main_with_token_delete(mocker):
    """Test the main function with the token delete argument."""
    mock_args = mocker.MagicMock(
        provider=None,
        service=None,
        secret=None,
        response=False,
        report=None,
        update=False,
        secretscope=False,
        token="delete"
    )
    mocker.patch('how2validate.validator.parse_arguments', return_value=mock_args)
    mocker.patch('how2validate.validator.setup_logging')
    mock_delete_token = mocker.patch('how2validate.validator.delete_token')
    mock_logging_info = mocker.patch('how2validate.validator.logging.info')

    main(mock_args)
    mock_delete_token.assert_called_once()
    mock_logging_info.assert_any_call("API Token deleted successfully.")

def test_main_with_invalid_token(mocker):
    """Test the main function with an invalid token argument."""
    mock_args = mocker.MagicMock(
        provider=None,
        service=None,
        secret=None,
        response=False,
        report=None,
        update=False,
        secretscope=False,
        token="invalid_token"
    )
    mocker.patch('how2validate.validator.parse_arguments', return_value=mock_args)
    mocker.patch('how2validate.validator.setup_logging')
    mock_logging_error = mocker.patch('how2validate.validator.logging.error')

    main(mock_args)
    mock_logging_error.assert_any_call(
        "Invalid API Token. Token must be a non-empty string starting with 'h2v-'.\nSee https://how2validate.vercel.app/apitoken for details."
    )

def test_main_with_valid_token(mocker):
    """Test the main function with a valid token argument."""
    valid_token = "h2v-" + "x" * 48  # Example valid token
    mock_args = mocker.MagicMock(
        provider=None,
        service=None,
        secret=None,
        response=False,
        report=None,
        update=False,
        secretscope=False,
        token=valid_token
    )
    mocker.patch('how2validate.validator.parse_arguments', return_value=mock_args)
    mocker.patch('how2validate.validator.setup_logging')
    mock_delete_token = mocker.patch('how2validate.validator.delete_token')
    mock_save_token = mocker.patch('how2validate.validator.save_token')
    mock_logging_info = mocker.patch('how2validate.validator.logging.info')

    main(mock_args)
    mock_delete_token.assert_called_once()
    mock_save_token.assert_called_once_with(valid_token)
    mock_logging_info.assert_any_call("Token stored/updated successfully.")


def test_main_with_update(mocker):
    """Test the main function with the update flag."""
    # Mock the arguments with the update flag
    mock_args = mocker.MagicMock(
        provider=None,
        service=None,
        secret=None,
        response=False,
        report=None,
        update=True,
        secretscope=False
    )

    # Mock dependencies
    mocker.patch('how2validate.validator.parse_arguments', return_value=mock_args)
    mocker.patch('how2validate.validator.setup_logging')
    mock_update_tool = mocker.patch('how2validate.validator.update_tool')
    mock_logging_info = mocker.patch('how2validate.validator.logging.info')

    # Call the main function
    main(mock_args)

    # Assertions
    mock_update_tool.assert_called_once()
    mock_logging_info.assert_any_call("Initiating tool update...")
    mock_logging_info.assert_any_call("Tool updated successfully.")


def test_main_with_secretscope(mocker):
    """Test the main function with the secretscope flag."""
    # Mock the arguments with the secretscope flag
    mock_args = mocker.MagicMock(
        provider=None,
        service=None,
        secret=None,
        response=False,
        report=None,
        update=False,
        secretscope=True
    )

    # Mock dependencies
    mocker.patch('how2validate.validator.parse_arguments', return_value=mock_args)
    mocker.patch('how2validate.validator.setup_logging')
    mock_get_secretscope = mocker.patch('how2validate.validator.get_secretscope')

    # Call the main function
    main(mock_args)

    # Assertions
    mock_get_secretscope.assert_called_once()

def test_with_provider_services(mocker):
    """Test with valid provider and service."""
    
    # Mock the requests.post response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 200
    mock_response.text = '{"status": "success"}'
    mocker.patch("requests.post", return_value=mock_response)

    # Mock handle_active_status
    mock_provider_service_response = mocker.MagicMock()
    mock_provider_service_response.status = 200
    mock_provider_service_response.app = "How2Validate"
    mock_provider_service_response.data.validate.state = "Active"
    mock_provider_service_response.data.validate.message = "The provided secret 'anthropic_api_key' is currently active and operational."
    mock_provider_service_response.data.validate.report = "email@how2validate.com"
    mock_provider_service_response.data.provider = "anthropic"
    mock_provider_service_response.data.services = "anthropic_api_key"
    mock_provider_service_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_active_status", return_value=mock_provider_service_response)

    # Call the function
    result = validate(
        provider="anthropic",
        service="anthropic_api_key",
        secret="valid_key",
        response=False,
        report=None,
        isBrowser=True
    )

    # Assertions
    assert result 

def test_with_invalid_provider(mocker):
    """Test validate_choice with an invalid service name."""
    
    # Call the function with an invalid service
    invalid_provider = "invalid_service"
    valid_provider = get_secretprovider()

    # Mock get_secretservices to return a list of valid provider
    mocker.patch("how2validate.utility.tool_utility.get_secretprovider", return_value=valid_provider)

    # Assertions
    with pytest.raises(argparse.ArgumentTypeError) as excinfo:
        validate_choice(invalid_provider, valid_provider)
    
    # Check the exception message
    assert str(excinfo.value) == f"Invalid choice: '{invalid_provider}'. Choose from {', '.join(valid_provider)}."

def test_with_invalid_services(mocker):
    """Test validate_choice with an invalid service name."""
    
    # Call the function with an invalid service
    invalid_service = "invalid_service"
    valid_services = get_secretservices()

    # Mock get_secretservices to return a list of valid services
    mocker.patch("how2validate.utility.tool_utility.get_secretservices", return_value=valid_services)

    # Assertions
    with pytest.raises(argparse.ArgumentTypeError) as excinfo:
        validate_choice(invalid_service, valid_services)
    
    # Check the exception message
    assert str(excinfo.value) == f"Invalid choice: '{invalid_service}'. Choose from {', '.join(valid_services)}."
