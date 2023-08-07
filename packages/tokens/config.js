const { registerTransforms } = require('@tokens-studio/sd-transforms');
const StyleDictionary = require('style-dictionary');
const { promises } = require('fs');
const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;
const fs = require('fs');

var Color           = require('tinycolor2')
    _               = require('../../node_modules/style-dictionary/lib/utils/es6_'),
    path            = require('path'),
    convertToBase64 = require('../../node_modules/style-dictionary/lib/utils/convertToBase64'),
    UNICODE_PATTERN = /&#x([^;]+);/g;

// Utility to transsforn token.path values to camelCase. This is required for the output of the js/module format.
function keysToCamelCase(obj) {
  if (_.isPlainObject(obj)) {
    return _.reduce(obj, (result, value, key) => {
      result[_.camelCase(key)] = keysToCamelCase(value);
      return result;
    }, {});
  } else if (_.isArray(obj)) {
    return obj.map(keysToCamelCase);
  }
  return obj;
}

const designTokensFileName = "design_tokens";
const mobileDesignTokensFileName = "designTokens";

function getBasePxFontSize(options) {
  return (options && options.basePxFontSize) || 16;
}

function capitalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

StyleDictionary.registerFormat({
  name: 'jsModuleCamelCase',
  formatter: function({dictionary, platform, options, file}) {
    let tokens = keysToCamelCase(dictionary.tokens);
    return fileHeader({file}) +
    'module.exports = ' +
      JSON.stringify(tokens, null, 2) + ';\n';
    
    // return JSON.stringify(tokens, null, 2);
  }
})


StyleDictionary.registerFormat({
  name: 'tsModuleCamelCase',
  formatter: function({dictionary, platform, options, file}) {
    let tokens = keysToCamelCase(dictionary.tokens);
    const {moduleName=`tokens`} = options;
    function treeWalker(obj) {
      let type = Object.create(null);
      let has = Object.prototype.hasOwnProperty.bind(obj);
      if (has('value')) {
        type = 'DesignToken';
      } else {
        for (var k in obj) if (has(k)) {
          switch (typeof obj[k]) {
            case 'object':
              type[k] = treeWalker(obj[k]);
          }
        }
      }
      return type;
    }
    const designTokenInterface = fs.readFileSync(
      path.resolve(__dirname, `./DesignToken.d.ts`), {encoding:'UTF-8'}
    );

    // get the first and last lines to add to the format by
    // looking for the first and last single-line comment
    const lines = designTokenInterface
      .split('\n');
    const firstLine = lines.indexOf(`//start`) + 1;
    const lastLine = lines.indexOf(`//end`);

    const output = fileHeader({file}) +
`export default ${moduleName};

declare ${lines.slice(firstLine, lastLine).join(`\n`)}

declare const ${moduleName}: ${JSON.stringify(treeWalker(tokens), null, 2)}`;

    // JSON stringify will quote strings, because this is a type we need
    // it unquoted.
    return output.replace(/"DesignToken"/g, 'DesignToken') + '\n';
  }
})

StyleDictionary.registerTransform({
  name: 'fontSize/pxToRem',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'fontSizes' || token.type === 'lineHeights' || token.type === 'spacing');
  },
  transformer: (token, options) => {
    const baseFont = getBasePxFontSize(options);
    const floatVal = parseFloat(token.value);

    if (isNaN(floatVal)) {
      throwSizeError(token.name, token.value, 'rem');
    }

    if (floatVal === 0) {
      return '0';
    }
    return `${floatVal / baseFont}rem`;
  }
});

StyleDictionary.registerTransform({
  name: 'custom-color/ColorSwiftUI',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'color');
  },
  transformer: function(token) {
    const { r, g, b, a } = Color(token.value).toRgb();
    const rFixed = (r / 255.0).toFixed(3);
    const gFixed = (g / 255.0).toFixed(3);
    const bFixed = (b / 255.0).toFixed(3);
    return `UIColor(red: ${rFixed}, green: ${gFixed}, blue: ${bFixed}, alpha: ${a})`;
  }
});

StyleDictionary.registerTransform({
  name: 'integerToFloat',
  type: 'value',
  matcher: function(token) {
    return token.type === 'borderRadius' || token.type === 'borderWidth';
  },
  transformer: function(token) {
    return `${token.original.value}.0`;
  }
});

