import { Locator } from "e2e-root/utils/appium.utils";
import RecipeDetailsScreen from "./RecipeDetailsScreen";

const searchField = 'android=new UiSelector().resourceId("com.yummly.android:id/search_src_text")';
const firstResult = 'android=new UiSelector().resourceId("com.yummly.android:id/grid_item_container")';

const SearchScreen = (client) => ({
  performSearch: async (copy) => {
    await client.enterText(searchField, copy, { locator: Locator.query, });
    // This is a keycode for keyboard action button, which in this case will execute the search
    await client.pressKeyCode(66);
  },
  selectFirstResult: async () => {
    // Since we only care about first result regardless of the content we can just hit the first element in a grid view by usining its ID only
    // We don't have to specify an index as the first element will always be the one from the top
    await client.pressElement(firstResult, { locator: Locator.query, });
    return RecipeDetailsScreen(client);
  },
});

export default SearchScreen;
