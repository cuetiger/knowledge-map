import os

path = r'f:\code\trae\knowledge-map\yolo-knowledge-web\js\data.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '"01-YOLO基础概念/核心指标与技术术语详解": {'
end_marker = '"02-Ultralytics框架入门/环境搭建与安装": {'

si = content.find(start_marker)
ei = content.find(end_marker)
print(f'start={si}, end={ei}')

if si > 0 and ei > 0:
    before_end = content[:ei]
    last_brace = before_end.rfind('},')
    print(f'last_brace={last_brace}')
    if last_brace > si:
        content = content[:si - 4] + content[last_brace + 2:]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('OK: removed broken entry')
    else:
        print('FAIL: no closing brace found')
else:
    print('FAIL: markers not found')
