Feature: Customer profitability management
  As a productized-service owner
  I want to review segment profitability and update customer economics
  So I can focus on the most profitable customers and segments

  Scenario: Update a customer record while reviewing profitability
    Given I open the app
    When I open the Customers page
    Then I see the segment profitability summary
    And I expand the first customer row
    And I update the customer field "Account Name" to "Acme Retainer"
    And I see the customer field "Account Name" value "Acme Retainer"
