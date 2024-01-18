import { Locator } from "e2e-root/utils/appium.utils";
import SearchScreen from "./SearchScreen";

const searchButton = 'android=new UiSelector().resourceId("search_field")';

const MainMenuScreen = (client) => ({
  navigateToSearch: async () => {
    // This element has a long loading time, at least on my end and thus the timeout is being set to high
    await client.pressElement(searchButton, { locator: Locator.query, timeout: 45000, });
    return SearchScreen(client);
  },
});

export default MainMenuScreen;
