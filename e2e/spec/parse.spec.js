const puppeteer = require('puppeteer');
const path = require('path');

describe('WSM Parsing', () => {
  let browser = null;
  let page = null;

  beforeEach(async () => {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser'
    });
    page = await browser.newPage();
    await page.goto('http://web:80');
  });

  afterEach(async () => {
    await browser.close();
  });

  it('should parse the demo', async () => {
    const filePath = path.relative(process.cwd(), __dirname + '/default.dem');
    const input = await page.$('input[type="file"]');
    await input.uploadFile(filePath);
    expect(await page.evaluate(e => e.files[0].name, input)).toBe('default.dem');

    await page.screenshot({path: process.cwd() + '/example.png'});
  });
});
