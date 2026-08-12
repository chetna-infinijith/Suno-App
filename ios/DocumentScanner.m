#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DocumentScanner, NSObject)
RCT_EXTERN_METHOD(scanDocument:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end
