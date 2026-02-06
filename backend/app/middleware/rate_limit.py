from fastapi import Request, HTTPException, status
from functools import lru_cache
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
        """
        Check if request is allowed
        
        Returns:
            (is_allowed, remaining_requests)
        """
        now = datetime.now()
        window_start = now - timedelta(seconds=window_seconds)
        
        # Clean old requests
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if req_time > window_start
        ]
        
        # Check limit
        if len(self.requests[key]) >= max_requests:
            return False, 0
        
        # Add current request
        self.requests[key].append(now)
        remaining = max_requests - len(self.requests[key])
        
        return True, remaining


# Global rate limiter instance
rate_limiter = RateLimiter()


def rate_limit(max_requests: int = 10, window_seconds: int = 60):
    """
    Rate limiting decorator/dependency
    
    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
    """
    async def rate_limit_dependency(request: Request):
        # Use IP address as key
        client_ip = request.client.host if request.client else "unknown"
        
        is_allowed, remaining = rate_limiter.is_allowed(
            client_ip,
            max_requests,
            window_seconds
        )
        
        if not is_allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again later.",
                headers={"X-RateLimit-Remaining": "0"}
            )
        
        return remaining
    
    return rate_limit_dependency
