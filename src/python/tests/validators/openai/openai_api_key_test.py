import sys
import pytest
import argparse
import requests


from how2validate.validator import main
from how2validate.utility.tool_utility import get_current_timestamp, get_secretservices, get_secretprovider, validate_choice
from how2validate.validators.openai.openai_api_key import validate_openai_api_key

#Mock the current timestamp
current_timestamp = get_current_timestamp()

def test_validate_valid_key(mocker):
    """Test validate_openai_api_key with a valid key."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 200
    mock_response.text = '{"status": "success"}'  # Set text to a valid JSON string
    mock_response.json.return_value = {"status": "success"}
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_active_status
    mock_active_response = mocker.MagicMock()
    mock_active_response.status = 200
    mock_active_response.app = "How2Validate"
    mock_active_response.data.validate.state = "Active"
    mock_active_response.data.validate.message = "The provided secret 'openai_api_key' is currently active and operational."
    mock_active_response.data.validate.response = '{"status": "success"}'
    mock_active_response.data.validate.report = "email@how2validate.com"
    mock_active_response.data.provider = "openai"
    mock_active_response.data.services = "openai_api_key"
    mock_active_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_active_status", return_value=mock_active_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="valid_key",
        response_flag=True,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 200
    assert result.app == "How2Validate"
    assert result.data.validate.state == "Active"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently active and operational."
    assert result.data.validate.response == '{"status": "success"}'
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp

def test_validate_invalid_key(mocker):
    """Test validate_openai_api_key with an invalid key."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 401
    mock_response.text = "No additional data."
    mock_response.raise_for_status.side_effect = requests.HTTPError(response=mock_response)
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_inactive_status
    mock_inactive_response = mocker.MagicMock()
    mock_inactive_response.status = 401
    mock_inactive_response.app = "How2Validate"
    mock_inactive_response.data.validate.state = "InActive"
    mock_inactive_response.data.validate.message = "The provided secret 'openai_api_key' is currently inactive and not operational."
    mock_inactive_response.data.validate.response = "No additional data."
    mock_inactive_response.data.validate.report = "email@how2validate.com"
    mock_inactive_response.data.provider = "openai"
    mock_inactive_response.data.services = "openai_api_key"
    mock_inactive_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_inactive_status", return_value=mock_inactive_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="invalid_key",
        response_flag=True,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 401
    assert result.app == "How2Validate"
    assert result.data.validate.state == "InActive"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently inactive and not operational."
    assert "No additional data." in result.data.validate.response
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp 

def test_validate_expired_key(mocker):
    """Test validate_openai_api_key with an expired API key."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 401
    mock_response.text = '{"error": "Expired key"}'
    mock_response.raise_for_status.side_effect = requests.HTTPError(response=mock_response)
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_inactive_status
    mock_expired_response = mocker.MagicMock()
    mock_expired_response.status = 401
    mock_expired_response.app = "How2Validate"
    mock_expired_response.data.validate.state = "InActive"
    mock_expired_response.data.validate.message = "The provided secret 'openai_api_key' is currently inactive and not operational."
    mock_expired_response.data.validate.response = '{"error": "Expired key"}'
    mock_expired_response.data.validate.report = "email@how2validate.com"
    mock_expired_response.data.provider = "openai"
    mock_expired_response.data.services = "openai_api_key"
    mock_expired_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_inactive_status", return_value=mock_expired_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="expired_key",
        response_flag=True,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 401
    assert result.app == "How2Validate"
    assert result.data.validate.state == "InActive"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently inactive and not operational."
    assert "No additional data." in result.data.validate.response
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp 

def test_validate_malformed_key(mocker):
    """Test validate_openai_api_key with a malformed API key."""
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 401
    mock_response.text = '{"error": "Malformed key"}'
    mock_response.raise_for_status.side_effect = requests.HTTPError(response=mock_response)
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_inactive_status
    mock_malformed_response = mocker.MagicMock()
    mock_malformed_response.status = 401
    mock_malformed_response.app = "How2Validate"
    mock_malformed_response.data.validate.state = "InActive"
    mock_malformed_response.data.validate.message = "The provided secret 'openai_api_key' is currently inactive and not operational."
    mock_malformed_response.data.validate.response = '{"error": "Malformed key"}'
    mock_malformed_response.data.validate.report = "email@how2validate.com"
    mock_malformed_response.data.provider = "openai"
    mock_malformed_response.data.services = "openai_api_key"
    mock_malformed_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_inactive_status", return_value=mock_malformed_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="expired_key",
        response_flag=True,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 401
    assert result.app == "How2Validate"
    assert result.data.validate.state == "InActive"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently inactive and not operational."
    assert "No additional data." in result.data.validate.response
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp 

def test_validate_with_response_flag_true(mocker):
    """Test validate_openai_api_key with response_flag set to True."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 200
    mock_response.text = '{"status": "success"}'
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_active_status
    mock_response_flag_response = mocker.MagicMock()
    mock_response_flag_response.status = 200
    mock_response_flag_response.app = "How2Validate"
    mock_response_flag_response.data.validate.state = "Active"
    mock_response_flag_response.data.validate.message = "The provided secret 'openai_api_key' is currently active and operational."
    mock_response_flag_response.data.validate.response = '{"status": "success"}'
    mock_response_flag_response.data.validate.report = "email@how2validate.com"
    mock_response_flag_response.data.provider = "openai"
    mock_response_flag_response.data.services = "openai_api_key"
    mock_response_flag_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_active_status", return_value=mock_response_flag_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="valid_key",
        response_flag=True,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 200
    assert result.app == "How2Validate"
    assert result.data.validate.state == "Active"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently active and operational."
    assert result.data.validate.response == '{"status": "success"}'
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp 

