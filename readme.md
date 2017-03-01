# Jpex Folders Plugin  
Automatically register factories/services from files in folders.

## Installaction  
`npm install jpex-folder`

## Usage  
```javascript
var Jpex = require('jpex');
var plugin = require('jpex-folder');
Jpex.use(plugin);

// Register all factories in current_working_directory/factories
Jpex.register.folder('factories', options);
```
This means you can organise your application in a logical manner and then have all dependencies automatically loaded and injected into your jpex classes.  

## Options  
The Options parameter takes the following options:  
### type  
The type of dependency you want to register them as. If not specified it will register all functions as factories and anything else as a constant. Valid values are *factory, service, constant, 'auto'*

### lifecycle  
The default lifecycle to register a factory as. This can either be a string or a number.
```javascript
Jpex.register.folder('factories', { lifecycle : 'application' });
Jpex.register.folder('services', { lifecycle : 1 });
var constants = require('jpex/src/constants');
Jpex.register.folder('other', { lifecycle : constants.APPLICATION });
```
If not specified it will default to *'instance'*.  
It is also possible to set a specific lifecycle within the file being loaded in...
```javascript
// factories/someFactory.js
module.exports = function(){
  // do some factory stuff
};
module.exports.lifecycle = 'application';
```
this will override the default lifecycle for that file.

### dependencies  
Although not an option it is worth noting here that you can also specify dependencies on the individual files...
```javascript
// factories/someFactory.js
module.exports = function () {
  // ...
};
module.exports.dependencies ['foo', 'bah'];
```

### prefix  
A prefix to add to the start of each dependency  

### suffix  
A suffix to add to the end of each dependency  

###prefixFolder  
When adding sub folders, this will prepend the folder name to the dependency, so *main* folder with a *sub.js* file will be registered as *mainSub*, for example.

###pattern  
A glob pattern to match by. This defaults to `'**/*.js'`

###transform  
`function(base, folders, extension, options){}`  
A function that will transform the filename into the name of the dependency. This is entirely optional and will be handled automatically using the above option values if omitted.  
The function takes 4 parameters: the file name (without the folders or file extension), an array of folders leading to the file, the file extension (.js). and the main options object.  
The `this` object will be the Class the folders are being registered against.  
The value returned by this function will be used as the dependency name.  

###register  
`function(filename, content, options){}`
Another optional function that takes the name of the dependency and the contents of the related file and registers the dependency against the class.  
