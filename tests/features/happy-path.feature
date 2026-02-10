Feature: Owner cockpit happy path

  Scenario: Navigate core pages and update admin metadata
    Given I open the app
    Then I see the global navigation
    And I am on the Home page
    And I see the home KPI "Customer LTV:CAC"
    And I see the "Spend recommendation" note
    When I open the Customers page
    Then I see the segment profitability summary
    And I expand the first customer row
    When I open the Leads page
    Then I expand the first lead row
    When I open the Activation Health page
    Then I see the Activation Health page
    When I open the Settings page
    Then I update the company name to "Acme Analytics"
    And I see the JSON output includes company name "Acme Analytics"
