# Token Auth in React: Security Best Practices

Based on the industry-standard "hybrid approach" for managing tokens in Single Page Applications (SPAs) like React.

## 1. Token Types and Lifespans
*   **Access Token:** Short-lived (minutes to an hour). Used to authenticate API requests. Contains user permissions/roles.
*   **Refresh Token:** Long-lived. Used to silently obtain new access tokens when they expire without requiring re-login.

## 2. Secure Token Storage (The Hybrid Approach)
Never store both tokens in `localStorage` due to high vulnerability to Cross-Site Scripting (XSS) attacks.

*   **Access Tokens ➡️ In-Memory Storage:** Store the access token in React state, Context API, or a state manager (like Zustand/Redux). It is wiped on page refresh, which is safer.
*   **Refresh Tokens ➡️ `HttpOnly` Cookies:** The backend *must* set the refresh token as an `HttpOnly`, `Secure`, and `SameSite` cookie. This prevents JavaScript (and thereby XSS attacks) from reading it while protecting against CSRF.

## 3. Token Refresh Strategy
*   **Axios Interceptors:** Implement Axios (or `fetch`) request and response interceptors.
    *   **Request Interceptor:** Attaches the in-memory access token to the `Authorization: Bearer <token>` header of outgoing requests.
    *   **Response Interceptor:** Detects `401 Unauthorized` responses. When triggered, it automatically calls the `/refresh` endpoint (which automatically sends the `HttpOnly` cookie), retrieves a new access token, updates the in-memory state, and replays the failed request.
*   **Refresh Token Rotation:** The backend should issue a new refresh token every time the old one is used, immediately invalidating the old one to prevent replay attacks.

## 4. General Security Principles
*   **Always use HTTPS** to prevent Man-in-the-Middle (MITM) attacks.
*   **Keep JWTs Small:** Do not store sensitive personal information in the JWT payload, as it is only base64 encoded, not encrypted.
*   **Sanitize Inputs:** Always sanitize user inputs and use React's built-in XSS protections.
*   **Token Revocation:** Implement backend logic to blacklist/revoke tokens on explicit logout or password change. Clear in-memory state and instruct the browser to clear the cookie.
