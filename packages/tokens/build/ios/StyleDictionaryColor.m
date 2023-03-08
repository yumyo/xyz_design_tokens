
//
// StyleDictionaryColor.m
//

// Do not edit directly
// Generated on Wed, 08 Mar 2023 13:52:37 GMT


#import "StyleDictionaryColor.h"

@implementation StyleDictionaryColor

+ (UIColor *)color:(StyleDictionaryColorName)colorEnum{
  return [[self values] objectAtIndex:colorEnum];
}

+ (NSArray *)values {
  static NSArray* colorArray;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    colorArray = @[
#1d2327,
#ffffff,
#444749,
#757575,
#babfc4,
#f0f2f5,
#f7f7f7,
#00a0cf,
#00c18b,
#e0004d,
#fa4616,
#1e1e1e,
#f7dce9,
#cddff2,
#dff0cb,
#d2d3ec,
#cdcdcd,
#d8eeeb,
#fff7bf,
#fcdfaa,
#fcd5d7,
#dcdcdc,
#1d23274d,
#1d23270d,
#f7f7f799,
#44474980,
#babfc480,
#babfc440,
#1d2327f2,
#f19d00,
#bf8519,
#ff003b,
#c9012f,
#019f53,
#018661,
#c9012f,
#018661,
#f4a32f,
#ff979d,
#7cc492
    ];
  });

  return colorArray;
}

@end
