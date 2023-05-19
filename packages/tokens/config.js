const { registerTransforms } = require('@tokens-studio/sd-transforms');
const StyleDictionary = require('style-dictionary');
const { promises } = require('fs');

var Color           = require('tinycolor2')
    _               = require('../../node_modules/style-dictionary/lib/utils/es6_'),
    path            = require('path'),
    convertToBase64 = require('../../node_modules/style-dictionary/lib/utils/convertToBase64'),
    UNICODE_PATTERN = /&#x([^;]+);/g;

const designTokensFileName = "design_tokens";

// TO REMOVE
const fontWeightMap = {
  thin: 100,
  extralight: 200,
  ultralight: 200,
  extraleicht: 200,
  light: 300,
  leicht: 300,
  normal: 400,
  regular: 400,
  buch: 400,
  medium: 500,
  kraeftig: 500,
  kräftig: 500,
  semibold: 600,
  demibold: 600,
  halbfett: 600,
  bold: 700,
  dreiviertelfett: 700,
  extrabold: 800,
  ultabold: 800,
  fett: 800,
  black: 900,
  heavy: 900,
  super: 900,
  extrafett: 900,
};

function getBasePxFontSize(options) {
  return (options && options.basePxFontSize) || 16;
}

/**
 * Helper: Transforms letter spacing % to em
 */
// TO REMOVE
function transformFontWeights(value) {
  const mapped = fontWeightMap[value.toLowerCase()];
  return `${mapped}`;
}

/**
 * Transform fontWeights to numerical
 */
// TO REMOVE
StyleDictionary.registerTransform({
  name: 'ts/type/fontWeight',
  type: "value",
  transitive: true,
  matcher: (token) => token.type === "fontWeights",
  transformer: (token) => parseInt(transformFontWeights(token.value)),
});

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
  name: 'android-size/sp',
  type: 'value',
  matcher: function(token) {
    return token.type === 'fontSizes';
  },
  transformer: function(token) {
    // console.log('YAY')
    return `${token.original.value}sp`;
  }
});

StyleDictionary.registerTransform({
  name: 'remove/pindent',
  type: 'value',
  matcher: function(token) {
    // console.log('token', token.type)
    if (token.type === 'paragraphIndent') {
      // console.log('banana')
    }
    return token.type === 'paragraphIndent';
  },
  transformer: function(token) {
    console.log(token)
    return token.value;
  }
});

// StyleDictionary.registerTransform({
//   name: 'remove/pindent',
//   type: 'value',
//   matcher: function(token) {
//     // console.log('token', token)
//     if (token.type === 'paragraphIndent'){
//       console.log('token.valueXXX', token.value)
//     }
    
//     // console.log('parseInt(token.value)', parseInt(token.value))
//     return token.type === 'paragraphIndent';
//   },
//   transformer: function(token) {
//      console.log('YAY')
//     return parseInt(token.value);
//   }
// });

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
  name: 'font-family/quote',
  type: 'value',
  matcher: function(token) {
    // console.log('token', token)
    return (token.type === 'fontFamilies');
  },
  transformer: function(token) {
    return `"${token.original.value}"`;
  }
});

