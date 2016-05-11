var fs = require('fs');
var path = require('path');

function Tree(args) {
  var source = args.source;
  var output = args.output;
  var ignore = args.ignore;

  this.rootDir = source || process.cwd();;

  var ignoreList = [
    '.git$',
    '.DS_Store',
    'node_modules',
  ];

  if (ignore && ignore !== true) {
    if (Array.isArray(ignore)) {
      ignoreList = ignoreList.concat(ignore);
    } else  {
      ignoreList.push(ignore);
    }
  }

  this.ignoreList = ignoreList;

  this.outputDir = output === true ? '' : output;
}

Tree.prototype = {
  run: function () {
    var files = this.loopDir(this.rootDir);
    var str = path.basename(this.rootDir) + '\n';

    files.forEach(function (file) {
      // '│' : '|',
      // '└' : '`',
      // '├' : '|',
      // '─' : '-',
      // '┬' : '-'

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

      str += prefix + ' ' + file.name + '\n';
    });

    console.log(str);

    if (typeof this.outputDir === 'string') {
      this.saveToFile(str);
    }
  },

  /**
   * 遍历文件夹，获取所有文件，返回文件节点数组
   * @param  {string} dir     文件夹路径
   * @param  {Object} parent  父节点
   * @return {Array}
   */
  loopDir: function (dir, parent) {
    var self = this;

    var list = [];
    var filenames = fs.readdirSync(dir);

    // 排除掉在 ignore 列表中的文件/目录
    filenames = filenames.filter(function (filename) {
      return !self.isInIgnoreList(path.join(dir, filename));
    });

    filenames.forEach(function (filename, index) {
      var filePath = path.join(dir, filename);

      var states = fs.statSync(filePath);
      var item = {
        name: filename,
        depth: parent ? parent.depth + 1 : 1,
        last: index === filenames.length - 1,
        parent: parent,
      };

      list.push(item);

      if (states.isDirectory()) {
        list = list.concat(self.loopDir(filePath, item));
      }
    });

    if (parent && list.length) {
      parent.more = true;
    }

    return list;
  },

  /**
   * 检查文件/目录是否在排除列表中
   * @param  {String}  path 路径
   * @return {Boolean}
   */
  isInIgnoreList: function (path) {
    var list = this.ignoreList;

    path = path.replace(this.rootDir, '');

    for (var i = 0, n = list.length; i < n; i++) {
      if (new RegExp(list[i]).test(path)) {
        return true;
      }
    }
    return false;
  },

  /**
 * 将结果保存到文件
 * @param  {String} data 文件数据
 */
  saveToFile: function (data) {
    var filename = path.resolve(this.rootDir, this.outputDir, 'tree-output.txt');

    fs.writeFile(filename, data, 'utf-8', function () {
      console.log('文件生成成功');
    });
  }
};

module.exports = {
  run: function (args) {
    new Tree(args).run();
  }
};
