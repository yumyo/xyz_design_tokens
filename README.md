# XYZ Design Tokens flow
This repository contains code to transform design tokens exported from Figma using token-transformer and style-dictionary, and create output for Android, iOS and the web.

The `tokens.json` file in the root is generated from Figma using [Tokens Studio for Figma (Figma Tokens)](https://tokens.studio/)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/xyz-design-token-poc.git
```

2. Install dependencies:

```bash
yarn 
```

## Usage

The following scripts are available:

- build: cleans the output directory, converts the input design tokens, and generates the output files for Android, iOS and the web using style-dictionary.
- convert: converts the input design tokens from tokens.json to tokens/tokens-studio.json.
- clean: removes the build directory and the tokens/tokens-studio.json file.

To generate the output files, run:

```bash
npm run build
```

The generated files will be located in the `build/` directory.

## Dependencies

- [amzn/style-dictionary: A build system for creating cross-platform styles.](https://github.com/amzn/style-dictionary): a build system for creating cross-platform design tokens.
- [token-transformer - npm](https://www.npmjs.com/package/token-transformer): a package that transforms design tokens into a format compatible with style-dictionary.
- [tokens-studio/sd-transforms: Custom transforms for Style-Dictionary, to work with Design Tokens that are exported from Tokens Studio](https://github.com/tokens-studio/sd-transforms): a package with additional transforms for style-dictionary.

## Related resources

- [figma tokens style dictionary config](https://gist.github.com/six7/9cbce8bcbb16b308c5c87f3729392d21)
- [lukasoppermann/style-dictionary-utils: Utilities to use in your style dictionary config](https://github.com/lukasoppermann/style-dictionary-utils)

## License
This project is **UNLICENSED**.