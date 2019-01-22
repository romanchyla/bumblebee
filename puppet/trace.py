https://github.com/GoogleChrome/puppeteer/issues/1368

import asyncio
from pyppeteer import launch
url = 'https://devui.adsabs.harvard.edu/#abs/2019NewA...66...20P/abstract'
browser = await launch(headless = False)
page = await browser.newPage()
await page.goto(url, waitUntil='networkidle0')
await page.close()
page = await browser.newPage()
await page.goto(url, waitUntil='networkidle0')
await page.tracing.start({'path': 'trace.json'})
await page.goto(url, waitUntil='networkidle0')
metrics = await page._client.send('Performance.getMetrics');
metrics
await page.evaluate('''() => window.performance.timing''')
await page.evaluate('''() => { return window.performance.timing}''')
await page.evaluate('''() => { return window.location.url}''')
print await page.evaluate('''() => { return window.location.url}''')
await page.evaluate('''() => { return {foo: window.location.url}}''')
await page.evaluate('''() => { return {foo: window.location}}''')
await page.evaluate('''() => { return window.location}''')
await page.evaluate('''() => { return window.performance}''')
await page.evaluate('''() => { return window.performance.timing}''')
await page.evaluate('''() => { return window.performance.timing.domComplete}''')
await page.evaluate('''() => { return JSON.stringify(window.performance)}''')
await page.evaluate('''() => { return JSON.stringify(window.performance)}''')
import json
json.loads(await page.evaluate('''() => { return JSON.stringify(window.performance)}'''))
import time
import datetime
from datetime import datetime
datetime.fromtimestamp(1548189652686.5452)
datetime.fromordinal(1548189652686.5452)
datetime.utcfromtimestamp?
await page.tracing.stop()
await page.close()
def getw(browser, url):
    await page = browser.newPage()
async def getw(browser, url):
    await page = browser.newPage()
def async getw(browser, url):
    await page = browser.newPage()
async getw(browser, url):
    await page = browser.newPage()
async def foo():
    foo = 1
async get(browser, url):
    page = await browser.newPage()
async def get(browser, url):
    page = await browser.newPage()
async def get(browser, url):
    page = await browser.newPage()
    await page.tracing.start({path: 'trace.json'})
    await page.goto(url, {wait: 'networkidle0'})
    trace = await page.tracing.stop()
    perf = json.loads(await page.evaluate('''() => JSON.stringify(window.performance)'''))
    return {'trace': trace, 'perf': perf}
x = get(browser, url)
x
x.send()
x = await get(browser, url)
async def get(browser, url):
    page = await browser.newPage()
    await page.tracing.start({'path': 'trace.json'})
    await page.goto(url, {wait: 'networkidle0'})
    trace = await page.tracing.stop()
    perf = json.loads(await page.evaluate('''() => JSON.stringify(window.performance)'''))
    return {'trace': trace, 'perf': perf}
x = await get(browser, url)
%hist
async def get(browser, url):
    page = await browser.newPage()
    await page.tracing.start({'path': 'trace.json'})
    await page.goto(url, waitUntil='networkidle0')
    trace = await page.tracing.stop()
    perf = json.loads(await page.evaluate('''() => JSON.stringify(window.performance)'''))
    return {'trace': trace, 'perf': perf}
x = await get(browser, url)
await browser.close()
browser = await launch(headless = False)
x = await get(browser, url)
x
x['trace'].keys()
x['trace'][0:300]
t = json.loads(x['trace'])
t.keys()
t['traceEvents'].keys()
t['traceEvents'][0]
t['traceEvents'][1]
filter(t['traceEvents'], lambda x: x['name'] == 'ResourceFinish')
filter(lambda x: x['name'] == 'ResourceFinish', t['traceEvents'])
list(filter(lambda x: x['name'] == 'ResourceFinish', t['traceEvents']))
len(list(filter(lambda x: x['name'] == 'ResourceFinish', t['traceEvents'])))
y
t.keys()
t['metadata']
 %history

