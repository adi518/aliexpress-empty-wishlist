const fs = require("fs");
const dotenv = require("dotenv");
const puppeteer = require("puppeteer");

function overrideEnv() {
  const envConfig = dotenv.parse(fs.readFileSync(".env"));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

overrideEnv();

const WISHLIST_URL =
  "https://my.aliexpress.com/wishlist/wish_list_product_list.htm";

(async ({ username, password, usernameSelector, removeItemSelector }) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const [page] = await browser.pages();

  page.setDefaultNavigationTimeout(0);

  async function login() {
    await page.waitForSelector(usernameSelector, { visible: true });
    await page.focus(usernameSelector);
    await page.keyboard.type(username);
    await page.waitForSelector("[type=password]", { visible: true });
    await page.focus("[type=password]");
    await page.keyboard.type(password);
    await page.click("[type=submit]");
    await page.waitForNavigation();
  }

  await page.goto(WISHLIST_URL);
  await login();

  while ((await page.$$(removeItemSelector)).length) {
    await Promise.all([
      page.waitForNavigation(),
      page.click(removeItemSelector),
    ]);
  }

  await browser.close();
})({
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  removeItemSelector: ".remove",
  usernameSelector: "#fm-login-id",
});
