//
//  DocumentScanner.swift
//  SunoMobile
//
//  Created by Chetna on 10/10/25.
//

import Foundation
import VisionKit
import PDFKit
import UIKit

@objc(DocumentScannerPdf)
class DocumentScannerPdf: NSObject, VNDocumentCameraViewControllerDelegate {
  
  var resolver: RCTPromiseResolveBlock?
  var rejecter: RCTPromiseRejectBlock?
  
  @objc func scanDocument(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.resolver = resolve
      self.rejecter = reject
      
      if VNDocumentCameraViewController.isSupported {
        let scannerViewController = VNDocumentCameraViewController()
        scannerViewController.delegate = self
        UIApplication.shared.keyWindow?.rootViewController?.present(scannerViewController, animated: true)
      } else {
        reject("ERROR", "Document scanning not supported", nil)
      }
    }
  }
  
  //  func documentCameraViewController(_ controller: VNDocumentCameraViewController,
  //                                    didFinishWith scan: VNDocumentCameraScan) {
  //    let pdfDocument = PDFDocument()
  //    for i in 0..<scan.pageCount {
  //      let image = scan.imageOfPage(at: i)
  //      let pdfPage = PDFPage(image: image)
  //      pdfDocument.insert(pdfPage!, at: i)
  //    }
  //
  //    let pdfData = pdfDocument.dataRepresentation()
  //    let timeStamp = Int(Date().timeIntervalSince1970)
  //    let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("suno_\(timeStamp).pdf")
  //
  //    try? pdfData?.write(to: tempURL)
  //
  //    controller.dismiss(animated: false)
  //    resolver?(["filePath": tempURL.path])
  //  }
  //}
  func documentCameraViewController(_ controller: VNDocumentCameraViewController,
                                    didFinishWith scan: VNDocumentCameraScan) {
    
    let pdfDocument = PDFDocument()
    var firstImagePath: String?
    
    let timeStamp = Int(Date().timeIntervalSince1970)
    
    for i in 0..<scan.pageCount {
      let image = scan.imageOfPage(at: i)
      
      // ✅ Add to PDF
      if let pdfPage = PDFPage(image: image) {
        pdfDocument.insert(pdfPage, at: i)
      }
      
      // ✅ Save ONLY first image
      if i == 0 {
        let imageURL = FileManager.default.temporaryDirectory
          .appendingPathComponent("suno_\(timeStamp).jpg")
        
        if let imageData = image.jpegData(compressionQuality: 0.8) {
          try? imageData.write(to: imageURL)
          firstImagePath = imageURL.path
        }
      }
    }
    
    // ✅ Save PDF
    let pdfURL = FileManager.default.temporaryDirectory
      .appendingPathComponent("suno_\(timeStamp).pdf")
    
    if let pdfData = pdfDocument.dataRepresentation() {
      try? pdfData.write(to: pdfURL)
    }
    
    controller.dismiss(animated: false)
    
    // ✅ Return BOTH
    resolver?([
      "pdfPath": pdfURL.path,
      "imagePath": firstImagePath ?? ""
    ])
  }
}
