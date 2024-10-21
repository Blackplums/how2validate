from typing import Optional, Any

class ValidationError:
    """
    Represents an error that occurs during validation.

    Attributes:
        message (str): The error message describing the validation error.
    """
    def __init__(self, message: str):
        self.message = message

    def to_dict(self):
        """
        Converts the ValidationError instance to a dictionary representation.

        Returns:
            dict: A dictionary containing the error message.
        """
        return {"message": self.message}

class ValidationProcess:
    """
    Represents the validation process for a service.

    Attributes:
        state (str): The state of the validation process (e.g., 'active', 'inactive').
        message (str): A message providing details about the validation process.
        response (Any): The response data obtained from the validation.
        report (Optional[str]): An optional report email address for further inquiries.
    """
    def __init__(self, state: str, message: str, response: Any, report: Optional[str] = None):
        self.state = state
        self.message = message
        self.response = response
        self.report = report

    def to_dict(self):
        """
        Converts the ValidationProcess instance to a dictionary representation.

        Returns:
            dict: A dictionary containing the validation process details.
        """
        return {
            "state": self.state,
            "message": self.message,
            "response": self.response,
            "report": self.report
        }

class ValidationData:
    """
    Represents the validation data associated with a service.

    Attributes:
        validate (Optional[ValidationProcess]): The validation process details.
        provider (Optional[str]): The name of the provider being validated.
        services (Optional[str]): The name of the service being validated.
    """
    def __init__(self, validate: Optional[ValidationProcess] = None, provider: Optional[str] = None, services: Optional[str] = None):
        self.validate = validate or ValidationProcess("", "", "")
        self.provider = provider
        self.services = services

    def to_dict(self):
        """
        Converts the ValidationData instance to a dictionary representation.

        Returns:
            dict: A dictionary containing the validation data details.
        """
        return {
            "validate": self.validate.to_dict() if self.validate else None,
            "provider": self.provider,
            "services": self.services
        }

class ValidationResult:
    """
    Represents the result of a validation operation.

    Attributes:
        status (int): The HTTP status code of the validation result.
        app (str): The name of the application performing the validation.
        data (Optional[ValidationData]): The validation data associated with the result.
        error (Optional[ValidationError]): The error information, if any.
        timestamp (str): The timestamp of when the validation occurred.
    """
    def __init__(self, status: int, app: str, data: Optional[ValidationData] = None, error: Optional[ValidationError] = None, timestamp: str = ""):
        self.status = status
        self.app = app
        self.data = data or ValidationData()
        self.error = error or ValidationError("")
        self.timestamp = timestamp

    def to_dict(self):
        """
        Converts the ValidationResult instance to a dictionary representation.

        Returns:
            dict: A dictionary containing the validation result details.
        """
        result = {
            "status": self.status,
            "app": self.app,
            "data": self.data.to_dict() if self.data else None,
            "timestamp": self.timestamp
        }
        # Only include the error field if there is a non-empty error message
        if self.error and self.error.message:
            result["error"] = self.error.to_dict()
        return result
