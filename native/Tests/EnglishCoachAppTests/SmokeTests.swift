import XCTest
@testable import EnglishCoachApp

final class SmokeTests: XCTestCase {
    func testProductIdentity() {
        XCTAssertEqual(ProductInfo.name, "English Coach")
    }
}
