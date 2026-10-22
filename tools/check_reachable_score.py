import os,re,glob
MUD='/home/mud/mud'
def nscore(p):
    f=os.path.join(MUD,'world/npc',p+'.js')
    if not os.path.exists(f): return 0
    s=open(f,encoding='utf-8').read()
    m=re.search(r'score:\s*(\d+)',s)
    return int(m.group(1)) if m else 0
rows=[]
for fb in sorted(glob.glob(os.path.join(MUD,'world/area/fb1/fb*.js'))):
    src=open(fb,encoding='utf-8').read()
    nm=os.path.basename(fb)[:-3]
    need=re.search(r'score:\s*(\d+)',src); pref=re.search(r'room_path:\s*"([^"]+)"',src)
    entry=re.search(r'first:\s*"([^"]+)"',src)
    if not (need and pref and entry): continue
    need=int(need.group(1)); pref=pref.group(1).rstrip('/')
    d=os.path.join(MUD,'world/map',pref)
    if not os.path.isdir(d): continue
    rooms={}
    for f in os.listdir(d):
        if not f.endswith('.js'): continue
        s=open(os.path.join(d,f),encoding='utf-8').read()
        ex=dict(re.findall(r'"([a-z]+)"\s*:\s*"'+re.escape(pref)+r'/([^"]+)"',s))
        npc=re.findall(r'\["'+re.escape(pref)+r'/([^"]+)"',s)+re.findall(r'NPC\.CREATE\(\s*"'+re.escape(pref)+r'/([^"]+)"',s)
        rooms[f[:-3]]={'exits':ex,'npc':npc}
    start=entry.group(1).split('/')[-1]
    seen={start} if start in rooms else set()
    q=[start]; tot=0; npcs=set()
    while q:
        c=q.pop(0)
        for t in rooms.get(c,{}).get('exits',{}).values():
            if t in rooms and t not in seen: seen.add(t); q.append(t)
        for n in rooms.get(c,{}).get('npc',[]):
            tot+=nscore(pref+"/"+n)
    rows.append((nm,pref,need,tot,len(seen),len(rooms),'OK' if tot>=need else '不足'))
print('%-8s %-10s %6s %6s %6s %6s %s'%('副本','前缀','需求','可达分','可达房','总房','状态'))
bad=0
for r in rows:
    print('%-8s %-10s %6d %6d %6d %6d %s'%r)
    if r[6]!='OK': bad+=1
print('\n不可 100% 的副本数:',bad)