def test_validate_with_response_flag_false(mocker):
    """Test validate_openai_api_key with response_flag set to False."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 200
    mock_response.text = '{"status": "success"}'
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_active_status
    mock_response_flag_response = mocker.MagicMock()
    mock_response_flag_response.status = 200
    mock_response_flag_response.app = "How2Validate"
    mock_response_flag_response.data.validate.state = "Active"
    mock_response_flag_response.data.validate.message = "The provided secret 'openai_api_key' is currently active and operational."
    mock_response_flag_response.data.validate.report = "email@how2validate.com"
    mock_response_flag_response.data.provider = "openai"
    mock_response_flag_response.data.services = "openai_api_key"
    mock_response_flag_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_active_status", return_value=mock_response_flag_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="valid_key",
        response_flag=False,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 200
    assert result.app == "How2Validate"
    assert result.data.validate.state == "Active"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently active and operational."
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp 

def test_validate_without_response_flag(mocker):
    """Test validate_openai_api_key with response_flag missing (default behavior)."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 200
    mock_response.text = '{"status": "success"}'
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_active_status
    mock_response_flag_response = mocker.MagicMock()
    mock_response_flag_response.status = 200
    mock_response_flag_response.app = "How2Validate"
    mock_response_flag_response.data.validate.state = "Active"
    mock_response_flag_response.data.validate.message = "The provided secret 'openai_api_key' is currently active and operational."
    mock_response_flag_response.data.validate.report = "email@how2validate.com"
    mock_response_flag_response.data.provider = "openai"
    mock_response_flag_response.data.services = "openai_api_key"
    mock_response_flag_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_active_status", return_value=mock_response_flag_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="valid_key",
        response_flag=False,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 200
    assert result.app == "How2Validate"
    assert result.data.validate.state == "Active"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently active and operational."
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp 

def test_validate_with_provider_services(mocker):
    """Test validate_openai_api_key with valid provider and service."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 200
    mock_response.text = '{"status": "success"}'
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_active_status
    mock_provider_service_response = mocker.MagicMock()
    mock_provider_service_response.status = 200
    mock_provider_service_response.app = "How2Validate"
    mock_provider_service_response.data.validate.state = "Active"
    mock_provider_service_response.data.validate.message = "The provided secret 'openai_api_key' is currently active and operational."
    mock_provider_service_response.data.validate.report = "email@how2validate.com"
    mock_provider_service_response.data.provider = "openai"
    mock_provider_service_response.data.services = "openai_api_key"
    mock_provider_service_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_active_status", return_value=mock_provider_service_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="valid_key",
        response_flag=False,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 200
    assert result.app == "How2Validate"
    assert result.data.validate.state == "Active"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently active and operational."
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp 

def test_validate_with_invalid_provider(mocker):
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

def test_validate_with_invalid_services(mocker):
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

def test_validate_with_empty_secret(mocker, capsys):
    """Test validate_openai_api_key with empty secret string."""

    # Mock sys.argv to simulate missing value for -sec
    mocker.patch.object(sys, "argv", ["main.py", "-p", "openai", "-s", "openai_api_key", "-sec"])

    # Call the main function and expect a SystemExit exception
    with pytest.raises(SystemExit) as excinfo:
        main()

    # Capture the output
    captured = capsys.readouterr()

    # Assertions
    assert excinfo.value.code == 2  # SystemExit with code 2 indicates an argparse error
    assert "argument -sec/--secret: expected one argument" in captured.err


def test_validate_with_none_secret(mocker):
    """Test validate_openai_api_key with None as secret."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 401
    mock_response.text = "No additional data."
    mock_response.raise_for_status.side_effect = requests.HTTPError(response=mock_response)
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_with_none_secret_status
    mock_with_none_secret_response = mocker.MagicMock()
    mock_with_none_secret_response.status = 401
    mock_with_none_secret_response.app = "How2Validate"
    mock_with_none_secret_response.data.validate.state = "with_none_secret"
    mock_with_none_secret_response.data.validate.message = "The provided secret 'openai_api_key' is currently inactive and not operational."
    mock_with_none_secret_response.data.validate.response = "No additional data."
    mock_with_none_secret_response.data.validate.report = "email@how2validate.com"
    mock_with_none_secret_response.data.provider = "openai"
    mock_with_none_secret_response.data.services = "openai_api_key"
    mock_with_none_secret_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_inactive_status", return_value=mock_with_none_secret_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret=None,
        response_flag=True,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 401
    assert result.app == "How2Validate"
    assert result.data.validate.state == "InActive"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently inactive and not operational."
    assert "No additional data." in result.data.validate.response
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp 

