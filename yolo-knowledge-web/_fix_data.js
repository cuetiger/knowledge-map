const fs = require('fs');
let content = fs.readFileSync('f:/code/trae/knowledge-map/yolo-knowledge-web/js/data.js', 'utf8');
const startMarker = '"01-YOLO基础概念/核心指标与技术术语详解": {';
const endMarker = '"02-Ultralytics框架入门/环境搭建与安装": {';
const si = content.indexOf(startMarker);
const ei = content.indexOf(endMarker);
if (si !== -1 && ei !== -1) {
  const beforeEnd = content.substring(0, ei);
  const lastBrace = beforeEnd.lastIndexOf('},');
  if (lastBrace > si) {
    content = content.substring(0, si - 4) + content.substring(lastBrace + 2);
    fs.writeFileSync('f:/code/trae/knowledge-map/yolo-knowledge-web/js/data.js', content, 'utf8');
    console.log('OK: removed broken entry');
  } else {
    console.log('FAIL: closing brace not found, lastBrace=' + lastBrace + ' si=' + si);
  }
} else {
  console.log('FAIL: si=' + si + ' ei=' + ei);
}
