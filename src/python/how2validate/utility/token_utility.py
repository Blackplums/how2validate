import keyring


def get_stored_token(service_name: str = "how2validate_cli") -> str:
    """
    Retrieve the stored API token from the system's keyring.

    Parameters:
    - service_name (str): The identifier under which the token is stored in the keyring.
                          Defaults to "how2validate_cli".

    Returns:
    - str: The stored API token, or None if no token is found.

    This function uses the system's secure keyring backend (e.g., macOS Keychain, Windows Credential Vault,
    or Secret Service on Linux) to fetch the previously stored token, allowing for seamless use across CLI sessions.
    """
    return keyring.get_password(service_name, "api_token")


def save_token(token: str, service_name: str = "how2validate_cli"):
    """
    Securely save the API token in the system's keyring.

    Parameters:
    - token (str): The API token to store securely.
    - service_name (str): The keyring namespace under which the token will be stored.
                          Defaults to "how2validate_cli".

    This enables the CLI tool to reuse the token without asking the user to re-enter it each time.
    The token is stored securely using the OS-level credentials store.
    """
    keyring.set_password(service_name, "api_token", token)


def delete_token(service_name: str = "how2validate_cli"):
    """
    Delete the stored API token from the system's keyring.

    Parameters:
    - service_name (str): The keyring namespace to delete the token from.
                          Defaults to "how2validate_cli".

    This is useful when the token is expired, revoked, or the user explicitly wants to de-authenticate.
    It ensures the token is no longer accessible by the CLI tool.
    """
    keyring.delete_password(service_name, "api_token")

def is_token_stored(service_name: str = "how2validate_cli", prefix: str = "h2v-") -> bool:
    """
    Check whether a valid stored token exists in the system's keyring.

    Parameters:
    - service_name (str): The identifier under which the token is stored. Defaults to "how2validate_cli".
    - prefix (str): Optional prefix the token must start with. Defaults to "h2v-".

    Returns:
    - bool: True if a token exists and is valid, otherwise False.
    """
    token = get_stored_token(service_name)
    if token and isinstance(token, str) and token.startswith(prefix):
        return True
    return False
