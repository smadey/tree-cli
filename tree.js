var fs = require('fs');
var path = require('path');

var rootDir = '/Users/Smadey/Projects/Aiding/AidingUserV4';
var ignores = [
  '.git$',
  '.DS_Store',
  '/lib/',
  '/node_modules/.*',
  '/www/.*',
  '/platforms/.*/.*',
  '/plugins/.*/.*',
  '/resources/.*/.*',
  '/app/component/.*/.*',
  '/app/img/.*',
  '/app/icon/.*',
  '/app/font/.*',
  // '/module/',
];

/*
 * 遍历文件夹，获取所有文件
 * @param path 文件夹路径
 * @param parent 父节点
 * @return array 文件节点树组
 */
function loopDir(dir, parent) {
  var list = [];
  var filenames = fs.readdirSync(dir);

  filenames.forEach(function (filename, index) {
    var filePath = `${dir}/${filename}`;

    if (isInIgnoreList(filePath)) {
      return;
    }

    var states = fs.statSync(filePath);
    var item = {
      name: filename,
      depth: parent ? parent.depth + 1 : 1,
      last: index === filenames.length - 1,
      parent: parent,
    };

    list.push(item);

    if (states.isDirectory()) {
      list = list.concat(loopDir(filePath, item));
    }
  });

  if (parent && list.length) {
    parent.more = true;
  }

  return list;
}

function isInIgnoreList(path) {
  path = path.replace(rootDir, '');

  for (var i = 0, n = ignores.length; i < n; i++) {
    if (new RegExp(ignores[i]).test(path)) {
      return true;
    }
  }
  return false;
}

/*
 * 写入文件utf-8格式
 * @param filename 文件名
 * @param data 数据
 */
function writeFile(filename, data) {
  fs.writeFile(filename, data, 'utf-8', function () {
    console.log('文件生成成功');
  });
}

var files = loopDir(rootDir);

var str = `${path.basename(rootDir)}\n`;
files.forEach(function (file) {
  var prefix = '';

  var parent = file.parent;
  var prefixs = [];
  while (parent) {
    prefixs.push(parent.last ? '  ' : '│ ');
    parent = parent.parent;
  }

  prefix = prefixs.reverse().join('');

  if (file.last) {
    prefix += '└';
  } else {
    prefix += '├';
  }

  prefix += '─';

  if (file.more) {
    prefix += '┬';
  } else {
    prefix += '─';
  }

  str += `${prefix} ${file.name}\n`;
});

// writeFile('output.txt', str);
console.log(str);
