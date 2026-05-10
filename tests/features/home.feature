Feature: Buggy Cars Rating - Home Page

  Background:
    Given the user navigates to the home page

  Scenario: Home page loads successfully
    Then the landing page should be displayed
    And the navbar brand should be visible

  Scenario: User can log in from the home page
    When the user logs in with valid credentials
    Then the greeting message should be visible

  Scenario: User can navigate to Overall Rating
    When the user logs in with valid credentials
    And the user opens the Overall Rating page
    Then the cars table should be visible
    And the pagination should show page 1
    And the user navigates to page 2 on Overall Rating
    Then the cars table should be visible
    And the pagination should show page 2

  Scenario: User can vote and leave a comment
    When the user logs in using the allocated comment rotation account
    And the user opens the Overall Rating page
    Then the cars table should be visible
    And the pagination should show page 1
    When the user opens the allocated car model from Overall Rating
    Then the model detail page is ready for voting with specification and vote count recorded
    When the user submits a vote comment with timestamp and username
    Then the model vote count should increase by one
    When the user logs out from the navbar
