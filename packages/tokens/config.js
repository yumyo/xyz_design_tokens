const StyleDictionary = require('style-dictionary');

StyleDictionary.registerTransform({
  name: 'android-size/sp',
  type: 'value',
  matcher: function(token) {
    return token.attributes.category === 'fontSize';
  },
  transformer: function(token) {
    // Note the use of prop.original.value,
    // before any transforms are performed, the build system
    // clones the original token to the 'original' attribute.
    return `${token.original.value}sp`;
  }
});

module.exports = {
  source: [`tokens/tokens-studio.json`],
  // If you don't want to call the registerTransform method a bunch of times
  // you can override the whole transform object directly. This works because
  // the .extend method copies everything in the config
  // to itself, allowing you to override things. It's also doing a deep merge
  // to protect from accidentally overriding nested attributes.
  transform: {
    // Now we can use the transform 'myTransform' below
    // myTransform: {
    //   type: 'name',
    //   transformer: (token) => token.path.join('_').toUpperCase()
    // }
  },
  // Same with formats, you can now write them directly to this config
  // object. The name of the format is the key.
  format: {
    myFormat: ({dictionary, platform}) => {
      return dictionary.allTokens.map(token => `${token.name}: ${token.value}`).join('\n');
    }
  },
  platforms: {
    scss: {
      transformGroup: "scss",
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
      buildPath: "build/",
      files: [
        {
          destination: "css/variables.css",
          format: "css/variables"
        }
      ]
    },
    compose: {
      transformGroup: "compose",
      buildPath: "build/compose/",
      files: [{
        destination: "StyleDictionaryColor.kt",
        format: "compose/object",
        className: "StyleDictionaryColor",
        packageName: "StyleDictionaryColor",
        filter: {
          attributes: {
            category: "Color"
          }
        }
      },{
        destination: "StyleDictionarySize.kt",
        format: "compose/object",
        className: "StyleDictionarySize",
        packageName: "StyleDictionarySize",
        type: "float",
        filter: {
          attributes: {
            category: "size"
          }
        }
      }]
    },
    ios: {
      transformGroup: "ios",
      buildPath: "build/ios/",
      files: [{
        destination: "StyleDictionaryColor.h",
        format: "ios/colors.h",
        className: "StyleDictionaryColor",
        type: "StyleDictionaryColorName",
        filter: {
          attributes: {
            category: "Color"
          }
        }
      },{
        destination: "StyleDictionaryColor.m",
        format: "ios/colors.m",
        className: "StyleDictionaryColor",
        type: "StyleDictionaryColorName",
        filter: {
          attributes: {
            category: "Color"
          }
        }
      },{
        destination: "StyleDictionarySize.h",
        format: "ios/static.h",
        className: "StyleDictionarySize",
        type: "float",
        filter: {
          attributes: {
            category: "size"
          }
        }
      },{
        destination: "StyleDictionarySize.m",
        format: "ios/static.m",
        className: "StyleDictionarySize",
        type: "float",
        filter: {
          attributes: {
            category: "size"
          }
        }
      }]
    },
    iosSwift: {
      transformGroup: "ios-swift",
      buildPath: "build/ios-swift/",
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
    "ios-swift-separate-enums": {
      transformGroup: "ios-swift-separate",
      buildPath: "build/ios-swift/",
      files: [{
        destination: "StyleDictionaryColor.swift",
        format: "ios-swift/enum.swift",
        className: "StyleDictionaryColor",
        filter: {
          attributes: {
            category: "Color"
          }
        }
      },{
        destination: "StyleDictionarySize.swift",
        format: "ios-swift/enum.swift",
        className: "StyleDictionarySize",
        filter: {
          attributes: {
            category: "size"
          }
        }
      }]
    }
  }
}