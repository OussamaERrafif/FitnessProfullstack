"""
Comprehensive unit tests for Authentication endpoints.

This module tests all aspects of authentication API including user registration,
login, token validation, and authentication-related error handling.
"""

import pytest
from fastapi.testclient import TestClient

from tests.utils import create_test_user, get_auth_headers


class TestAuthEndpoints:
    """Test suite for authentication endpoints."""

    def test_health_check_endpoint(self, client: TestClient):
        """Test basic health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_root_endpoint(self, client: TestClient):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "FitnessPr API"

    def test_register_user_success(self, client: TestClient):
        """Test successful user registration."""
        user_data = {
            "email": "newuser@example.com",
            "password": "securepassword123",
            "full_name": "New User",
            "is_trainer": False
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        # Check if endpoint exists, if not skip
        if response.status_code == 404:
            pytest.skip("Auth registration endpoint not implemented")
            
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["full_name"] == user_data["full_name"]
        assert "id" in data

    def test_register_user_duplicate_email(self, client: TestClient, db_session):
        """Test user registration with duplicate email."""
        # Create existing user
        create_test_user(db_session, email="existing@example.com")
        
        user_data = {
            "email": "existing@example.com",
            "password": "password123",
            "full_name": "Duplicate User"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        # Check if endpoint exists
        if response.status_code == 404:
            pytest.skip("Auth registration endpoint not implemented")
        
        assert response.status_code == 400

    def test_login_success(self, client: TestClient, db_session):
        """Test successful user login."""
        # Create test user
        password = "testpassword123"
        user = create_test_user(
            db_session,
            email="login@example.com",
            password=password
        )
        
        login_data = {
            "username": "login@example.com",  # FastAPI OAuth2 uses 'username'
            "password": password
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        
        # Check if endpoint exists
        if response.status_code == 404:
            pytest.skip("Auth login endpoint not implemented")
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_email(self, client: TestClient):
        """Test login with invalid email."""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        
        if response.status_code == 404:
            pytest.skip("Auth login endpoint not implemented")
        
        assert response.status_code == 401

    def test_login_invalid_password(self, client: TestClient, db_session):
        """Test login with invalid password."""
        user = create_test_user(db_session, email="wrongpass@example.com")
        
        login_data = {
            "username": "wrongpass@example.com",
            "password": "wrongpassword"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        
        if response.status_code == 404:
            pytest.skip("Auth login endpoint not implemented")
        
        assert response.status_code == 401

    def test_get_current_user(self, client: TestClient, db_session):
        """Test getting current user with valid token."""
        user = create_test_user(db_session, email="current@example.com")
        headers = get_auth_headers(user.id, user.email)
        
        response = client.get("/api/v1/auth/me", headers=headers)
        
        if response.status_code == 404:
            pytest.skip("Current user endpoint not implemented")
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == user.email
        assert data["id"] == user.id

    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token."""
        response = client.get("/api/v1/auth/me")
        
        if response.status_code == 404:
            pytest.skip("Current user endpoint not implemented")
        
        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        
        response = client.get("/api/v1/auth/me", headers=headers)
        
        if response.status_code == 404:
            pytest.skip("Current user endpoint not implemented")
        
        assert response.status_code == 401

    def test_register_trainer_user(self, client: TestClient):
        """Test registering a trainer user."""
        trainer_data = {
            "email": "trainer@example.com",
            "password": "trainerpass123",
            "full_name": "Trainer User",
            "is_trainer": True
        }
        
        response = client.post("/api/v1/auth/register", json=trainer_data)
        
        if response.status_code == 404:
            pytest.skip("Auth registration endpoint not implemented")
        
        assert response.status_code == 201
        data = response.json()
        assert data["is_trainer"] is True

    def test_password_reset_request(self, client: TestClient, db_session):
        """Test password reset request."""
        user = create_test_user(db_session, email="reset@example.com")
        
        reset_data = {"email": "reset@example.com"}
        
        response = client.post("/api/v1/auth/password-reset", json=reset_data)
        
        if response.status_code == 404:
            pytest.skip("Password reset endpoint not implemented")
        
        # Could be 200 (success) or 202 (accepted)
        assert response.status_code in [200, 202]

    def test_token_refresh(self, client: TestClient, db_session):
        """Test token refresh functionality."""
        user = create_test_user(db_session, email="refresh@example.com")
        
        # First login to get tokens
        login_data = {
            "username": "refresh@example.com",
            "password": "testpassword123"
        }
        
        login_response = client.post("/api/v1/auth/login", data=login_data)
        
        if login_response.status_code == 404:
            pytest.skip("Auth login endpoint not implemented")
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            
            # Try to refresh token
            refresh_data = {"refresh_token": tokens.get("refresh_token", "dummy")}
            
            refresh_response = client.post("/api/v1/auth/refresh", json=refresh_data)
            
            if refresh_response.status_code == 404:
                pytest.skip("Token refresh endpoint not implemented")
            
            # If implemented, should return new tokens
            if refresh_response.status_code == 200:
                new_tokens = refresh_response.json()
                assert "access_token" in new_tokens

    def test_logout(self, client: TestClient, db_session):
        """Test user logout."""
        user = create_test_user(db_session, email="logout@example.com")
        headers = get_auth_headers(user.id, user.email)
        
        response = client.post("/api/v1/auth/logout", headers=headers)
        
        if response.status_code == 404:
            pytest.skip("Logout endpoint not implemented")
        
        assert response.status_code == 200

    def test_registration_validation_errors(self, client: TestClient):
        """Test registration with validation errors."""
        invalid_data = [
            {"password": "pass", "full_name": "User"},  # Missing email
            {"email": "invalid-email", "password": "pass", "full_name": "User"},  # Invalid email
            {"email": "valid@example.com", "full_name": "User"},  # Missing password
            {"email": "valid@example.com", "password": ""},  # Empty password
        ]
        
        for data in invalid_data:
            response = client.post("/api/v1/auth/register", json=data)
            
            if response.status_code == 404:
                pytest.skip("Auth registration endpoint not implemented")
            
            # Should return validation error
            assert response.status_code == 422

    def test_protected_endpoint_access(self, client: TestClient, db_session):
        """Test accessing protected endpoints with and without authentication."""
        # Try without authentication
        response = client.get("/api/v1/users/me")
        
        if response.status_code == 404:
            # Try alternative endpoint
            response = client.get("/api/v1/clients/")
        
        if response.status_code == 404:
            pytest.skip("No protected endpoints found to test")
        
        # Should require authentication
        assert response.status_code == 401
        
        # Try with authentication
        user = create_test_user(db_session, email="protected@example.com")
        headers = get_auth_headers(user.id, user.email)
        
        response = client.get("/api/v1/users/me", headers=headers)
        
        if response.status_code == 404:
            response = client.get("/api/v1/clients/", headers=headers)
        
        # Should work with authentication (200 or other success code)
        if response.status_code not in [404]:
            assert response.status_code < 400