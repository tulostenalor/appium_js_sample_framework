import { initialiseClientMethods } from 'e2e-root/utils/appium.utils';
import { LoginScreen } from 'e2e-root/screens'

let client;

// a timeout just in case tests will run for too long 
jest.setTimeout(100000);

import options from './../config/device.json';

beforeEach(async () => {
  client = await initialiseClientMethods(options);
});

describe('yummly app', () => {
  describe('receipt', () => {
    test('for tiramisu can be found and ingredients added', async () => {
      const loginScreen = await LoginScreen(client);
      await loginScreen.checkIfHasLoaded();

      const mainMenuScreen = await loginScreen.skipLogin();

      const searchScreen = await mainMenuScreen.navigateToSearch();
      await searchScreen.performSearch('tiramisu');

      let recipeDetailsScreen = await searchScreen.selectFirstResult();
      await recipeDetailsScreen.navigateToIngredientsTab();
      await recipeDetailsScreen.scrollToLastIngredient();
      await recipeDetailsScreen.addLastIngredient();

      const shoppingListScreen = await recipeDetailsScreen.navigateToShoppingList();
      await shoppingListScreen.dismissOverlays();

      recipeDetailsScreen = await shoppingListScreen.navigateToRecipeScreenFromIngredient();
      await recipeDetailsScreen.navigateToIngredientsTab();
      await recipeDetailsScreen.scrollToLastIngredient();
      await recipeDetailsScreen.validateMinusButtonAppearsAgainstLastIngredient();
    });
  });
});