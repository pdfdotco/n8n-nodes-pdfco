# Changelog

## 1.0.11 - 2026-07-15

### Added

- Added PDF.co search aliases to improve node discoverability in n8n Connect.
- Added AI Agent tool support for the PDF.co node on n8n 1.71.0+; older instances require `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` ([#12](https://github.com/pdfdotco/n8n-nodes-pdfco/pull/12)).

## 1.0.10 - 2026-07-07

### Fixed

- Updated PDF.co API requests to use n8n authenticated HTTP helpers instead of deprecated or manually authenticated request helpers.
- Replaced the deprecated OAuth2 request helper with `httpRequestWithAuthentication()` for OAuth user info lookups.
- Switched PDF.co job polling delay to n8n-workflow's `sleep` utility to avoid restricted globals.
- Wrapped inline secondary downloads in `NodeApiError` for node-aware n8n UI errors.
- Simplified the API key credential field label to `API Key`.

### Documentation

- Added an end-to-end PDF Information & Form Fields usage example to the README.
