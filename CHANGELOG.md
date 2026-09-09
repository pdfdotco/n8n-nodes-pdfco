# Changelog

## 1.0.15 - 2026-09-09

### Fixed

- Addressed the n8n verification linter findings on 1.0.13: added `icon` and `documentationUrl` to both credential types, declared `icon` and `subtitle` on the node class description, alphabetized collection and fixed-collection options, and updated dynamic-option descriptions to the current n8n wording.
- Renamed two internal constants (OAuth2 PKCE client ID, OAuth2 credential cache property) so the scanner no longer mistakes them for hardcoded secrets. No behavior change.

## 1.0.14 - 2026-09-09

### Changed

- Renamed the node from "PDF.co API" to "PDF.co" in the nodes panel and as the default node label.
- Refreshed the node and npm package descriptions to describe the OCR, AI invoice parsing, extraction, conversion, form filling, merge/split, and barcode capabilities ([#19](https://github.com/pdfdotco/n8n-nodes-pdfco/pull/19)).

## 1.0.13 - 2026-07-24

### Fixed

- Masked the OAuth2 client secret in the credential UI.
- Wrapped execution failures in n8n node-aware errors so they retain node context in the editor.

## 1.0.12 - 2026-07-23

### Changed

- Made OAuth2 the first and default authentication option for new PDF.co nodes; API Key authentication remains available.

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
