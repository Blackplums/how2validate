class SecretStatusMessage:
    """
    Represents the structure of a validation result for the Snyk Auth Key.

    Attributes:
        state (str): The current state of the validation.
        message (str): A message describing the validation result.
        response (str): The response from the validation process.
    """

    def __init__(self, state: str, message: str, response: str):
        """
        Initializes a SecretStatusMessage object.

        :param state: The current state of the validation.
        :param message: A message describing the validation result.
        :param response: The response from the validation process.
        """
        self.state = state
        self.message = message
        self.response = response
