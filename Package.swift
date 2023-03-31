// swift-tools-version:5.3
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "artbaseldesigntokens",
    products: [
        .library(name: "artbaseldesigntokens", targets: ["artbaseldesigntokens"])
    ],
    dependencies: [
        // Dependencies declare other packages that this package depends on.
        // .package(url: /* package url */, from: "1.0.0"),
    ],
    targets: [
        // Targets are the basic building blocks of a package. A target can define a module or a test suite.
        // Targets can depend on other targets in this package, and on products in packages this package depends on.
        .target(
            name: "artbaseldesigntokens",
            dependencies: [],
            path: "packages/swift/Sources/artbaseldesigntokens"),
        .testTarget(
            name: "swiftTests",
            dependencies: ["artbaseldesigntokens"],
            path: "packages/swift/Tests/swiftTests"),
    ]
)
