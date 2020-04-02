const fs = require('fs')
const dotenv = require('dotenv')
const puppeteer = require('puppeteer')

function overrideEnv() {
  const envConfig = dotenv.parse(fs.readFileSync('.env'))
  for (const k in envConfig) {
    process.env[k] = envConfig[k]
  }
}

overrideEnv()

const WISHLIST_URL =
  'https://my.aliexpress.com/wishlist/wish_list_product_list.htm'

;(async ({
  username,
  password,
  usernameSelector,
  passwordSelector,
  submitSelector,
  removeSelector
}) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  })
  const pages = await browser.pages()
  const page = pages[0]
  await page.goto(WISHLIST_URL)
  await page.waitForSelector(usernameSelector, { visible: true })
  await page.focus(usernameSelector)
  await page.keyboard.type(username)
  await page.waitForSelector(passwordSelector, { visible: true })
  await page.focus(passwordSelector)
  await page.keyboard.type(password)
  await Promise.all([page.waitForNavigation(), page.click(submitSelector)])
  while ((await page.$$(removeSelector)).length) {
    await Promise.all([page.waitForNavigation(), page.click(removeSelector)])
  }
  await browser.close()
})({
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  usernameSelector: '#fm-login-id',
  passwordSelector: '#fm-login-password',
  submitSelector: 'button[type=submit]',
  removeSelector: '.remove'
})