StyleDictionary.registerTransform({
  name: 'android-size/sp',
  type: 'value',
  matcher: function(token) {
    return token.type === 'fontSizes' || token.path[0] === 'lineSpacing';
  },
  transformer: function(token) {
    return `${token.original.value}sp`;
  }
});

StyleDictionary.registerTransform({
  name: 'android-size/dp',
  type: 'value',
  matcher: function(token) {
    return token.type === 'spacing' || token.type === 'borderRadius' || token.type === 'borderWidth';
  },
  transformer: function(token) {
    return (token.value + 'dp');
  }
});

StyleDictionary.registerTransform({
  name: 'color/hexAndroid',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'color');
  },
  transformer: function (token) {
    var str = Color(token.value).toHex8();
    return '#' + str.slice(6) + str.slice(0,6);
  }
});

StyleDictionary.registerTransform({
  name: 'remove/pindent/px',
  transitive: true,
  type: 'value',
  matcher: function(token) { 
    return (token.type === 'paragraphIndent' || token.name === 'mch_paragraph_indent_0') || token.name === 'mchParagraphIndent0';
  },
  transformer: function(token) {
    return (token.value === "0px" ? parseFloat(token.value.replace(/px$/g, '')) : token.value);
  }
});

StyleDictionary.registerTransform({
  name: 'remove/maxWidth/px',
  transitive: true,
  type: 'value',
  matcher: function(token) { 
    // console.log('token', token)
    return (token.path[0] === 'max-width')
  },
  transformer: function(token) {
    // console.log('token', token)
    return parseFloat(token.original.value);
  }
});

StyleDictionary.registerTransform({
  name: 'remove/space/px',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'spacing');
  },
  transformer: function(token) {
    return parseFloat(token.original.value);
  }
});

StyleDictionary.registerTransform({
  name: 'remove/letterspacing/%',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'letterSpacing');
  },
  transformer: function(token) {
    return parseFloat(token.original.value);
  }
});

StyleDictionary.registerTransform({
  name: 'convertUnit/letterspacing/%',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'letterSpacing');
  },
  transformer: function(token, options) {
    const baseFont = getBasePxFontSize(options);

    return (parseFloat(token.original.value) / baseFont + 'rem') ;
  }
});

StyleDictionary.registerTransform({
  name: 'font-family/quote/fix',
  type: 'value',
  matcher: function(token) {
    return (token.original.type === 'fontFamilies');
  },
  transformer: function(token) {
    return `"${token.original.value}"`;
  }
});

StyleDictionary.registerTransform({
  name: 'font-family/swap/iOS',
  type: 'value',
  matcher: function(token) {
    return (token.original.type === 'fontFamilies');
  },
  transformer: function(token) {
    return `"${token.original.value}"`;
  }
});

StyleDictionary.registerTransform({
  name: 'shadow/quote',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'Shadows' || token.type === 'textCase' || token.value === 'dropShadow');
  },
  transformer: function(token) {
    return `"${token.original.value}"`;
  }
});

StyleDictionary.registerTransform({
  name: 'font-weigth/quote',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'fontWeights');
  },
  transformer: function(token) {
    return `"${token.original.value}"`;
  }
});

StyleDictionary.registerTransform({
  name: 'text-decoration/quote',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'textDecoration');
  },
  transformer: function(token) {
    return `"${token.original.value}"`;
  }
});

registerTransforms(StyleDictionary, {
  expand: {
    composition: true,
    typography: true,
    border: (token, filePath) =>
      token.value.width !== 0 && filePath.startsWith(path.resolve('tokens/core')),
    shadow: true,
  },
  excludeParentKeys: false,
});


