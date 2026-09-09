# Changelog

## 1.0.15 - 2026-09-09

### Fixed

- Resolved the findings from n8n's verification review of 1.0.13:
  - Both credential types now declare `icon` and `documentationUrl`.
  - The node class builds its description as a plain object literal (the old constructor argument was never passed by n8n), with `icon`, `subtitle`, and `usableAsTool` declared on it where the linter can see them.
  - Collection and fixed-collection options are alphabetized by display name. Entry contents are unchanged.
  - Dynamic-option descriptions use n8n's current wording and docs URL.
- Renamed two OAuth2-related internal constants (PKCE client ID, credential cache property) so the scanner no longer mistakes them for hardcoded secrets. No behavior change.

### Changed

- Bumped `eslint-plugin-n8n-nodes-base` to 1.16.7 (the version n8n's scanner uses), and repo lint now runs with `--no-inline-config`, matching how the scanner treats `eslint-disable` comments. Stale rule overrides were removed.

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
