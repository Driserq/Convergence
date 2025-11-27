# Profile & Settings Page Design

## Purpose
Allow users to manage their account settings, including personal information (email, username), subscription status, and dangerous actions (account deletion).

## Structure
1.  **Header**: Title "Profile & Settings".
2.  **Account Information**:
    -   Avatar display.
    -   Form to update Email.
    -   Form to update Username.
3.  **Subscription Management**:
    -   Current plan status (Badge).
    -   Cancel Subscription button (triggers Alert Dialog).
4.  **Danger Zone**:
    -   Delete Account button (triggers Alert Dialog).

## Required Components (Level 1 & 2)

-   **card - standard**: Containers for each section (Account, Subscription, Danger Zone).
    -   *Context*: Medium weight. Needs 50% border opacity, 70% bg opacity per Design System.
-   **form - validation**: For Email and Username update forms.
    -   *Context*: Heavy weight (interactive).
-   **alert-dialog - destructive**: For "Delete Account" confirmation.
-   **alert-dialog - confirmation**: For "Cancel Subscription" confirmation.
-   **button - standard**: For "Save Changes".
-   **button - destructive**: For "Delete Account".
-   **button - outline**: For "Cancel Subscription".
-   **badge - secondary**: To display current subscription plan (e.g., "Pro Plan").
-   **separator - standard**: To visually separate sections if needed within cards or between them.
-   **avatar - standard**: To display user initials/image.

## User Selection
User will choose Level 3 pattern numbers from kibo-ui.com.
