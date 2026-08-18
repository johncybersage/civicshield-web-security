from slowapi import Limiter
from starlette.requests import Request

def get_real_ip(request: Request) -> str:
    # First check X-Forwarded-For
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    # Fallback to standard client host
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"

limiter = Limiter(key_func=get_real_ip)
