# Verify Email Page Design

## Purpose
- Confirm to newly registered users that a verification email has been sent.
- Keep UI weight light-to-medium with a modal-style informational dialog from Kibo patterns.

## Layout & Flow
1. **Background Shell** – Full-height flex container centering the dialog to maintain focus.
2. **Informational Dialog** – Auto-open `alert-dialog → informational` pattern with title + description referencing the submitted email.
3. **Supporting Text** – Optional page-level copy under the dialog (no dialog actions per requirement).

## Required Components (Level 1 → Level 2)
- **alert-dialog → informational** – Main popup informing users about the verification email. *No `Action/Cancel` slots rendered.*
- **separator → standard (optional)** – If additional explanatory copy is added below the dialog shell.

*Dialog pattern already installed; no new registry pull required.*

## Content & Logic Notes
- Email address is passed via query string (`/verify-email?email=you%40mail.com`) and sanitized before rendering.
- Page remains accessible without the email param, falling back to a generic "your inbox" label.
- Navigation links (e.g., back to Login) live outside the dialog per “no actions” requirement.

## Status
- Implementation scheduled alongside Sign Up page.
- Last updated: 2025-11-30.
