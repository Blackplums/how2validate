from .secretStatusMessage import SecretStatusMessage


class EmailResponse(SecretStatusMessage):
    """
    Extends SecretStatusMessage to include provider and service.

    Attributes:
        provider (str): The provider associated with the validation.
        service (str): The service associated with the validation.
    """

    def __init__(self, email: str, state: str, message: str, response: str, provider: str, service: str):
        """
        Initializes an EmailResponse object.

        :param email: The email id to send validation report.
        :param state: The current state of the validation.
        :param message: A message describing the validation result.
        :param response: The response from the validation process.
        :param provider: The provider associated with the validation.
        :param service: The service associated with the validation.
        """
        super().__init__(state, message, response)
        self.email = email
        self.provider = provider
        self.service = service
