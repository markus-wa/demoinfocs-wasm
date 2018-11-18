const puppeteer = require('puppeteer');
const path = require('path');
const isDocker = require('is-docker');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const testDir = 'test';
const goldenDir = 'golden';

describe('WSAM Parsing', () => {
  let browser = null;
  let page = null;

  var originalTimeout;

  beforeAll(async () => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
  });

  beforeEach(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

    browser = await puppeteer.launch(isDocker() ? {
      executablePath: '/usr/bin/chromium-browser'
    } : {});
    page = await browser.newPage();
    page.on("pageerror", function(err) {
      console.log("chrome pageerror:", err.toString());
    });
    page.on("error", function(err) {
      console.log("chrome error:", err.toString());
    });
    page.on('console', msg => console.log('chrome console:', msg.text()));
    await page.goto(endpoint());
  });

  afterEach(async () => {
    await browser.close();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should display stats', async () => {
    const input = await page.waitForSelector('input[type="file"]');

    const filePath = path.relative(process.cwd(), '../default.dem');
    await input.uploadFile(filePath);

    expect(await page.evaluate(e => e.files[0].name, input)).toBe('default.dem');

    // Wait until WASM initialization is complete
    const state = await page.$('span[id="state"]');
    await page.waitFor(state => state.innerText === 'ready', { timeout: 10000 }, state);

    // Click 'Parse' button
    await page.waitForSelector('#btnParse');
    // Workaround because selector.click() isn't working ('Node is either not visible or not an HTMLElement')
    await page.evaluate(() => {
      document.querySelector('#btnParse').click();
    });

    // Wait until parsing finished
    await page.waitFor(state => state.innerText === 'done', { timeout: 30000 }, state);

    await takeAndCompareScreenshot(page, 'stats')
  });
});

function endpoint() {
  return process.env.TEST_ENDPOINT ? process.env.TEST_ENDPOINT : 'http://localhost:8080';
}

// - page is a reference to the Puppeteer page.
// - fileName is the name of screenshot.
async function takeAndCompareScreenshot(page, fileName) {
  // Start the browser, go to that page, and take a screenshot.
  await page.screenshot({path: `${testDir}/${fileName}.png`});

  // Test to see if it's right.
  return compareScreenshots(fileName);
}

function compareScreenshots(fileName) {
  return new Promise((resolve, reject) => {
    const img1 = fs.createReadStream(`${testDir}/${fileName}.png`).pipe(new PNG()).on('parsed', doneReading);
    const img2 = fs.createReadStream(`${goldenDir}/${fileName}.png`).pipe(new PNG()).on('parsed', doneReading);

    let filesRead = 0;
    function doneReading() {
      // Wait until both files are read.
      if (++filesRead < 2) return;

      // The files should be the same size.
      expect(img1.width, 'image widths are the same').toBe(img2.width);
      expect(img1.height, 'image heights are the same').toBe(img2.height);

      // Do the visual diff.
      const diff = new PNG({width: img1.width, height: img2.height});
      const numDiffPixels = pixelmatch(
          img1.data, img2.data, diff.data, img1.width, img1.height,
          {threshold: 0});

      // The files should look the same.
      expect(numDiffPixels, 'number of different pixels').toBe(0);
      resolve();
    }
  });
}