"""
Security utilities for input validation and sanitization.
"""

import re
from typing import Any, Dict, List, Optional, Union

from fastapi import HTTPException


class InputValidator:
    """Utility class for input validation and sanitization."""

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, email))

    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format."""
        # Remove all non-digit characters
        digits_only = re.sub(r"\D", "", phone)
        # Check if it's between 10-15 digits
        return 10 <= len(digits_only) <= 15

    @staticmethod
    def validate_pin(pin: str) -> bool:
        """Validate PIN format (4-6 digits)."""
        return bool(re.match(r"^\d{4,6}$", pin))

    @staticmethod
    def sanitize_string(text: str, max_length: int = 255) -> str:
        """Sanitize string input."""
        if not isinstance(text, str):
            raise HTTPException(status_code=400, detail="Input must be a string")

        # Remove potential XSS characters
        dangerous_chars = ["<", ">", '"', "'", "&", "\x00"]
        for char in dangerous_chars:
            text = text.replace(char, "")

        # Trim whitespace and limit length
        text = text.strip()[:max_length]

        return text

    @staticmethod
    def validate_sql_safe(text: str) -> bool:
        """Check if text is safe from SQL injection."""
        dangerous_patterns = [
            r"(\'|(\'|\"))(.*?)(\'|\")",  # Quoted strings
            r"(\;)",  # Semicolons
            r"(--)",  # SQL comments
            r"(/\*)",  # SQL comments
            r"(\bdrop\b|\bdelete\b|\btruncate\b|\bexec\b|\bunion\b)",  # Dangerous
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return False

        return True

    @staticmethod
    def validate_file_upload(
        filename: str,
        content_type: str,
        allowed_extensions: List[str] = None,
        allowed_types: List[str] = None,
    ) -> bool:
        """Validate file upload."""
        if allowed_extensions is None:
            allowed_extensions = ["jpg", "jpeg", "png", "pdf"]

        if allowed_types is None:
            allowed_types = ["image/jpeg", "image/png", "application/pdf"]

        # Check file extension
        file_ext = filename.lower().split(".")[-1] if "." in filename else ""
        if file_ext not in allowed_extensions:
            return False

        # Check content type
        if content_type not in allowed_types:
            return False

        return True

    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Union[bool, str]]:
        """Validate password strength."""
        errors = []

        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")

        if not re.search(r"[A-Z]", password):
            errors.append("Password must contain at least one uppercase letter")

        if not re.search(r"[a-z]", password):
            errors.append("Password must contain at least one lowercase letter")

        if not re.search(r"\d", password):
            errors.append("Password must contain at least one digit")

        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
            errors.append("Password must contain at least one special character")

        return {"valid": len(errors) == 0, "errors": errors}

    @staticmethod
    def validate_json_payload(data: Dict[str, Any], max_depth: int = 10) -> bool:
        """Validate JSON payload depth and size."""

        def check_depth(obj, current_depth=0):
            if current_depth > max_depth:
                return False

            if isinstance(obj, dict):
                return all(check_depth(v, current_depth + 1) for v in obj.values())
            elif isinstance(obj, list):
                return all(check_depth(item, current_depth + 1) for item in obj)

            return True

        return check_depth(data)


def validate_request_size(
    content_length: Optional[int], max_size: int = 10 * 1024 * 1024
) -> bool:
    """Validate request content size (default: 10MB)."""
    if content_length is None:
        return True
    return content_length <= max_size


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage."""
    # Remove path separators and dangerous characters
    filename = re.sub(r"[^\w\-_\.]", "", filename)

    # Remove leading dots
    filename = filename.lstrip(".")

    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
        filename = name[: 255 - len(ext) - 1] + "." + ext if ext else name[:255]

    return filename or "unnamed"
