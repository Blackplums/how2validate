# How2Validate

**How2Validate** is a security-focused tool designed to validate sensitive secrets by querying official secret provider endpoints. It provides real-time feedback on the authenticity of the credentials, ensuring that the secrets are valid.

## Why How2Validate?
The need for **How2Validate** arises from the growing concern of exposing sensitive information in various applications, repositories, and environments. Leaked API keys, invalid credentials, and misconfigured secrets can lead to significant security vulnerabilities. **How2Validate** helps mitigate these risks by verifying secrets directly with the official providers before they are used in any system.

## Features

- **Validate API keys, passwords, and sensitive information**: It interacts with official provider authentication endpoints to ensure the authenticity of the secrets.
- **Cross-platform support**: Packages available for JavaScript, Python, and Docker environments.
- **Easy to use**: Simplifies secret validation with straightforward commands and functions.
- **Real-time feedback**: Instantly know the status of your secrets — whether they are valid or not.

## How It Works

**How2Validate** utilizes the official authentication endpoints provided by different service providers (like NPM, GitHub, Snyk, etc.) to validate secrets such as API keys, tokens, and other sensitive data. By querying these trusted endpoints, **How2Validate** ensures that the secrets are correct and not expired or invalid.

For every provider, **How2Validate** relies on well-maintained libraries and packages suggested by those providers to handle the authentication process.

## Detailed CLI Help

The **How2Validate** tool provides multiple command-line options for validating secrets with precision.

To see all available commands, use:

```bash
how2validate --help

usage: How2Validate Tool [options]

Validate various types of secrets for different services.

options:
  -h, --help      show this help message and exit
  -secretscope    Explore the secret universe. Your next target awaits.
  -p, --provider  Specify your provider. Unleash your validation arsenal.
  -s, --service   Specify your target service. Validate your secrets with precision.
  -sec, --secret  Unveil your secrets to verify their authenticity.
  -r, --response  Monitor the status. View if your secret is Active or InActive.
  -R, --report    Get detailed reports. Receive validated secrets via email [Alpha Feature].
  -v, --version   Expose the version.
  --update        Hack the tool to the latest version.

Ensuring the authenticity of your secrets.
```

## How to Utilize the Functions

**How2Validate** can be easily installed and used programmatically within Python projects.

### Install the package:

```py
pip install how2validate
```

### Import the package and use the validate function:

```py
from how2validate import validate

# Validate secrets programmatically
validation_result = validate(provider,service, secret, response, report)
print(validation_result)

```

### Example usage of validate function:

```py
from how2validate import validate

# Validate secrets programmatically
validation_result = validate(
    provider="NPM",
    service="NPM Access Token",
    secret="<<SECRET_HERE>>",
    response=False,
    report="useremail@domain.com"
)
print(validation_result)

```