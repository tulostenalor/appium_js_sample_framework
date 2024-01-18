const { resolve } = require('path');

import { compareImages } from "e2e-root/utils/image.utils";
import { Locator, Direction, Position } from "e2e-root/utils/appium.utils";
import ShoppingListScreen from "./ShoppingListScreen";

const ingredientsTab = 'android=new UiSelector().resourceId("com.yummly.android:id/text1").text("Ingredients")';
const ingredientsScrollList = 'android=new UiSelector().className("androidx.recyclerview.widget.RecyclerView")';
const listElementByClass = 'android=new UiSelector().className("androidx.compose.ui.viewinterop.ViewFactoryHolder")';
const endOfListElement = 'android=new UiSelector().text("Report Issue")';
const shoppingListButton = 'android=new UiSelector().text("Ingredients updated in your Shopping List")';

export const getLastIngredientToggle = async (client) => {
  const ingredientsCount = await client.countElements(listElementByClass);

  return 'android=new UiSelector()' +
          '.className("androidx.compose.ui.viewinterop.ViewFactoryHolder")' +
          `.index(${ingredientsCount-1})` +
          '.childSelector(new UiSelector()' +
          '.className("android.view.ViewGroup")' +
          '.childSelector(new UiSelector()' +
          '.resourceId("com.yummly.android:id/related_recipe_favorite")))';
};

const RecipeDetailsScreen = (client) => ({
  navigateToIngredientsTab: async () => {
    // This element has a long loading time, at least on my end and thus the timeout is being set to high
    await client.pressElement(ingredientsTab, { locator: Locator.query, });
  },
  scrollToLastIngredient: async () => {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      if (await client.isElementDisplayed(endOfListElement, { locator: Locator.query, })) {
        break;
      }

      await client.swipeElement( Direction.up, Position.bottom, ingredientsScrollList, { locator: Locator.query, });
      attempts++
    }
  },
  addLastIngredient: async () => {
    await client.pressElement(await getLastIngredientToggle(client), { locator: Locator.query, });
  },
  navigateToShoppingList: async () => {
    // Oh yes this is a very nasty hack, however I do not have any alternatives
    // In order to navigate to a 'shopping list' a specific part of text need to be selected
    // By default Appium selects elements by tapping in the centre of it and since we don't have any id
    // We need calculate the approximate area for it :(
    // In an ideal world I would just simply ask developers to add element ID or add it myself
    // Please note that provided solution might not be compatible with some devices (tested on Pixel 3a)

    await client.pressElementToTheRight(shoppingListButton, { locator: Locator.query, });
    return ShoppingListScreen(client);
  },
  validateMinusButtonAppearsAgainstLastIngredient: async () => {
    // Ok, another issue with element/hierarchy - both minus and plus toggle new to ingredient
    // Have the same properties and therefore there is no non-visual way of asserting its state
    // Thus I have turned to 'pixelmatch' and a simple image (visual) comparison process

    const currentDir = `${__dirname}`;
    const baselineImageDir = resolve(currentDir, '../images');

    const baselineImagePath = `${baselineImageDir}/minusBaseline.png`;
    const newImagePath = `${baselineImageDir}/minusBaseline-new.png`;

    const element = await client.getElement(await getLastIngredientToggle(client), { locator: Locator.query, });
    await element.saveScreenshot(newImagePath);

    const diff = await compareImages(baselineImagePath, newImagePath);

    if (diff > 0) {
      throw new Error(`[!] Image diff is greater than expected (0) -> ${diff}`);
    }
  },
});

export default RecipeDetailsScreen;
