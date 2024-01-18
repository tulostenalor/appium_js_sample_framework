const wdio = require('webdriverio');

export const Direction = { up: 'up', down: 'down', left: 'left', right: 'right' };
export const Position = { top: 'top', middle: 'middle', bottom: 'bottom' };
export const SwipeForce = { sharply: 500, gently: 2500 };
export const Locator = { id: 'id', text: 'text', query: 'query' };

const defaultTimeout = 35000;
const defaultOptions = { timeout: defaultTimeout, locator: Locator.id };

export const extendDefaultOptions = (options) => ({ ...defaultOptions, ...options });

const getTextSelector = (text) => {
  return `android=new UiSelector().text("${text}")`;
};

const constructElement = async (client, selector, locator) => {
  let element;

  if (locator === Locator.id) {
    element = await client.$(`~${selector}`);
  } else if (locator === Locator.text) {
    element = await client.$(`${getTextSelector(selector)}`);
  } else if (locator === Locator.query) {
    element = await client.$(`${selector}`);
  } else {
    throw `Unsupported locator -> ${locator}`;
  }

  return element;
};

export const getElement = async (client, selector, options) => {
  const { timeout, locator } = extendDefaultOptions(options);
  const element = await constructElement(client, selector, locator);

  await element.waitForDisplayed(timeout, false, `Unable to detect element by selector -> ${selector}`, 500);

  return element;
};

export const countElements = async (client, selector) => {
  const elements = await client.$$(`${selector}`);
  return elements.length;
};

const isElementDisplayed = async (client, selector, options) => {
  const { locator } = extendDefaultOptions(options);
  const element = await constructElement(client, selector, locator);

  return element.isDisplayed();
};

const waitForElementToNotExist = async (client, selector, options) => {
  const { timeout, locator } = extendDefaultOptions(options);
  const element = await constructElement(client, selector, locator);

  await element.waitForDisplayed(timeout, true, `Able to detect element by selector -> ${selector}`, 500);
};

export const swipeElement = async (client, direction, position, elementId, options, force) => {
  let endPoint;
  let startPoint;

  const elementBorder = 5;
  const element = await getElement(client, elementId, options);
  const elementPosition = await element.getLocation();
  const elementFrame = await element.getSize();

  console.log(`position -> ${JSON.stringify(elementPosition)}, frame -> ${JSON.stringify(elementFrame)}`);

  switch (position) {
    case Position.top:
      startPoint = { x: elementPosition.x + elementFrame.width / 2, y: elementPosition.y + elementBorder };
      break;
    case Position.middle:
      startPoint = { x: elementPosition.x + elementFrame.width / 2, y: elementPosition.y + elementFrame.height / 2 };
      break;
    case Position.bottom:
      startPoint = {
        x: elementPosition.x + elementFrame.width / 2,
        y: elementPosition.y + elementFrame.height - elementBorder,
      };
      break;
    default:
      client.error(`Unsupported position -> ${position}`);
  }

  switch (direction) {
    case Direction.down:
      endPoint = {
        x: elementPosition.x + elementFrame.width / 2,
        y: elementPosition.y + elementFrame.height - elementBorder,
      };
      break;
    case Direction.up:
      endPoint = {
        x: elementPosition.x + elementFrame.width / 2,
        y: elementPosition.y + elementBorder,
      };
      break;
    case Direction.right:
      endPoint = {
        x: elementPosition.x + elementFrame.width - elementBorder,
        y: elementPosition.y + elementFrame.height / 2,
      };
      break;
    case Direction.left:
      endPoint = { x: elementPosition.x + elementBorder, y: elementPosition.y + elementFrame.height / 2 };
      break;
    default:
      client.error(`Unsupported direction -> ${direction}`);
  }

  console.log(`start -> ${JSON.stringify(startPoint)}, end -> ${JSON.stringify(endPoint)}`);

  await client.touchPerform([
    {
      action: 'press',
      options: startPoint,
    },
    {
      action: 'wait',
      options: { ms: force },
    },
    {
      action: 'moveTo',
      options: endPoint,
    },
    {
      action: 'release',
    },
  ]);
};

const pressElementToTheRight = async (client, selector, options) => {
  const element = await getElement(client, selector, options);

  const location = await element.getLocation();
  const size = await element.getSize();

  const tapX = location.x + size.width - 20;
  const tapY = location.y + (size.height / 2);

  await client.touchAction({
    action: 'tap',
    x: tapX,
    y: tapY
  });
};

export const initialiseClientMethods = async (clientConfig) => {
  let client = await wdio.remote(clientConfig);

  return {
    getElement: (selector, options) => getElement(client, selector, options),
    isElementDisplayed: (selector, options) => isElementDisplayed(client, selector, options),
    waitForElementToNotExist: (selector, options) => waitForElementToNotExist(client, selector, options),
    countElements: (selector, options) => countElements(client, selector, options),
    pressElement: async (selector, options) =>
    (await getElement(client, selector, options)).click(),
    enterText: async (selector, text, options) => (await getElement(client, selector, options)).setValue(text),
    pressKeyCode: (code) => client.pressKeyCode(code),
    swipeElement: (direction, position, selector, options, force = SwipeForce.sharply) =>
      swipeElement(client, direction, position, selector, options, force),
    pressElementToTheRight: async (selector, options) => await pressElementToTheRight(client, selector, options),
    // getClient: () => client, // for debugging purposes only, allows access to client directly from screen
  }
};
