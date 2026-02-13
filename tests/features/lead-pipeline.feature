Feature: Lead pipeline capture
  As a productized-service owner
  I want to capture lead status and next steps quickly
  So I can move leads toward conversion without losing context

  Scenario: Update a lead next step from the pipeline
    Given I open the app
    When I open the Leads page
    Then I expand the first lead row
    And I update the lead field "Next Step Summary" to "Schedule discovery call"
    And I see the lead field "Next Step Summary" value "Schedule discovery call"
