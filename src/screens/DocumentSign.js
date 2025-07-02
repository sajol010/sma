/**
 * Copyright (c) 2020-present, Bouncing Shield (bouncingshield.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Pdf from 'react-native-pdf';
const RNFS = require('react-native-fs');
import {PDFDocument} from 'pdf-lib';
import Signature from 'react-native-signature-canvas';
import {decode as atob, encode as btoa} from 'base-64';

export default function DocumentSign() {
  //const sourceUrl = 'http://samples.leanpub.com/thereactnativebook-sample.pdf';
  //const sourceUrl = require('./assets/thereactnativebook-sample.pdf'); // ios only
  const sourceUrl =
    'https://raw.githubusercontent.com/Nazmul56/json/103585d05ee0bc472277273db97bdd2dd9480823/thereactnativebook-sample.pdf';
  //const sourceUrl = 'http://samples.leanpub.com/thereactnativebook-sample.pdf';
  const source = {
    uri: 'https://raw.githubusercontent.com/Nazmul56/json/103585d05ee0bc472277273db97bdd2dd9480823/thereactnativebook-sample.pdf', //'http://samples.leanpub.com/thereactnativebook-sample.pdf',
    cache: true,
  };
  const [fileDownloaded, setFileDownloaded] = useState(false); //Default false
  const [getSignaturePad, setSignaturePad] = useState(false);
  const [pdfEditMode, setPdfEditMode] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState(null);
  const [signatureArrayBuffer, setSignatureArrayBuffer] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [filePath, setFilePath] = useState(
    `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
  );
  useEffect(() => {
    console.log('useEffect called');
    downloadFile();
    if (signatureBase64) {
      setSignatureArrayBuffer(_base64ToArrayBuffer(signatureBase64));
    }
    if (newPdfSaved) {
      setFilePath(newPdfPath);
      setPdfArrayBuffer(_base64ToArrayBuffer(pdfBase64));
    }
    console.log('filePath', filePath);

    //for delete old file
    // RNFS.unlink(filePath)
    //   .then(() => {
    //     console.log('Previous file deleted');
    //   })
    //   .catch(err => {
    //     console.log(err.message);
    //   });
  }, [signatureBase64, filePath, newPdfSaved]);
  const _base64ToArrayBuffer = base64 => {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };
  const _uint8ToBase64 = u8Arr => {
    const CHUNK_SIZE = 0x8000; //arbitrary number
    let index = 0;
    const length = u8Arr.length;
    let result = '';
    let slice;
    while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    return btoa(result);
  };
  const downloadFile = () => {
    if (!fileDownloaded) {
      console.log('Downloaded file start');
      RNFS.downloadFile({
        fromUrl: sourceUrl,
        toFile: filePath,
        //background: true, // Enable downloading in the background (iOS only)
        //discretionary: true, // Allow the OS to control the timing and speed (iOS only)
        progress: res => {
          // Handle download progress updates if needed
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Progress: ${progress.toFixed(2)}%`);
        },
      }).promise.then(res => {
        console.log('Downloaded file end');
        setFileDownloaded(true);
        readFile();
      });
    }
  };
  const readFile = () => {
    console.log('PDF read ');
    RNFS.readFile(
      `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
      'base64',
    ).then(contents => {
      setPdfBase64(contents);
      setPdfArrayBuffer(_base64ToArrayBuffer(contents));
    });
  };
  const getSignature = () => {
    setSignaturePad(true);
  };
  const handleSignature = signature => {
    setSignatureBase64(signature.replace('data:image/png;base64,', ''));
    setSignaturePad(false);
    setPdfEditMode(true);
  };
  const handleSingleTap = async (page, x, y) => {
    if (pdfEditMode) {
      setNewPdfSaved(false);
      setFilePath(null);
      setPdfEditMode(false);
      console.log('pdf array: ');
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[page - 1];
      // The meat
      const signatureImage = await pdfDoc.embedPng(signatureArrayBuffer);
      if (Platform.OS === 'ios') {
        firstPage.drawImage(signatureImage, {
          x: (pageWidth * (x - 12)) / Dimensions.get('window').width,
          y: pageHeight - (pageHeight * (y + 12)) / 540,
          width: 50,
          height: 50,
        });
      } else {
        firstPage.drawImage(signatureImage, {
          x: (firstPage.getWidth() * x) / pageWidth,
          y:
            firstPage.getHeight() -
            (firstPage.getHeight() * y) / pageHeight -
            25,
          width: 150,
          height: 150,
        });
      }
      // Play with these values as every project has different requirements
      const pdfBytes = await pdfDoc.save();
      const pdfBase64 = _uint8ToBase64(pdfBytes);
      const path = `${
        RNFS.DocumentDirectoryPath
      }/react-native_signed_${Date.now()}.pdf`;
      console.log('path', path);
      RNFS.writeFile(path, pdfBase64, 'base64')
        .then(success => {
          setNewPdfPath(path);
          setNewPdfSaved(true);
          setPdfBase64(pdfBase64);
        })
        .catch(err => {
          console.log(err.message);
        });
    }
  };
  return (
    <View style={styles.container}>
      {getSignaturePad ? (
        <Signature
          onOK={sig => handleSignature(sig)}
          onEmpty={() => console.log('___onEmpty')}
          descriptionText="Sign"
          clearText="Clear"
          confirmText="Save"
        />
      ) : (
        fileDownloaded && (
          <View>
            {filePath ? (
              <View>
                <Text style={styles.headerText}>
                  React Native Digital PDF Signature
                </Text>
                <Pdf
                  minScale={1.0}
                  maxScale={1.0}
                  scale={1.0}
                  spacing={0}
                  fitPolicy={0}
                  enablePaging={true}
                  source={{uri: filePath}}
                  //source={source}
                  usePDFKit={false}
                  onLoadComplete={(
                    numberOfPages,
                    filePath,
                    {width, height},
                  ) => {
                    setPageWidth(width);
                    setPageHeight(height);
                  }}
                  onPageSingleTap={(page, x, y) => {
                    handleSingleTap(page, x, y);
                  }}
                  style={styles.pdf}
                />
              </View>
            ) : (
              <View style={styles.button}>
                <Text style={styles.buttonText}>Saving PDF File...</Text>
              </View>
            )}
            {pdfEditMode ? (
              <View style={styles.message}>
                <Text>* EDIT MODE *</Text>
                <Text>Touch where you want to place the signature</Text>
              </View>
            ) : (
              filePath && (
                <View>
                  <TouchableOpacity
                    onPress={getSignature}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Sign Document</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        )
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  headerText: {
    color: '#508DBC',
    fontSize: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  pdf: {
    width: Dimensions.get('window').width,
    height: 540,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#508DBC',
    padding: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#DAFFFF',
  },
  message: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF88C',
  },
});
