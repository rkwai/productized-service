Feature: Owner decision cockpit delivers next focus in minutes
  As a productized-service owner
  I want the cockpit to surface the next focus and most profitable segment fast
  So I can decide where to invest outreach and marketing

  Scenario: See the core value signals that justify the monthly subscription
    Given I open the app
    Then I see the global navigation
    And I see the decision cockpit purpose statement
    And I am on the Home page
    And I see the owner value brief highlights
    And I see the priority focus recommendation
    And I see the focus value at stake
    And I see the "Most Profitable Segment" KPI
    And I see the home KPI "Customer LTV:CAC"
    And I see the "Spend recommendation" note
