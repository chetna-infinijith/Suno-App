import { NativeModules } from 'react-native';
const { DocumentScanner } = NativeModules;
const { DocumentScannerPdf } = NativeModules;

// export const scanDocument = async () => {
//   try {
//     const result = await DocumentScannerPdf.scanDocument();
//     return result.filePath;
//   } catch (error) {
//     console.log("===== Erroe : ", error)
//     // throw error;
//   }
// };

export const scanDocument = async () => {
  try {
    const result = await DocumentScannerPdf.scanDocument();

    return {
      pdf: `file://${result.pdfPath}`,
      image: `file://${result.imagePath}`,
    };

  } catch (error) {
    console.log("Error:", error);
  }
};

// import { NativeModules } from 'react-native';
// const { ScannerModule } = NativeModules;

// export const startDocumentScan = async () => {
//   try {
//     const res = await ScannerModule.startScan();
//     console.log('Scan result:', res);
//   } catch (e) {
//     console.log('Scan failed:', e);
//   }
// };
