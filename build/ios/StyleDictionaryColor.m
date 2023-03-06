
//
// StyleDictionaryColor.m
//

// Do not edit directly
// Generated on Thu, 02 Mar 2023 14:23:41 GMT


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
[UIColor colorWithRed:0.114f green:0.137f blue:0.153f alpha:1.000f],
[UIColor colorWithRed:1.000f green:1.000f blue:1.000f alpha:1.000f],
[UIColor colorWithRed:0.267f green:0.278f blue:0.286f alpha:1.000f],
[UIColor colorWithRed:0.459f green:0.459f blue:0.459f alpha:1.000f],
[UIColor colorWithRed:0.729f green:0.749f blue:0.769f alpha:1.000f],
[UIColor colorWithRed:0.941f green:0.949f blue:0.961f alpha:1.000f],
[UIColor colorWithRed:0.969f green:0.969f blue:0.969f alpha:1.000f],
[UIColor colorWithRed:0.945f green:0.616f blue:0.000f alpha:1.000f],
[UIColor colorWithRed:0.749f green:0.522f blue:0.098f alpha:1.000f],
[UIColor colorWithRed:1.000f green:0.000f blue:0.231f alpha:1.000f],
[UIColor colorWithRed:0.788f green:0.004f blue:0.184f alpha:1.000f],
[UIColor colorWithRed:0.004f green:0.624f blue:0.325f alpha:1.000f],
[UIColor colorWithRed:0.004f green:0.525f blue:0.380f alpha:1.000f],
[UIColor colorWithRed:0.788f green:0.004f blue:0.184f alpha:1.000f],
[UIColor colorWithRed:0.004f green:0.525f blue:0.380f alpha:1.000f],
[UIColor colorWithRed:0.957f green:0.639f blue:0.184f alpha:1.000f],
[UIColor colorWithRed:1.000f green:0.592f blue:0.616f alpha:1.000f],
[UIColor colorWithRed:0.486f green:0.769f blue:0.573f alpha:1.000f],
[UIColor colorWithRed:0.000f green:0.627f blue:0.812f alpha:1.000f],
[UIColor colorWithRed:0.000f green:0.757f blue:0.545f alpha:1.000f],
[UIColor colorWithRed:0.878f green:0.000f blue:0.302f alpha:1.000f],
[UIColor colorWithRed:0.980f green:0.275f blue:0.086f alpha:1.000f],
[UIColor colorWithRed:0.118f green:0.118f blue:0.118f alpha:1.000f],
[UIColor colorWithRed:0.969f green:0.863f blue:0.914f alpha:1.000f],
[UIColor colorWithRed:0.804f green:0.875f blue:0.949f alpha:1.000f],
[UIColor colorWithRed:0.875f green:0.941f blue:0.796f alpha:1.000f],
[UIColor colorWithRed:0.824f green:0.827f blue:0.925f alpha:1.000f],
[UIColor colorWithRed:0.804f green:0.804f blue:0.804f alpha:1.000f],
[UIColor colorWithRed:0.847f green:0.933f blue:0.922f alpha:1.000f],
[UIColor colorWithRed:1.000f green:0.969f blue:0.749f alpha:1.000f],
[UIColor colorWithRed:0.988f green:0.875f blue:0.667f alpha:1.000f],
[UIColor colorWithRed:0.988f green:0.835f blue:0.843f alpha:1.000f],
[UIColor colorWithRed:0.863f green:0.863f blue:0.863f alpha:1.000f],
[UIColor colorWithRed:0.114f green:0.137f blue:0.153f alpha:0.302f],
[UIColor colorWithRed:0.114f green:0.137f blue:0.153f alpha:0.051f],
[UIColor colorWithRed:0.969f green:0.969f blue:0.969f alpha:0.600f],
[UIColor colorWithRed:0.267f green:0.278f blue:0.286f alpha:0.502f],
[UIColor colorWithRed:0.729f green:0.749f blue:0.769f alpha:0.502f],
[UIColor colorWithRed:0.729f green:0.749f blue:0.769f alpha:0.251f],
[UIColor colorWithRed:0.114f green:0.137f blue:0.153f alpha:0.949f]
    ];
  });

  return colorArray;
}

@end
