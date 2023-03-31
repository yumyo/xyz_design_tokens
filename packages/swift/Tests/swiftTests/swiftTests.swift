import XCTest
@testable import artbaseldesigntokens

class Tests: XCTestCase {

    func testColor() {
        #if canImport(UIKit)
      XCTAssertEqual(StyleDictionaryClass.colorBaseSecondaryMchGrey300,
                     UIColor(red: 0.729, green: 0.749, blue: 0.769, alpha: 1))
        #endif
    }
}
