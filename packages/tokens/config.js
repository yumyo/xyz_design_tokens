const { registerTransforms } = require('@tokens-studio/sd-transforms');
const StyleDictionary = require('style-dictionary');
const { promises } = require('fs');

var Color           = require('tinycolor2')
    _               = require('../../node_modules/style-dictionary/lib/utils/es6_'),
    path            = require('path'),
    convertToBase64 = require('../../node_modules/style-dictionary/lib/utils/convertToBase64'),
    UNICODE_PATTERN = /&#x([^;]+);/g;

const designTokensFileName = "design_tokens";
const mobileDesignTokensFileName = "designTokens";

function getBasePxFontSize(options) {
  return (options && options.basePxFontSize) || 16;
}

function capitalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

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
    return `${token.original.value}sp`;
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
        ],
      },
      scss: {
        // transformGroup: "scss",
        transforms: ["attribute/cti","name/cti/snake","time/seconds","content/icon","font-family/quote/fix","fontSize/pxToRem","color/css",'ts/type/fontWeight',"remove/letterspacing/%","remove/pindent/px"],
        buildPath: "build/scss/",
        prefix: "mch_",
        files: [{
          filter: function(prop) {
            return (prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json' && prop.filePath !== 'src/Global-Colours.json');
          },
          destination: `_${designTokensFileName}-${theme.name}.scss`,
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
        ],
      },
      iosSwift: {
        transforms: ["attribute/cti","name/cti/camel","custom-color/ColorSwiftUI","content/swift/literal","asset/swift/literal","size/swift/remToCGFloat","font/swift/literal","font-family/quote/fix",'ts/type/fontWeight',"text-decoration/quote","remove/space/px","remove/letterspacing/%", 'shadow/quote',"remove/pindent/px"],
        buildPath: "../swift/Sources/artbaseldesigntokens/",
        prefix: "mch_",
        files: [{
          filter: function(prop) {
            return (prop.type !== 'fontFamilies' && prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json') && prop.filePath !== 'src/Global-Colours.json';
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
        },]
      },
      android: {
        transforms: ["attribute/cti", "name/cti/snake", "color/hexAndroid", "android-size/sp" , "size/remToDp"],
        buildPath: "build/android/src/main/res/values/",
        prefix: "mch_",
        files: [
          {
            filter: function(prop) {
              return (prop.type === 'fontSizes' && prop.filePath !== 'src/global.json');
            },
            resourceType: "dimen",
            destination: `${mobileDesignTokensFileName}FontDimens.xml`,
            format: "android/resources",
          }
          ,{
            filter: function(prop) {
              return prop.type === 'color' && prop.filePath !== 'src/global.json' && prop.filePath !== 'src/App.json' && prop.filePath !== 'src/Global-Colours.json';
            },
            resourceType: "color",
            destination: `${mobileDesignTokensFileName}Colors${capitalizeFirstLetter(theme.name)}.xml`,
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
    source: ['src/global.json'],
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
          {
            format: 'javascript/module',
            destination: `${designTokensFileName}-module.js`
          },
          {
            format: 'typescript/module-declarations',
            destination: `${designTokensFileName}-module.d.ts`
          },
        ],
      },
      scss: {
        // transformGroup: "scss",
        transforms: ["attribute/cti","name/cti/snake","time/seconds","content/icon","font-family/quote/fix","fontSize/pxToRem","color/css",'ts/type/fontWeight',"remove/letterspacing/%","remove/pindent/px"],
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
          "remove/letterspacing/%",
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
      },
    },
  }).buildAllPlatforms();
}

run();