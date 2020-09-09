const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('Application launch', function () {
  this.timeout(10000)

  beforeEach(function () {
    this.app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')]
    })
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
        return this.app.stop()
    }
  })

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
    })
  })

  it('opens forms cookbook', function () {
      this.app.webContents.send("redirectCookbook");

      return this.app.client.getText('#root > div > div > div.hideScrollbar > div > div > div:nth-child(1)').then(function (text) {
          return assert.equal(text, 'Forms Cookbook')
      })
  })

  it('opens test-website a few times end in site', async function () {

      var times = 5;
      for(var i=0; i < times; i++){
          this.app.webContents.send("redirectHome");
          this.app.client.click('#siteselectable-poppygo-test-website');
          await this.app.client.waitUntilTextExists('#sidebar-item-openinbrowser', 'Open in Browser', 5000);
      }

      this.app.client.getText("#sidebar-item-openinbrowser > div > div > div").then(function (text) {
          return assert.equal(text, 'Open in Browser');
      })

  })
  it('opens test-website a few times end in select', async function () {

      var times = 5;
      for(var i=0; i < times; i++){
          this.app.webContents.send("redirectHome");
          this.app.client.click('#siteselectable-poppygo-test-website');
          await this.app.client.waitUntilTextExists('#sidebar-item-openinbrowser', 'Open in Browser', 5000);
      }
      this.app.webContents.send("redirectHome");
      await this.app.client.waitUntilTextExists('.App', 'select a website', 5000);

      this.app.client.getText("#root > div > div > div:nth-child(2) > div > div:nth-child(1) > div > div:nth-child(1)").then(function (text) {
          return assert.equal(text, 'All Sites');
      })

  })

  it('create new site, open it and delete afterwards', async function () {
      this.app.webContents.send("redirectHome");
  })

})
