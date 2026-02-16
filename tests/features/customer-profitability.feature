Feature: Profitability by segment drives marketing focus
  As a productized-service owner
  I want to see profit concentration and LTV:CAC by segment
  So I can focus spend on the most profitable customers

  Scenario: Review segment profitability and log a focus decision
    Given I open the app
    When I open the Customers page
    Then I see the segment profitability summary
    And I see profit concentration guidance
    And I set focus on the most profitable segment
    And I update the customer field "Customer Acquisition Cost" to "1200"
    And I update the customer field "Gross Margin Pct" to "65"