def test_validate_server_error(mocker):
    """Test validate_openai_api_key with HTTP 500 Internal Server Error."""

    # Mock the how2validate.validators.openai.openai_api_key.requests.get response to raise an HTTPError
    mock_response = mocker.MagicMock()
    mock_response.status_code = 500
    mock_response.text = '{"error": "Server error"}' 
    mock_response.raise_for_status.side_effect = requests.HTTPError(response=mock_response)
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_errors
    mock_error_response = mocker.MagicMock()
    mock_error_response.data.validate.state = "error"
    mock_error_response.data.validate.message = "Server error"
    mock_error_response.to_dict.return_value = {"state": "error", "message": "Server error"}
    mocker.patch("how2validate.utility.tool_utility.handle_errors", return_value=mock_error_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="valid_api_key",
        response_flag=True,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 500
    assert result.app == "How2Validate"
    assert result.data.validate.state == "InActive"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently inactive and not operational."
    assert "No additional data." in result.data.validate.response
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp 

def test_validate_unexpected_http_status(mocker):
    """Test validate_openai_api_key with an unexpected HTTP status code (e.g., 403 or 429)."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response to return an unexpected HTTP status code
    mock_response = mocker.MagicMock()
    mock_response.status_code = 403
    mock_response.text = '{"error": "Forbidden"}'
    mock_response.raise_for_status.side_effect = requests.HTTPError(response=mock_response)
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_errors for unexpected HTTP status
    mock_unexpected_status_response = mocker.MagicMock()
    mock_unexpected_status_response.status = 403
    mock_unexpected_status_response.app = "How2Validate"
    mock_unexpected_status_response.data.validate.state = "InActive"
    mock_unexpected_status_response.data.validate.message = "The provided secret 'openai_api_key' is currently inactive and not operational."
    mock_unexpected_status_response.data.validate.response = "No additional data."
    mock_unexpected_status_response.data.validate.report = None
    mock_unexpected_status_response.data.provider = "openai"
    mock_unexpected_status_response.data.services = "openai_api_key"
    mock_unexpected_status_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_errors", return_value=mock_unexpected_status_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="valid_key",
        response_flag=True,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 403
    assert result.app == "How2Validate"
    assert result.data.validate.state == "InActive"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently inactive and not operational."
    assert "No additional data." in result.data.validate.response
    assert result.data.validate.report == "email@how2validate.com"
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp

def test_validate_in_browser_environment(mocker):
    """Test validate_openai_api_key in browser environment."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 200
    mock_response.text = '{"status": "success"}'
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_active_status
    mock_active_response = mocker.MagicMock()
    mock_active_response.status = 200
    mock_active_response.app = "How2Validate"
    mock_active_response.data.validate.state = "Active"
    mock_active_response.data.validate.message = "The provided secret 'openai_api_key' is currently active and operational."
    mock_active_response.data.validate.response = '{"status": "success"}'
    mock_active_response.data.validate.report = None
    mock_active_response.data.provider = "openai"
    mock_active_response.data.services = "openai_api_key"
    mock_active_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_active_status", return_value=mock_active_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="valid_key",
        response_flag=True,
        report=None,
        is_browser=True
    )

    # Assertions
    assert result.status == 200
    assert result.app == "How2Validate"
    assert result.data.validate.state == "Active"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently active and operational."
    assert result.data.validate.response == '{"status": "success"}'
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp

def test_validate_in_non_browser_environment(mocker):
    """Test validate_openai_api_key in non-browser environment."""
    
    # Mock the how2validate.validators.openai.openai_api_key.requests.get response
    mock_response = mocker.MagicMock()
    mock_response.status_code = 200
    mock_response.text = '{"status": "success"}'
    mocker.patch("how2validate.validators.openai.openai_api_key.requests.get", return_value=mock_response)

    # Mock handle_active_status
    mock_active_response = mocker.MagicMock()
    mock_active_response.status = 200
    mock_active_response.app = "How2Validate"
    mock_active_response.data.validate.state = "Active"
    mock_active_response.data.validate.message = "The provided secret 'openai_api_key' is currently active and operational."
    mock_active_response.data.validate.response = '{"status": "success"}'
    mock_active_response.data.validate.report = None
    mock_active_response.data.provider = "openai"
    mock_active_response.data.services = "openai_api_key"
    mock_active_response.timestamp = current_timestamp
    mocker.patch("how2validate.utility.tool_utility.handle_active_status", return_value=mock_active_response)

    # Call the function
    result = validate_openai_api_key(
        provider="openai",
        service="openai_api_key",
        secret="valid_key",
        response_flag=True,
        report=None,
        is_browser=False
    )

    # Assertions
    assert result.status == 200
    assert result.app == "How2Validate"
    assert result.data.validate.state == "Active"
    assert result.data.validate.message == "The provided secret 'openai_api_key' is currently active and operational."
    assert result.data.validate.response == '{"status": "success"}'
    assert result.data.provider == "openai"
    assert result.data.services == "openai_api_key"
    assert result.timestamp

