import asyncio, json, sys
from playwright.async_api import async_playwright
OUT = sys.argv[1]; URL = 'http://127.0.0.1:8791/'
async def run(p, name, vp, mobile=False):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport=vp, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
    pg = await ctx.new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL, wait_until='networkidle'); await pg.wait_for_timeout(3200)
    boxes = await pg.evaluate("""()=>Object.fromEntries(['top','ring','tilt','index','cut','library','contact'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [id,[r.top+scrollY,r.height]]}))""")
    vh = vp['height']; shots = []
    plan = [('hero0','top',0),('hero45','top',.45),('ring2','ring',.2),('ring6','ring',.6),('tilt5','tilt',.5)] + [(f'idx{i}','index',(i+.55)/10) for i in range(10)] + [('cut3','cut',.3),('cut6','cut',.6),('lib','library',-1),('foot','contact',-1)]
    for tag,id,f in plan:
        top,h = boxes[id]
        y = top + (h - vh)*f if f >= 0 else top
        await pg.evaluate(f'window.scrollTo(0,{y})'); await pg.wait_for_timeout(1400)
        path = f'{OUT}/{name}-{tag}.png'; await pg.screenshot(path=path); shots.append(path)
    # detail dialog
    await pg.evaluate("document.querySelector('#grid .shot').click()"); await pg.wait_for_timeout(900)
    await pg.screenshot(path=f'{OUT}/{name}-detail.png')
    await pg.keyboard.press('Escape')
    await pg.fill('#q', '字体'); await pg.wait_for_timeout(300)
    n = await pg.evaluate("document.getElementById('libCount').textContent")
    print(name, 'errors:', errs, 'search 字体 ->', n)
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p,'d',{'width':1440,'height':900})
        await run(p,'m',{'width':390,'height':844},True)
asyncio.run(main())

