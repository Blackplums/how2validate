from typing import Optional, Any

class ValidationResult:
    def __init__(self, status: int, app: str, data: Optional['ValidationData'] = None, error: Optional['ValidationError'] = None, timestamp: str = ""):
        self.status = status
        self.app = app
        self.data = data or ValidationData()
        self.error = error or ValidationError("")
        self.timestamp = timestamp

    def __repr__(self):
        return f"ValidationResult(status={self.status}, app={self.app}, data={self.data}, error={self.error}, timestamp={self.timestamp})"


class ValidationData:
    def __init__(self, validate: Optional['ValidationProcess'] = None, provider: Optional[str] = None, services: Optional[str] = None):
        self.validate = validate or ValidationProcess("", "", "")
        self.provider = provider
        self.services = services

    def __repr__(self):
        return f"ValidationData(validate={self.validate}, provider={self.provider}, services={self.services})"


class ValidationProcess:
    def __init__(self, state: str, message: str, response: Any, report: Optional[str] = None):
        self.state = state
        self.message = message
        self.response = response
        self.report = report

    def __repr__(self):
        return f"ValidationProcess(state={self.state}, message={self.message}, response={self.response}, report={self.report})"


class ValidationError:
    def __init__(self, message: str):
        self.message = message

    def __repr__(self):
        return f"ValidationError(message={self.message})"
