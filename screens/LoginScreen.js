import { Locator } from "e2e-root/utils/appium.utils";
import MainMenuScreen from "./MainMenuScreen";

const doItLaterButton = 'android=new UiSelector().resourceId("com.yummly.android:id/skip_view")';

const LoginScreen = (client) => ({
  checkIfHasLoaded: async () => {
    // Faced some long loading time occasionally
    await client.getElement(doItLaterButton, { locator: Locator.query, timeout: 45000, });
  },
  skipLogin: async () => {
    await client.pressElement(doItLaterButton, { locator: Locator.query, });
    return MainMenuScreen(client);
  },
});

export default LoginScreen;
