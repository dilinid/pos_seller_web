"""Thin wrapper for synchronous service-to-service calls (e.g. Picking -> Ordering's
/internal/* endpoints). Shared timeout/retry policy so every caller behaves the same
way under a downstream outage instead of each service inventing its own."""

import httpx

DEFAULT_TIMEOUT_SECONDS = 5.0


class InternalCallError(Exception):
    """Raised when a service-to-service call fails after retries. Callers should
    catch this and translate it into a 502 for their own client, per the plan's
    'commit nothing locally on failure' rule for cross-service writes."""


def internal_patch(url: str, *, json: dict, token: str, timeout: float = DEFAULT_TIMEOUT_SECONDS) -> dict:
    """PATCH an internal endpoint with one retry on connection error only (the
    request never reached the server, so retrying is safe). A timeout waiting
    for the response is a genuinely ambiguous state — the callee may have
    already applied the change — so it is NOT retried; it's raised immediately
    as InternalCallError so the caller commits nothing locally (see the plan's
    risk notes for this residual failure window and its mitigation via the
    compare-and-swap `expectedCurrentStatus` guard on retried operations)."""
    headers = {"Authorization": f"Bearer {token}"}
    last_exc: Exception | None = None
    for attempt in range(2):
        try:
            response = httpx.patch(url, json=json, headers=headers, timeout=timeout)
        except httpx.ConnectError as exc:
            last_exc = exc
            continue
        except httpx.TimeoutException as exc:
            raise InternalCallError(f"Internal call to {url} timed out: {exc}") from exc
        except httpx.HTTPError as exc:
            raise InternalCallError(f"Internal call to {url} failed: {exc}") from exc
        if response.status_code >= 400:
            raise InternalCallError(
                f"Internal call to {url} failed: {response.status_code} {response.text}"
            )
        return response.json()
    raise InternalCallError(f"Internal call to {url} failed after retry: {last_exc}")
