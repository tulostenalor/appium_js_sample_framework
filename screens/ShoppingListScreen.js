import { Locator } from "e2e-root/utils/appium.utils";
import RecipeDetailsScreen from "./RecipeDetailsScreen";

const signInOverlayCloseButton = 'android=new UiSelector().resourceId("com.yummly.android:id/alert_close_button")';
const editItemOverlayDismissButton = 'android=new UiSelector().resourceId("com.yummly.android:id/frontView")';

const ingredientOptionMenuButton = 'android=new UiSelector().resourceId("com.yummly.android:id/expand_menu")';
const ingredientOptionOpenLayout = 'android=new UiSelector().className("android.widget.LinearLayout").resourceId("com.yummly.android:id/backView")';

// Bit overcomplicated selector, however wanted to avoid selecting item just by text in this case
// Also I know cases where word 'RECIPE' in a menu would be spelled differently (e.g 'Recipe') on various devices / OS - this might be tricky as well
const recipeMenuButton = 'android=new UiSelector().className("android.widget.LinearLayout").resourceId("com.yummly.android:id/backView")' +
                        '.childSelector(new UiSelector().className("android.widget.LinearLayout").childSelector(new UiSelector()' + 
                        '.className("android.widget.TextView").text("RECIPE")))';

const ShoppingListScreen = (client) => ({
  dismissOverlays: async () => {
    await client.pressElement(signInOverlayCloseButton, { locator: Locator.query });

    // As weird as it sounds the 'Edit Item' overlay is not being shown in the app hierarchy
    // Since it can be simply dismissed by tapping anywhere outside, we can just tap on any item regardless (for example a text label)
    // However this is yet another 'hack' and proper solution should be devised with developers
    // Also occasionally there a delay with this popup and thus we need to wait for related elements to show first (ingredient option menu layout)
    await client.getElement(ingredientOptionOpenLayout, { locator: Locator.query });
    await client.pressElement(editItemOverlayDismissButton, { locator: Locator.query });
    // Important [!] we wait for the animation to finish correctly, otherwise it can cause flakiness
    await client.waitForElementToNotExist(ingredientOptionOpenLayout, { locator: Locator.query });
  },
  // In future I would recommend to move this method into its own 'Screen', however since this is a small scale task, I think it is fine as it is
  navigateToRecipeScreenFromIngredient: async () => {
    // Ok, sine we know there is only one item in the list, we can for now don't worry about selecting a wrong item
    // In case of a more complex scenario this might however be required 
    await client.pressElement(ingredientOptionMenuButton, { locator: Locator.query });
    await client.pressElement(recipeMenuButton, { locator: Locator.query });

    return RecipeDetailsScreen(client);
  },
});

export default ShoppingListScreen;