StyleDictionary.registerTransform({
  name: 'shadow/quote',
  type: 'value',
  matcher: function(token) {
    return (token.type === 'Shadows' || token.type === 'textCase');
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
  const $themes = JSON.parse(await promises.readFile('src/$themes.json'));
  
  const configs = $themes.map(theme => ({
    source: Object.entries(theme.selectedTokenSets)
      .filter(([, val]) => val !== 'disabled')
      .map(([tokenset]) => `src/${tokenset}.json`),
    platforms: {
      js: {
        // transformGroup: 'js',
        transforms: ["attribute/cti","name/cti/snake","fontSize/pxToRem","color/hex", 'ts/type/fontWeight', "remove/pindent"],
        buildPath: 'build/js/',
        prefix: "mch_",
        files: [
          {
            filter: function(prop) {
              return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json');
            },
            format: 'javascript/es6',
            destination: `${designTokensFileName}-${theme.name}.js`
          },
          {
            filter: function(prop) {
              // if (prop.filePath === 'src/Dark-Theme.json') {
              //   console.log('prop', prop)
              // }
              
              return (prop.filePath === 'src/global.json' && prop.filePath !== 'src/App.json' && prop.filePath !== 'src/Dark-Theme.json' && prop.filePath !== 'src/Light-Theme.json');
            },
            format: 'javascript/es6',
            destination: `${designTokensFileName}.js`
          },
          {
            filter: function(prop) {
              return prop.filePath === 'src/global.json';
            },
            format: 'javascript/module',
            destination: `${designTokensFileName}-module.js`
          },
          {
            filter: function(prop) {
              return prop.filePath === 'src/global.json';
            },
            format: 'typescript/module-declarations',
            destination: `${designTokensFileName}-module.d.ts`
          },
        ],
      },
      scss: {
        // transformGroup: "scss",
        transforms: ["attribute/cti","name/cti/snake","time/seconds","content/icon","font-family/quote","fontSize/pxToRem","color/css",'ts/type/fontWeight',"remove/letterspacing/%","remove/pindent"],
        buildPath: "build/scss/",
        prefix: "mch_",
        files: [{
          filter: function(prop) {
            return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json');
          },
          destination: `_${designTokensFileName}-${theme.name}.scss`,
          format: "scss/variables"
        },
        {
          filter: function(prop) {
            return (prop.filePath === 'src/global.json' && prop.filePath !== 'src/App.json');
          },
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
          "remove/letterspacing/%",
          "remove/pindent",
          'ts/border/css/shorthand',
          'ts/shadow/css/shorthand',
          'ts/color/css/hexrgba',
          'ts/color/modifiers',
          'name/cti/snake',
          "font-family/quote",
        ],
        buildPath: "build/css/",
        prefix: "mch_",
        files: [
          {
            filter: function(prop) {
              return (prop.filePath === 'src/global.json' && prop.filePath !== 'src/App.json');
            },
            destination: `${designTokensFileName}.css`,
            format: 'css/variables',
          },
          {
            filter: function(prop) {
              return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json');
            },
            destination: `${designTokensFileName}-${theme.name}.css`,
            format: 'css/variables',
          },
        ],
      },
      iosSwift: {
        // transformGroup: "ios-swift",
        transforms: ["attribute/cti","name/cti/camel","custom-color/ColorSwiftUI","content/swift/literal","asset/swift/literal","size/swift/remToCGFloat","font/swift/literal","font-family/quote",'ts/type/fontWeight',"text-decoration/quote","remove/space/px","remove/letterspacing/%", 'shadow/quote',"remove/pindent"],
        buildPath: "../swift/Sources/artbaseldesigntokens/",
        prefix: "mch_",
        files: [{
          filter: function(prop) {
            
            return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json');
          },
          destination: `${designTokensFileName}+Class-${theme.name}.swift`,
          format: "ios-swift/class.swift",
          className: "StyleDictionaryClass",
        },{
          filter: function(prop) {
            // console.log('prop', prop)
            return (prop.filePath !== 'src/global.json' && prop.filePath === 'src/App.json' && prop.type !== 'paragraphIndent' && prop.attributes.category !== 'paragraphIndent');
          },
          destination: `${designTokensFileName}+Class-app.swift`,
          format: "ios-swift/class.swift",
          className: "StyleDictionaryClass",
        },{
          filter: function(prop) {
            return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json');
          },
          destination: `${designTokensFileName}+Enum-${theme.name}.swift`,
          format: "ios-swift/enum.swift",
          className: "StyleDictionaryEnum",
        },
        {
          filter: function(prop) {
            return (prop.filePath !== 'src/global.json' && prop.filePath === 'src/App.json' && prop.type !== 'paragraphIndent' && prop.attributes.category !== 'paragraphIndent');
          },
          destination: `${designTokensFileName}+Enum-${theme.name}.swift`,
          format: "ios-swift/enum.swift",
          className: "StyleDictionaryEnum",
        },{
          filter: function(prop) {
            return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json');
          },
          destination: `${designTokensFileName}+Struct-${theme.name}.swift`,
          format: "ios-swift/any.swift",
          className: "StyleDictionaryStruct",
          options: {
            imports: "SwiftUI",
            objectType: "struct",
            accessControl: "internal"
          }
        },{
          filter: function(prop) {
            return (prop.filePath !== 'src/global.json' && prop.filePath === 'src/App.json' && prop.type !== 'paragraphIndent' && prop.attributes.category !== 'paragraphIndent');
          },
          destination: `${designTokensFileName}+Struct-${theme.name}.swift`,
          format: "ios-swift/any.swift",
          className: "StyleDictionaryStruct",
          options: {
            imports: "SwiftUI",
            objectType: "struct",
            accessControl: "internal"
          }
        }]
      },
      android: {
        transforms: ["attribute/cti", "name/cti/snake", "color/hex8android", "android-size/sp" , "size/remToDp"],
        buildPath: "build/android/src/main/res/values/",
        prefix: "mch_",
        files: [
          {
            filter: function(prop) {
              // console.log('prop', prop)
              return (prop.type === 'fontSizes' && prop.filePath !== 'src/global.json');
            },
            resourceType: "dimen",
            destination: `${designTokensFileName}-font_dimens.xml`,
            format: "android/resources",
          }
          ,{
            filter: function(prop) {
              return prop.type === 'color' && prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json';
            },
            resourceType: "color",
            destination: `${designTokensFileName}-colors-${theme.name}.xml`,
            format: "android/resources",
          }
        ]
      },
    },
  }));

  configs.forEach(cfg => {
    const sd = StyleDictionary.extend(cfg);
    sd.cleanAllPlatforms(); // optionally, cleanup files first..
    sd.buildAllPlatforms();
  });
}

run();