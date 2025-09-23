![How2Validate](https://socialify.git.ci/Blackplums/how2validate/image?font=Inter&name=1&pattern=Solid&theme=Auto)
<!-- 
[![jsr.io](https://img.shields.io/badge/jsr.io-1.0.0-blue)](https://jsr.io/package/@how2validate/how2validate) [![PyPI](https://img.shields.io/pypi/v/how2validate)](https://pypi.org/project/how2validate/) [![Docker](https://img.shields.io/docker/v/ghcr.io/yourusername/how2validate?label=GitHub%20Docker%20Registry)](https://github.com/Blackplums/how2validate/pkgs/container/how2validate) -->

### About

How2Validate is a versatile security tool designed to streamline the process of validating sensitive secrets across various platforms and services.

Whether you're a developer, security professional, or DevOps engineer, How2Validate empowers you to ensure the authenticity and security of your API keys, tokens, and other critical information.

By leveraging the power of Python and Docker, How2Validate offers a flexible and efficient solution for validating secrets against official provider endpoints. Its user-friendly command-line interface (CLI) makes it easy validating secrets, allowing you to quickly and accurately verify the integrity of your sensitive data.


### Why How2Validate?

In today's digital landscape, the exposure of sensitive information such as API keys, passwords, and tokens can lead to significant security breaches. These vulnerabilities often arise from:

- **Leaked API Keys**: Unintentional exposure through public repositories or logs.
- **Invalid Credentials**: Using outdated or incorrect credentials that can compromise systems.
- **Misconfigured Secrets**: Improperly managed secrets leading to unauthorized access.

**How2Validate** addresses these concerns by providing a robust solution to verify the authenticity and validity of your secrets directly with official providers. This proactive approach helps in:

- **Mitigating Risks**: Prevent unauthorized access by ensuring only active secrets are used.
- **Enhancing Security Posture**: Strengthen your application's security by regularly validating secrets.


### Features

**How2Validate** offers a range of features designed to enhance the security and efficiency of secret management:

- **Validate API Keys, Passwords, and Sensitive Information**: Interacts with official provider authentication endpoints to ensure the authenticity of secrets.
- **Cross-Platform Support**: Available for Python, and Docker environments.
- **Easy to Use**: Simplifies secret validation with straightforward commands and functions.
- **Real-Time Feedback**: Instantly know the status of your secrets — whether they are active or not.
- **Detailed Reporting**: Receive comprehensive reports on secret validation.
- **Updating Providers**: Keep the tool up-to-date with the latest secret providers and their secret types.

## Join Our Community discussions

Have questions? Feedback? Jump in and hang out with us

Join our [GitHub Community Discussion](https://github.com/Blackplums/how2validate/discussions)

## Packages

**How2Validate** is available for multiple platforms, ensuring seamless secret validation process. Choose the package manager that best fits your project needs:

### Package Statistics

Stay updated with the latest versions and downloads:

<div align="center">
  <a href="https://pypi.org/project/how2validate/" target="_blank">
   <img src="https://pypi.org/static/images/logo-small.8998e9d1.svg" height="50" alt="pypi.org"  />
  </a>
  <a href="https://github.com/Blackplums/how2validate/pkgs/container/how2validate" target="_blank">
    <img src="https://cdn-icons-png.flaticon.com/512/9402/9402282.png" height="60" alt="container image"  />
  </a>
</div>



## Installation

Installing **How2Validate** is straightforward, whether you're working with Python, or Docker. Follow the instructions below to set up the package in your environment.

### Python

#### Using pip
```bash
pip install how2validate
```


### Docker
Get the latest version from [GitHub Package Registry](https://github.com/Blackplums/how2validate/pkgs/container/how2validate) 

#### Using docker
```bash
docker pull ghcr.io/blackplums/how2validate:main
```

## Usage

**How2Validate** can be used both programmatically and via the command-line interface (CLI). Below are detailed instructions for Python, and CLI usage.

### Python

#### Importing and Using the Validate Function

```python
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

## CLI

### Detailed CLI Help

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
  -R, --report    Get detailed reports. Receive validated secrets via email.
  -token          Secure your token in the vault, fetch it on demand, or shred it when done. (SubCommands: "delete", "list")
  -v, --version   Expose the version.
  --update        Hack the tool to the latest version.

Ensuring the authenticity of your secrets.
```

### Example Command

#### Validate a Secret

```bash
how2validate --provider NPM --service "NPM Access Token" --secret "<<SECRET_HERE>>"

-- OR --

how2validate -p NPM -s "NPM Access Token" -sec "<<SECRET_HERE>>"
```

#### Validate with Response Status

```bash
how2validate --provider NPM --service "NPM Access Token" --secret "<<SECRET_HERE>>" --response

-- OR --

how2validate -p NPM -s "NPM Access Token" -sec "<<SECRET_HERE>>" -r
```


## API Reference

Detailed documentation of the **How2Validate API** for both Python.

### Python API

`validate(provider, service, secret, response, report)`

Validates a secret against the specified provider and service.

- **Parameters:**
  - `provider` (string): The name of the provider (e.g., "NPM", "GitHub").
  - `service` (string): The specific service or token type.
  - `secret` (string): The secret to validate.
  - `response` (boolean): If `true`, returns the full response.
  - `report` (string): Email Id to send a detailed report (Alpha Feature).

- **Returns:**
  - `validation_result` (object): An object containing the validation status and details.


### Example

```python
from how2validate import validate

result = validate(
    provider="NPM",
    service="NPM Access Token",
    secret="<<SECRET>>",
    response=True/False,
    report="useremail@domain.com"
)
print(result)
```

## License

All `how2validate` packages are released under the MIT license.

