Feature: Product Feature

  Background:
    Given I open the "https://www.saucedemo.com/" page

  # A) Validate sort-by-price using a Scenario Outline
  Scenario Outline: Validate product sort by price <sort_label>
    Then I will login as 'standard_user'
    Then I sort the items by "<sort_label>"
    Then I should see all <count> items sorted correctly by price "<sort_label>"

    Examples:
      | sort_label          | count |
      | Price (high to low) | 6     |
      | Price (low to high) | 6     |

  # B) Validate sort-by-name using a Scenario Outline
  Scenario Outline: Validate product sort by name <sort_label>
    Then I will login as 'standard_user'
    Then I sort the items by "<sort_label>"
    Then I should see all <count> items sorted correctly by name "<sort_label>"

    Examples:
      | sort_label    | count |
      | Name (A to Z) | 6     |
      | Name (Z to A) | 6     |

  # C) Validate the available sort options in the dropdown
  Scenario: Validate available sort options
    Then I will login as 'standard_user'
    Then I should see the sort options:
      | Name (A to Z)       |
      | Name (Z to A)       |
      | Price (low to high) |
      | Price (high to low) |

  # D) Add multiple items and validate cart badge count
  Scenario Outline: Validate cart badge updates for added items
    Then I will login as 'standard_user'
    Then I add items to cart: <items_csv>
    Then I should see the cart badge count <expected_count>

    Examples:
      | items_csv                                                       | expected_count |
      | Sauce Labs Backpack,Sauce Labs Bike Light                       | 2              |
      | Sauce Labs Bolt T-Shirt,Sauce Labs Fleece Jacket,Sauce Labs Onesie | 3           |

  # E) Price formatting sanity check
  Scenario: Validate price formatting for all items
    Then I will login as 'standard_user'
    Then each item price should match the currency format

  # F) Validate ordering AFTER viewing details and returning
  #    (Sauce Demo returns to A->Z after navigating back)
  Scenario Outline: Validate ordering after viewing details and returning
    Then I will login as 'standard_user'
    Then I sort the items by "<initial_sort>"
    Then I open the first product details
    Then I go back to inventory list
    Then the inventory should be sorted by "<expected_after_nav>"

    Examples:
      | initial_sort        | expected_after_nav |
      | Price (low to high) | Name (A to Z)      |
      | Name (Z to A)       | Name (A to Z)      |

  # G) Reset App State clears cart
  Scenario: Validate Reset App State clears cart
    Then I will login as 'standard_user'
    Then I add items to cart: Sauce Labs Backpack,Sauce Labs Onesie
    Then I should see the cart badge count 2
    Then I reset app state
    Then I should see no cart badge
