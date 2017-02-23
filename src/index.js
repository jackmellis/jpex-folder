const glob = require('glob');
const path = require('path');

exports.name = 'jpex-folder';
exports.install = function ({Jpex, on}) {
  Jpex.register.folder = folder.bind(Jpex, {});

  on('factories', function ({register, options, Class}) {
      register('folder', folder.bind(Class, options));
  });
  on('privateProperties', function ({options, apply}) {
      apply({
          $$dependencies : {
              get : function () {
                  return (options.dependencies || []).slice();
              }
          }
      });
  });
};

function folder(jpexConfig, target, options) {
    options = Object.assign({
        type : 'auto',
        lifecycle : jpexConfig.defaultLifecycle,
        prefix : '',
        suffix : '',
        prefixFolder : true,
        pattern : '**/*.js',
        transform : transform,
        register : register
    }, options);

    const fullPath = path.isAbsolute(target) ? target : path.resolve(target);

  // Retrieve all files that match the provided pattern
    glob
    .sync(options.pattern, {cwd : fullPath})
    .map(filename => {
        const info = path.parse(filename);
        const folders = info.dir ? info.dir.split('/') : [];
        const ext = info.ext;
        const base = info.name;
        const name = options.transform.call(this, base, folders, ext, options);

        return {
            path : [target, filename].join('/'),
            file : base,
            name : name
        };
    })
    .filter(function (file) {
      // Remove empty names
        return !!file.name;
    })
    .forEach(file => {
        const content = require(path.resolve(file.path));
        options.register.call(this, file.name, content, options);
    });

    return this;
}

function transform(file, folders, ext, options) {
    const result = [];

    if (options.prefix){
        result.push(options.prefix);
    }
    if (options.prefixFolder){
        result.push(folders);
    }
    if (file !== 'index'){
        result.push(file);
    }
    if (options.suffix){
        result.push(options.suffix);
    }

    const name = result.map(n => toPascal(n)).join('');
    return name.charAt(0).toLowerCase() + name.substr(1);
}

function register(name, data, options) {
    let f;
    switch(options.type.toLowerCase()){
    case 'factory':
        assertFunction(data, 'Factory');
        f = this.register.factory(name, data.dependencies, data);
        break;

    case 'service':
        assertFunction(data, 'Service');
        f = this.register.service(name, data.dependencies || data.$$dependencies, data);
        break;

    case 'constant':
        f = this.register.constant(name, data);
        return;

    case 'auto':
        if (typeof data === 'function'){
            if (data.extend && data.register && data.register.service){
                f = this.register.service(name, data.dependencies || data.$$dependencies, data);
            }else{
                f = this.register.factory(name, data.dependencies, data);
            }
        }else{
            f = this.register.constant(name, data);
            return;
        }
        break;
    }

    if (!f){
        return;
    }

    if (data && data.lifecycle){
        switch(typeof data.lifecycle){
        case 'string':
            if (f.lifecycle[data.lifecycle]){
                f.lifecycle[data.lifecycle]();
            }
            break;
        case 'number':
            this.$$factories[name].lifecycle = data.lifecycle;
            break;
        }
    }else if (options.lifecycle){
        switch(typeof options.defaultLifecycle){
        case 'string':
            if (f.lifecycle[options.lifecycle]){
                f.lifecycle[options.lifecycle]();
            }
            break;
        case 'number':
            this.$$factories[name].lifecycle = options.lifecycle;
            break;
        }
    }
}

function toPascal(arr) {
    return [].concat(arr).map(folder => folder.charAt(0).toUpperCase() + folder.substring(1).toLowerCase()).join('');
}

function assertFunction(obj, expected) {
    const t = typeof obj;
    if (t !== 'function'){
        throw new Error(expected + ' type expected but got ' + t);
    }
}
