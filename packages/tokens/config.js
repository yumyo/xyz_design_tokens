// const { registerTransforms } = require('@tokens-studio/sd-transforms');
const StyleDictionary = require('style-dictionary');

// registerTransforms(StyleDictionary);

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
      transforms: ["attribute/cti","name/cti/pascal","size/rem","remove/pindent/px","color/hex"],
      buildPath: 'build/js/',
      files: [
        {
          destination: 'variables.js',
          format: 'javascript/es6',
        },
      ],
    },
    scss: {
      // transformGroup: "scss",
      transforms: ["attribute/cti","name/cti/kebab","time/seconds","content/icon","font-family/quote","size/rem","color/css","font-weigth/quote","remove/letterspacing/%","remove/pindent/px"],
      buildPath: "build/scss/",
      files: [{
        destination: "_variables.scss",
        format: "scss/variables"
      }]
    },
    android: {
      transforms: ["attribute/cti", "name/cti/kebab", "color/hex8android", "android-size/sp" , "size/remToDp"],
      buildPath: "build/android/",
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
      transforms: ["attribute/cti","name/cti/kebab","time/seconds","content/icon","size/rem","color/css","font-family/quote", "font-weigth/quote","remove/letterspacing/%","remove/pindent/px"],
      buildPath: "build/",
      files: [
        {
          destination: "css/variables.css",
          format: "css/variables"
        }
      ]
    },
    iosSwift: {
      // transformGroup: "ios-swift",
      transforms: ["attribute/cti","name/cti/camel","color/UIColorSwift","content/swift/literal","asset/swift/literal","size/swift/remToCGFloat","font/swift/literal","font-family/quote","font-weigth/quote","text-decoration/quote","remove/pindent/px","remove/space/px","remove/letterspacing/%"],
      buildPath: "../swift/Sources/ab-design-tokens/",
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