Feature: Workspace configuration
  As a productized-service owner
  I want to update workspace metadata
  So the cockpit reflects the latest company details

  Scenario: Update company metadata in Settings
    Given I open the app
    When I open the Settings page
    Then I update the company name to "Acme Analytics"
    And I see the JSON output includes company name "Acme Analytics"
