Feature: Bulk import keeps the pipeline current
  As a productized-service owner
  I want to import lead data in bulk
  So I can keep the pipeline complete without manual re-entry

  Scenario: Import leads and confirm they appear in the pipeline
    Given I open the app
    When I open the Settings page
    And I load the CSV import template for leads
    And I import leads from the template
    Then I see the lead import success message
    When I open the Leads page
    Then I see the lead pipeline updated
