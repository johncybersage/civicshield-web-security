from app.api.endpoints.auth import log_audit
from starlette.requests import Request
from unittest.mock import MagicMock
from app.core.database import SessionLocal
import pytest

def test_log_audit_ip_scenarios():
    db = MagicMock()
    
    # A & D: request.client exists, no X-Forwarded-For
    scope1 = {"type": "http", "client": ("192.168.1.1", 1234), "headers": []}
    req1 = Request(scope1)
    log_audit(db, "TEST_A", user_id=1, request=req1)
    assert db.add.call_args[0][0].ip_address == "192.168.1.1"

    # B & D: request.client is None, no X-Forwarded-For
    scope2 = {"type": "http", "client": None, "headers": []}
    req2 = Request(scope2)
    log_audit(db, "TEST_B", user_id=1, request=req2)
    assert db.add.call_args[0][0].ip_address == None

    # C: X-Forwarded-For exists (should prioritize it over client)
    scope3 = {
        "type": "http", 
        "client": ("192.168.1.1", 1234), 
        "headers": [(b"x-forwarded-for", b"203.0.113.1, 198.51.100.1")]
    }
    req3 = Request(scope3)
    log_audit(db, "TEST_C", user_id=1, request=req3)
    assert db.add.call_args[0][0].ip_address == "203.0.113.1"

    # B & C: request.client is None, but X-Forwarded-For exists
    scope4 = {
        "type": "http", 
        "client": None, 
        "headers": [(b"x-forwarded-for", b"203.0.113.5")]
    }
    req4 = Request(scope4)
    log_audit(db, "TEST_D", user_id=1, request=req4)
    assert db.add.call_args[0][0].ip_address == "203.0.113.5"

