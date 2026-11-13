from PIL import Image
import glob, os, shutil, sys
src, dst = sys.argv[1], sys.argv[2]
for d in ['c','h','img']: os.makedirs(os.path.join(dst,'assets',d), exist_ok=True)
n=0
for f in glob.glob(os.path.join(src,'assets','img','*-tall.webp')):
    i=os.path.basename(f)[:-10]
    im=Image.open(f).convert('RGB'); w,h=im.size
    im.crop((0,0,w,int(w*4/3))).resize((450,600),Image.LANCZOS).save(os.path.join(dst,'assets','c',i+'.webp'),quality=80,method=6)
    shutil.copy(f, os.path.join(dst,'assets','img'))
    n+=1
for f in glob.glob(os.path.join(src,'assets','img','*-hero.webp')):
    i=os.path.basename(f)[:-10]
    Image.open(f).convert('RGB').resize((720,450),Image.LANCZOS).save(os.path.join(dst,'assets','h',i+'.webp'),quality=80,method=6)
for a in ['fonts.css','serif.css','logo.svg','qr-xhs.png','yy-avatar.webp']:
    shutil.copy(os.path.join(src,'assets',a), os.path.join(dst,'assets',a))
shutil.copy(os.path.join(src,'data.js'), os.path.join(dst,'data.js'))
print('cards',n)
