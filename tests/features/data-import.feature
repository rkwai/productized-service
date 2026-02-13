Feature: Lead data import
  As a productized-service owner
  I want to import lead data in bulk
  So I can keep the pipeline complete without manual re-entry

  Scenario: Import leads from the CSV template
    Given I open the app
    When I open the Settings page
    And I load the CSV import template for leads
    And I import leads from the template
    Then I see the lead import success message
