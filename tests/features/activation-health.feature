Feature: Activation health protects retention revenue
  As a productized-service owner
  I want to monitor activation progress and renewal risk
  So I can intervene before retention revenue is at risk

  Scenario: Review activation completion and upcoming renewals
    Given I open the app
    When I open the Activation Health page
    Then I see the Activation Health page
    And I see activation completion rate
    And I see the next renewal date
