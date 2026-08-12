//
//  DocumentScanner.m
//  SunoMobile
//
//  Created by Chetna on 10/10/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DocumentScannerPdf, NSObject)
RCT_EXTERN_METHOD(scanDocument:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end

