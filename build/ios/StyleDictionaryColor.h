
//
// StyleDictionaryColor.h
//

// Do not edit directly
// Generated on Thu, 02 Mar 2023 14:23:41 GMT


#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, StyleDictionaryColorName) {
ColorBasePrimaryMchBlack,
ColorBasePrimaryMchWhite,
ColorBaseSecondaryMchGrey500,
ColorBaseSecondaryMchGrey400,
ColorBaseSecondaryMchGrey300,
ColorBaseSecondaryMchGrey200,
ColorBaseSecondaryMchGrey100,
ColorSupportingOrange,
ColorSupportingOrangeText,
ColorSupportingRed,
ColorSupportingRedText,
ColorSupportingGreen,
ColorSupportingGreenText,
ColorSupportingStatusLightError,
ColorSupportingStatusLightSuccess,
ColorSupportingStatusDarkAlert,
ColorSupportingStatusDarkError,
ColorSupportingStatusDarkSuccess,
ColorExtendedSubBrandsBasel,
ColorExtendedSubBrandsMiami,
ColorExtendedSubBrandsHongKong,
ColorExtendedSubBrandsCities,
ColorExtendedSubBrandsParis,
ColorExtendedSectorsFilm,
ColorExtendedSectorsParcourPublic,
ColorExtendedSectorsUnlimitedEncountersMeridians,
ColorExtendedSectorsDiscoveriesStatementsPositions,
ColorExtendedSectorsGalleries,
ColorExtendedSectorsFeatureNova,
ColorExtendedSectorsEdition,
ColorExtendedSectorsKabinett,
ColorExtendedSectorsInsightsSurvey,
ColorExtendedSectorsDialogues,
ColorExtendedOpacityDarkOverlay30,
ColorExtendedOpacityTileOverlay5,
ColorExtendedOpacityLightFillHover60,
ColorExtendedOpacityDarkFillHover50,
ColorExtendedOpacityBorder50,
ColorExtendedOpacityBorderDisabled25,
ColorExtendedOpacityDarkCarouselBackground95
};

@interface StyleDictionaryColor : NSObject
+ (NSArray *)values;
+ (UIColor *)color:(StyleDictionaryColorName)color;
@end
