Feature: Lead pipeline capture keeps revenue moving
  As a productized-service owner
  I want a clear next step and owner context for every lead
  So I can move leads toward conversion without losing momentum

  Scenario: Capture lead context and create a deal
    Given I open the app
    When I open the Leads page
    Then I expand the first lead row
    And I update the lead field "Next Step Summary" to "Schedule discovery call"
    And I update the lead field "Last Contacted At" to "2026-02-08"
    And I create a deal from the lead
