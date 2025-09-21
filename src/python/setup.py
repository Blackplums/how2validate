from setuptools import setup, find_packages
import os

from how2validate.utility.config_utility import get_version

# Retrieve the current version from environment variable
version = get_version()

# Get the path to requirements.txt which is one folder up
requirements_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.', 'requirements.txt'))

# Read requirements from requirements.txt
with open(requirements_path, 'r') as f:
    requirements = f.read().splitlines()

# Read the README.md file
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name='how2validate',
    version=version,
    description='A CLI tool to validate secrets for different services.',
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Blackplums/how2validate",
    author='Vigneshkna',
    author_email='vigneshkna@gmail.com',
    license='MIT',
    packages=find_packages(),
    include_package_data=True,
    package_data={
        '': ['../requirements.txt', '../config.ini', '../tokenManager.json', '../README.md', '../main.py'],
    },
    install_requires=requirements,
    entry_points={
        'console_scripts': [
            'how2validate=how2validate.validator:main',
        ],
    },
)
