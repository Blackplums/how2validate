import logging
import os
import json
import requests
import base64

# Load environment variables
from dotenv import load_dotenv
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding as asymmetric_padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes, padding

from how2validate.utility.interface import EmailResponse
from how2validate.utility.config_utility import get_report_urls
from how2validate.utility.token_utility import get_stored_token

load_dotenv()

def send_email(email_response: EmailResponse) -> None:
    """
    Enhanced: Validates stored token, checks threshold/validity, fetches public key, encrypts email data,
    and sends the encrypted report to the configured API endpoint.
    """
    urls = get_report_urls()
    VALIDATE_URL = urls.get("validate_url", "http://localhost:3000/api/validate")
    PUBLIC_KEY_URL = urls.get("public_key_url", "http://localhost:3000/api/public-key")
    REPORT_URL = urls.get("report_url", "http://localhost:3000/api/report")
    
    token = get_stored_token()
    if not token:
        logging.error("No API token stored. Please store a valid token before sending email reports.")
        return

    # 1. Validate the token
    try:
        validate_resp = requests.get(
            VALIDATE_URL,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        if validate_resp.status_code != 200:
            # Try extracting the error message from the response
            try:
                error_msg = validate_resp.json().get("error", validate_resp.text)
            except ValueError:
                # If response is not JSON
                error_msg = validate_resp.text
            logging.error(f"Token validation failed: {error_msg}")
            return
        validation_data = validate_resp.json()

        if not validation_data.get("isTokenUnderDailyReportThreshold", False):
            logging.warning("Token has exceeded daily usage limits.")
        
        if validate_resp.status_code == 200 and validation_data.get("isTokenUnderDailyReportThreshold", True):
            logging.info("Token Validated successfully...")

    except Exception as e:
        logging.error(f"Error validating token: {e}")
        return

    # 2. Get the public key
    try:
        pubkey_resp = requests.get(
            PUBLIC_KEY_URL,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        if pubkey_resp.status_code != 200:
            # Try extracting the error message from the response
            try:
                error_msg = pubkey_resp.json().get("error", pubkey_resp.text)
            except ValueError:
                # If response is not JSON
                error_msg = pubkey_resp.text
            logging.error(f"Failed to fetch public key: {error_msg}")
            return
        
        public_key_pem = pubkey_resp.json().get("key")
        if not public_key_pem:
            logging.error("No public key found in response.")
            return
        public_key = serialization.load_pem_public_key(public_key_pem.encode())
        
        if pubkey_resp.status_code == 200 and public_key:
            logging.info("Retrieved Encryption key successfully...")

    except Exception as e:
        logging.error(f"Error fetching public key: {e}")
        return

    # 3. Encrypt the email response data
    try:
        response = email_response.response
        if isinstance(response, str):
            try:
                response = json.loads(response)
            except Exception:
                pass

        email_data = {
            "provider": email_response.provider,
            "state": email_response.state,
            "service": email_response.service,
            "response": response,
        }

        encrypted_b64 = hybrid_encrypt(public_key, email_data)
        if encrypted_b64:
            logging.info("Reporting data encrypted.")
    except Exception as e:
        logging.error(f"Error encrypting Reporting data: {e}")
        return

    # 4. Send the encrypted report
    try:
        report_payload = {
            "encrypted_data": encrypted_b64,
            "email": email_response.email
        }
        report_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        report_resp = requests.post(
            REPORT_URL,
            json=report_payload,
            headers=report_headers,
            timeout=30
        )
        if report_resp.status_code != 200:
            logging.error(f"Failed to send encrypted report: {report_resp.text}")
        else:
            logging.info("Encrypted report sent successfully.")
        return report_resp
    except Exception as e:
        logging.error(f"Error sending encrypted report: {e}")
        return
    
def hybrid_encrypt(public_key, payload: dict):
    # Encode JSON using UTF-8
    data_bytes = json.dumps(payload, ensure_ascii=True).encode("utf-8")

    aes_key = os.urandom(32)  # AES-256 key
    iv = os.urandom(16)       # AES-CBC IV

    # Apply PKCS#7 padding using cryptography's padding module
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data_bytes) + padder.finalize()

    cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()

    encrypted_key = public_key.encrypt(
        aes_key,
        asymmetric_padding.OAEP(
            mgf=asymmetric_padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

    payload_obj = {
        "key": base64.b64encode(encrypted_key).decode("utf-8"),
        "iv": base64.b64encode(iv).decode("utf-8"),
        "data": base64.b64encode(encrypted_data).decode("utf-8")
    }

    return payload_obj