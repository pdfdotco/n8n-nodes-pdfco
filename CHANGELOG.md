# Changelog

## 1.0.10 - 2026-07-07

### Fixed

- Updated PDF.co API requests to use n8n authenticated HTTP helpers instead of deprecated or manually authenticated request helpers.
- Replaced the deprecated OAuth2 request helper with `httpRequestWithAuthentication()` for OAuth user info lookups.
- Removed direct `setTimeout` usage from job polling to satisfy n8n community package security scan rules.