async function run() {

  // Theme and mobile targets tokens export.
  const $themes = JSON.parse(await promises.readFile('src/$themes.json'));
  const configs = $themes.map(theme => ({
    source: Object.entries(theme.selectedTokenSets)
      .filter(([, val]) => val !== 'disabled')
      .map(([tokenset]) => `src/${tokenset}.json`),
    platforms: {
      js: {
        // transformGroup: 'js',
        transforms: ["attribute/cti","name/cti/snake","fontSize/pxToRem","color/hex", 'ts/type/fontWeight', "remove/pindent/px"],
        buildPath: 'build/js/',
        prefix: "mch_",
        files: [
          {
            filter: function(prop) {     
              return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json' && prop.filePath !== 'src/Global-Colours.json');
            },
            format: 'javascript/es6',
            destination: `${designTokensFileName}-${theme.name}.js`
          },
          {
            filter: function(prop) {     
              return (prop.filePath === 'src/Global-Colours.json');
            },
            format: 'javascript/es6',
            destination: `${designTokensFileName}-global-colours.js`
          },
        ],
      },
      scss: {
        // transformGroup: "scss",
        transforms: ["attribute/cti","name/cti/snake","time/seconds","content/icon","font-family/quote/fix","fontSize/pxToRem","color/css",'ts/type/fontWeight',"convertUnit/letterspacing/%","remove/pindent/px"],
        buildPath: "build/scss/",
        prefix: "mch_",
        files: [{
          filter: function(prop) {
            return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json' && prop.filePath !== 'src/Global-Colours.json');
          },
          destination: `_${designTokensFileName}-${theme.name}.scss`,
          format: "scss/variables"
          },
          {
            filter: function(prop) {     
              return (prop.filePath === 'src/Global-Colours.json');
            },
            format: 'javascript/es6',
            destination: `_${designTokensFileName}-global-colours.scss`,
            format: "scss/variables"
          }
        ]
      },
      css: {
        transforms: [
          'ts/descriptionToComment',
          "size/rem",
          'ts/opacity',
          'ts/size/lineheight',
          'ts/type/fontWeight',
          'ts/resolveMath',
          'ts/size/css/letterspacing',
          "fontSize/pxToRem",
          "convertUnit/letterspacing/%",
          "remove/pindent/px",
          'ts/border/css/shorthand',
          'ts/shadow/css/shorthand',
          'ts/color/css/hexrgba',
          'ts/color/modifiers',
          'name/cti/snake',
          "font-family/quote/fix",
        ],
        buildPath: "build/css/",
        prefix: "mch_",
        files: [
          {
            filter: function(prop) {
              return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json' && prop.filePath !== 'src/Global-Colours.json');
            },
            destination: `${designTokensFileName}-${theme.name}.css`,
            format: 'css/variables',
          },
          {
            filter: function(prop) {     
              return (prop.filePath === 'src/Global-Colours.json');
            },
            destination: `${designTokensFileName}-global-colours.css`,
            format: 'css/variables',
          }
        ],
      },
      iosSwift: {
        transforms: ["attribute/cti","name/cti/camel","custom-color/ColorSwiftUI","content/swift/literal","asset/swift/literal","size/swift/remToCGFloat","font/swift/literal","font-family/quote/fix",'ts/type/fontWeight',"text-decoration/quote","remove/space/px","remove/letterspacing/%", 'shadow/quote',"remove/pindent/px", "integerToFloat"],
        buildPath: "../swift/Sources/artbaseldesigntokens/",
        prefix: "mch_",
        files: [{
          filter: function(prop) {
            return (prop.type !== 'fontFamilies' && prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json' && prop.filePath !== 'src/Global-Colours.json') ;
          },
          destination: `${mobileDesignTokensFileName}+Enum${capitalizeFirstLetter(theme.name)}.swift`,
          format: "ios-swift/enum.swift",
          className: `StyleDictionaryEnum${capitalizeFirstLetter(theme.name)}`,
          },
          {
            filter: function(prop) {
              return (prop.type !== 'fontFamilies' && prop.filePath !== 'src/global.json' && prop.filePath === 'src/App.json');
            },
            destination: `${mobileDesignTokensFileName}+Enum${capitalizeFirstLetter(theme.name)}.swift`,
            format: "ios-swift/enum.swift",
            className: `StyleDictionaryEnum${capitalizeFirstLetter(theme.name)}`,
          },
          {
            filter: function(prop) {     
              return (prop.filePath === 'src/Global-Colours.json');
            },
            destination: `${mobileDesignTokensFileName}+EnumColours.swift`,
            format: "ios-swift/enum.swift",
            className: `StyleDictionaryEnumColours`,
          }
        ]
      },
      android: {
        transforms: ["attribute/cti", "name/cti/snake", "color/hexAndroid", "android-size/sp" , "size/remToDp", "android-size/dp"],
        buildPath: "build/android/src/main/res/values/",
        prefix: "mch_",
        files: [
          {
            filter: function(prop) {
              return (prop.type === 'fontSizes' && prop.filePath === 'src/App.json' || 
                      prop.path[0] === 'lineSpacing' && prop.filePath === 'src/App.json' ||
                      prop.type === 'borderRadius' && prop.filePath === 'src/App.json' ||
                      prop.type === 'borderWidth' && prop.filePath === 'src/App.json' ||
                      prop.type === 'spacing' && prop.filePath === 'src/App.json'
                      );
            },
            resourceType: "dimen",
            destination: `${mobileDesignTokensFileName}${capitalizeFirstLetter(theme.name)}.xml`,
            format: "android/resources",
          },
          {
            filter: function(prop) {
              return prop.type === 'color' && prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json' && prop.filePath !== 'src/Global-Colours.json';
            },
            resourceType: "color",
            destination: `${mobileDesignTokensFileName}Colors${capitalizeFirstLetter(theme.name)}.xml`,
            format: "android/resources",
          },
          {
            filter: function(prop) {
              return (prop.filePath === 'src/Global-Colours.json');
            },
            resourceType: "color",
            destination: `${mobileDesignTokensFileName}Colours.xml`,
            format: "android/resources",
          }
        ]
      },
    },
  }));

  // Theme (mobile) tokens export.
  configs.forEach(cfg => {
    const sd = StyleDictionary.extend(cfg);
    sd.cleanAllPlatforms(); // optionally, cleanup files first..
    sd.buildAllPlatforms();
  });

  // Global tokens export.
  StyleDictionary.extend({
    source: ['src/global.json', 'src/Global-Colours.json'],
    platforms: {
      js: {
        // transformGroup: 'js',
        transforms: ["attribute/cti","name/cti/snake","fontSize/pxToRem","color/hex", 'ts/type/fontWeight', "remove/pindent/px"],
        buildPath: 'build/js/',
        prefix: "mch_",
        files: [
          {
            format: 'javascript/es6',
            destination: `${designTokensFileName}.js`
          },
        ],
      },
      jsModule: {
        // transformGroup: 'js',
        transforms: ["attribute/cti","name/cti/snake","fontSize/pxToRem","color/hex", 'ts/type/fontWeight', "remove/pindent/px"],
        buildPath: 'build/js/',
        prefix: "mch_",
        files: [
          {
            format: 'jsModuleCamelCase',
            destination: `${designTokensFileName}-module.js`
          },
          {
            format: 'tsModuleCamelCase',
            destination: `${designTokensFileName}-module.d.ts`
          },
        ],
      },
      scss: {
        // transformGroup: "scss",
        transforms: ["attribute/cti","name/cti/snake","time/seconds","content/icon","font-family/quote/fix","fontSize/pxToRem","color/css",'ts/type/fontWeight',"convertUnit/letterspacing/%","remove/pindent/px", "remove/maxWidth/px"],
        buildPath: "build/scss/",
        prefix: "mch_",
        files: [
        {
          destination: `_${designTokensFileName}.scss`,
          format: "scss/variables"
        }]
      },
      css: {
        transforms: [
          'ts/descriptionToComment',
          "size/rem",
          'ts/opacity',
          'ts/size/lineheight',
          'ts/type/fontWeight',
          'ts/resolveMath',
          'ts/size/css/letterspacing',
          "fontSize/pxToRem",
          "convertUnit/letterspacing/%",
          "remove/pindent/px",
          'ts/border/css/shorthand',
          'ts/shadow/css/shorthand',
          'ts/color/css/hexrgba',
          'ts/color/modifiers',
          'name/cti/snake',
          "font-family/quote/fix",
        ],
        buildPath: "build/css/",
        prefix: "mch_",
        files: [
          {
            destination: `${designTokensFileName}.css`,
            format: 'css/variables',
          },
        ],
      }
    },
  }).buildAllPlatforms();
}

run();