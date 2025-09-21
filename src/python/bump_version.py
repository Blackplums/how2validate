#!/usr/bin/env python3

"""
bump_version.py - Semantic version bumper for Python packages using Config.ini

🔧 Features:
- Reads the current version from Config.ini.
- Fetches the latest version of the package from PyPI.
- Supports bumping patch, minor, major, and beta versions.
- Ensures bumping is always based on the latest PyPI version (not local).
- Updates Config.ini with the newly bumped version.

📦 Dependencies:
- configparser
- semver
- requests

📘 Usage:
    python bump_version.py [patch|minor|major|beta]

🧪 Examples:
    python bump_version.py patch   # Bumps 1.2.4 → 1.2.5
    python bump_version.py minor   # Bumps 1.2.4 → 1.3.0
    python bump_version.py major   # Bumps 1.2.4 → 2.0.0
    python bump_version.py beta    # Bumps 1.2.4 → 1.2.5-beta.1 (or continues beta)

🔁 Default bump type: patch
"""

import configparser
import semver
import os
import requests
import sys

# Constants
CONFIG_FILE = "config.ini"
PACKAGE_NAME = "how2validate"  # Change this if your PyPI package name differs

def load_config():
    """
    Loads the version configuration from Config.ini.
    
    Returns:
        configparser.ConfigParser: Config object with loaded data.

    Raises:
        FileNotFoundError: if Config.ini is not found.
    """
    if not os.path.exists(CONFIG_FILE):
        raise FileNotFoundError("❌ Config.ini not found.")
    
    config = configparser.ConfigParser()
    config.read(CONFIG_FILE)
    return config

def get_latest_pypi_version(package_name):
    """
    Fetches the latest published version of the package from PyPI.

    Args:
        package_name (str): The name of the package on PyPI.

    Returns:
        str: The latest PyPI version string, or None if fetch fails.
    """
    url = f"https://pypi.org/pypi/{package_name}/json"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()["info"]["version"]
        else:
            print(f"⚠️ Could not fetch version from PyPI. Status: {response.status_code}")
            return None
    except Exception as e:
        print(f"⚠️ Error fetching from PyPI: {e}")
        return None

def normalize_beta(version: str) -> str:
    """
    Converts PyPI beta format (e.g., 1.0.0b6) into semver-compatible (1.0.0-beta.6).

    Args:
        version (str): PyPI version string

    Returns:
        str: Normalized semver version string
    """
    if 'b' in version:
        parts = version.split('b')
        return f"{parts[0]}-beta.{parts[1]}"
    return version

def denormalize_beta(version: str) -> str:
    """
    Converts semver format (1.0.0-beta.3) to PyPI style (1.0.0b3).

    Args:
        version (str): Semver-style version

    Returns:
        str: PyPI-compatible version string
    """
    return version.replace("-beta.", "b")

def bump_version(base_version: str, bump_type: str = "patch") -> str:
    """
    Bumps a given version based on the type: patch, minor, major, or beta.

    Note:
    - The bump is always based on the PyPI version (never local).
    - Beta bumps increment numeric suffix (e.g., beta.3 → beta.4).
    - For a non-beta bump type, any beta suffix is stripped.

    Args:
        base_version (str): Normalized version from PyPI.
        bump_type (str): Type of bump: 'patch', 'minor', 'major', 'beta'.

    Returns:
        str: The new bumped version.

    Raises:
        ValueError: if an unknown bump_type is provided.
    """
    is_beta_version = "-beta." in base_version

    # Strip beta suffix if we're doing a stable bump
    if is_beta_version and bump_type != "beta":
        base_version = base_version.split("-beta.")[0]

    parsed = semver.Version.parse(base_version)

    if bump_type == "major":
        return str(parsed.bump_major())
    elif bump_type == "minor":
        return str(parsed.bump_minor())
    elif bump_type == "patch":
        return str(parsed.bump_patch())
    elif bump_type == "beta":
        if is_beta_version:
            # Increment existing beta number
            base, beta = (base_version.split("-beta.") + ["0"])[:2]
            new_beta = int(beta) + 1
            return f"{base}-beta.{new_beta}"
        else:
            # Start a new beta release from next patch version
            return f"{str(parsed.bump_patch())}-beta.1"
    else:
        raise ValueError(f"❌ Unknown bump type: {bump_type}")

def save_config(config, new_version):
    """
    Saves the new version into the Config.ini file.

    Args:
        config (ConfigParser): Loaded config object
        new_version (str): New version string to write
    """
    config["DEFAULT"]["version"] = new_version
    with open(CONFIG_FILE, "w") as f:
        config.write(f)

def main():
    """
    Main entry point:
    - Parses bump type argument.
    - Loads current config.
    - Retrieves latest PyPI version.
    - Calculates bumped version.
    - Updates Config.ini with the new version.
    """
    bump_type = sys.argv[1] if len(sys.argv) > 1 else "patch"

    # Load current config
    try:
        config = load_config()
    except FileNotFoundError as e:
        print(e)
        return

    # Fetch PyPI version
    pypi_version_raw = get_latest_pypi_version(PACKAGE_NAME)
    if not pypi_version_raw:
        print("❌ Could not retrieve latest PyPI version.")
        return

    # Normalize for semver compatibility
    normalized_version = normalize_beta(pypi_version_raw)
    print(f"🌐 Latest PyPI version: {pypi_version_raw} (normalized: {normalized_version})")

    # Perform bump
    try:
        new_version = bump_version(normalized_version, bump_type)
        print(f"🔁 {bump_type.capitalize()} bump: {new_version}")
        print(f"NewVersion: {new_version}")
        save_config(config, new_version)
        print("✅ Config.ini updated.")
    except Exception as e:
        print(f"❌ Failed to bump version: {e}")

if __name__ == "__main__":
    main()
