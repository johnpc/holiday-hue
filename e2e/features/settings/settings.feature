Feature: Settings
  Appearance override, runner status, and signing out.

  Background:
    Given a household member is signed in

  Scenario: Switching to dark mode applies immediately
    When they open Settings
    And they pick the "dark" appearance
    Then the app is in "dark" mode

  Scenario: The runner card reflects the seeded heartbeat
    When they open Settings
    Then the runner card reports "Offline"
    And the runner card reports "6 lights in 2 rooms"

  Scenario: Signing out returns to the sign-in screen
    When they open Settings
    And they sign out
    Then they are on the sign-in screen
