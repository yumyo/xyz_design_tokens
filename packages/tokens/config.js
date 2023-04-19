// const { registerTransforms } = require('@tokens-studio/sd-transforms');
const StyleDictionary = require('style-dictionary');
// registerTransforms(StyleDictionary);

var Color           = require('tinycolor2')
    _               = require('../../node_modules/style-dictionary/lib/utils/es6_'),
    path            = require('path'),
    convertToBase64 = require('../../node_modules/style-dictionary/lib/utils/convertToBase64'),
    UNICODE_PATTERN = /&#x([^;]+);/g;

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
function transformFontWeights(value) {
  const mapped = fontWeightMap[value.toLowerCase()];
  return `${mapped}`;
}

/**
 * Transform fontWeights to numerical
 */
StyleDictionary.registerTransform({
  name: "type/fontWeight",
  type: "value",
  transitive: true,
  matcher: (token) => token.type === "fontWeights",
  transformer: (token) => parseInt(transformFontWeights(token.value)),
});

StyleDictionary.registerTransform({
  name: 'fontSize/pxToRem',
  type: 'value',
  matcher: function(token) {
    return (token.attributes.category === 'fontSize' || token.attributes.category === 'Typography' && token.type === 'fontSizes' || token.attributes.category === 'lineHeights' || token.attributes.category === 'Typography' && token.type === 'lineHeight' || token.attributes.category === 'spacing');
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
  name: 'custom-ccolor/ColorSwiftUI',
  type: 'value',
  matcher: function(token) {
    return (token.attributes.category === 'Color' || token.attributes.category === 'Shadows' && token.type === 'color');
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
    return token.attributes.category === 'fontSize';
  },
  transformer: function(token) {
    return `${token.original.value}sp`;
  }
});

StyleDictionary.registerTransform({
  name: 'remove/pindent/px',
  type: 'value',
  matcher: function(token) {
    return (token.attributes.category === 'paragraphIndent' || token.attributes.category === 'Typography' && token.type === 'paragraphIndent');
  },
  transformer: function(token) {
    return parseFloat(token.original.value);
  }
});

StyleDictionary.registerTransform({
  name: 'remove/space/px',
  type: 'value',
  matcher: function(token) {
    return (token.attributes.category === 'spacing');
  },
  transformer: function(token) {
    return parseFloat(token.original.value);
  }
});

StyleDictionary.registerTransform({
  name: 'remove/letterspacing/%',
  type: 'value',
  matcher: function(token) {
    return (token.attributes.category === 'letterSpacing' || token.attributes.category === 'Typography' && token.type === 'letterSpacing');
  },
  transformer: function(token) {
    return parseFloat(token.original.value);
  }
});

StyleDictionary.registerTransform({
  name: 'font-family/quote',
  type: 'value',
  matcher: function(token) {
    return (token.attributes.category === 'fontFamilies' || token.attributes.category === 'Typography' && token.type === 'fontFamilies');
  },
  transformer: function(token) {
    // Note the use of prop.original.value,
    // before any transforms are performed, the build system
    // clones the original token to the 'original' attribute.
    // console.trace(token);
    return `"${token.original.value}"`;
  }
});

StyleDictionary.registerTransform({
  name: 'shadow/quote',
  type: 'value',
  matcher: function(token) {
    return (token.attributes.category === 'Shadows' && token.type === 'type' || token.attributes.category === 'Typography' && token.type === 'textCase' || token.attributes.category === 'textCase' && token.type === 'textCase');
  },
  transformer: function(token) {
    return `"${token.original.value}"`;
  }
});

StyleDictionary.registerTransform({
  name: 'font-weigth/quote',
  type: 'value',
  matcher: function(token) {
    return (token.attributes.category === 'fontWeights' || token.attributes.category === 'Typography' && token.type === 'fontWeights');
  },
  transformer: function(token) {
    return `"${token.original.value}"`;
  }
});

StyleDictionary.registerTransform({
  name: 'text-decoration/quote',
  type: 'value',
  matcher: function(token) {
    return (token.attributes.category === 'textDecoration' || token.attributes.category === 'Typography' && token.type === 'textDecoration');
  },
  transformer: function(token) {
    return `"${token.original.value}"`;
  }
});

module.exports = {
  source: [`tokens/tokens-studio.json`],
  platforms: {
    js: {
      // transformGroup: 'js',
      transforms: ["attribute/cti","name/cti/snake","fontSize/pxToRem","remove/pindent/px","color/hex", "type/fontWeight"],
      buildPath: 'build/js/',
      prefix: "mch_",
      files: [
        {
          destination: 'variables.js',
          format: 'javascript/es6',
        },
      ],
    },
    scss: {
      // transformGroup: "scss",
      transforms: ["attribute/cti","name/cti/snake","time/seconds","content/icon","font-family/quote","fontSize/pxToRem","color/css","type/fontWeight","remove/letterspacing/%","remove/pindent/px"],
      buildPath: "build/scss/",
      prefix: "mch_",
      files: [{
        destination: "_variables.scss",
        format: "scss/variables"
      }]
    },
    android: {
      transforms: ["attribute/cti", "name/cti/snake", "color/hex8android", "android-size/sp" , "size/remToDp"],
      buildPath: "build/android/src/main/res/values/",
      prefix: "mch_",
      files: [
        {
          filter: function(prop) {
            return prop.attributes.category === 'fontSize';
          },
          resourceType: "dimen",
          destination: "font_dimens.xml",
          format: "android/resources",
        }
        ,{
          filter: function(prop) {
            return prop.attributes.category === 'Color';
          },
          resourceType: "color",
          destination: "colors.xml",
          format: "android/resources",
        }
      ]
    },
    css: {
      transformGroup: "css",
      transforms: ["attribute/cti","name/cti/snake","time/seconds","content/icon","size/rem","color/css","fontSize/pxToRem","font-family/quote", "type/fontWeight","remove/letterspacing/%","remove/pindent/px"],
      buildPath: "build/",
      prefix: "mch_",
      files: [
        {
          destination: "css/variables.css",
          format: "css/variables"
        }
      ]
    },
    iosSwift: {
      // transformGroup: "ios-swift",
      transforms: ["attribute/cti","name/cti/camel","custom-ccolor/ColorSwiftUI","content/swift/literal","asset/swift/literal","size/swift/remToCGFloat","font/swift/literal","font-family/quote","type/fontWeight","text-decoration/quote","remove/pindent/px","remove/space/px","remove/letterspacing/%", 'shadow/quote'],
      buildPath: "../swift/Sources/artbaseldesigntokens/",
      prefix: "mch_",
      files: [{
        destination: "StyleDictionary+Class.swift",
        format: "ios-swift/class.swift",
        className: "StyleDictionaryClass",
        filter: {}
      },{
        destination: "StyleDictionary+Enum.swift",
        format: "ios-swift/enum.swift",
        className: "StyleDictionaryEnum",
        filter: {}
      },{
        destination: "StyleDictionary+Struct.swift",
        format: "ios-swift/any.swift",
        className: "StyleDictionaryStruct",
        filter: {},
        options: {
          imports: "SwiftUI",
          objectType: "struct",
          accessControl: "internal"
        }
      }]
    },
  }
}