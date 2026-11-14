Feature: Control the holiday lights
  The Lights screen shows the real inventory the runner mirrored and lets a
  household member pick a theme, pattern, and power state that persists.

  Background:
    Given a household member is signed in

  Scenario: The seeded inventory and runner state are shown
    When they open the Lights screen
    Then the "Living Room" room is listed with 4 lights
    And the "Porch" room is listed with 2 lights
    And the runner shows as "Runner offline"

  Scenario: Choosing a theme and pattern persists across a reload
    When they open the Lights screen
    And they choose the "candy-cane" theme
    And they choose the "alternate" pattern
    And they reload the app
    Then the "candy-cane" theme is selected
    And the "alternate" pattern is selected

  Scenario: Turning the lights off darkens the preview and persists
    When they open the Lights screen
    And they turn the lights off
    Then the preview shows 0 lit bulbs
    When they reload the app
    Then the preview shows 0 lit bulbs
    When they turn the lights on
    Then the preview shows 8 lit bulbs
