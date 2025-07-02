import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
const RNFS = require('react-native-fs');
import { decode as atob, encode as btoa } from 'base-64';
import { Platform } from 'react-native';
import Utils from './Utils';

class PdfEditor {
  constructor() {
    // Initialize the utility with any necessary configuration or state
  }

  //Token get
  static getData = async key => {
    try {
    } catch (error) {
      console.warn('Async data Error retrieving :', error);
      return null;
    }
  };

  static _base64ToArrayBuffer = base64 => {
    let binary_string = atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };

  static _uint8ToBase64 = u8Arr => {
    let CHUNK_SIZE = 0x8000; //arbitrary number
    let index = 0;
    let length = u8Arr.length;
    let result = '';
    let slice;
    while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    return btoa(result);
  };

  //Not used
  static setDocumentMetadata = async callback => {
    var pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    var partyAName = '';
    var partyAStreetAddress = '';
    var partyASignedDate = '';

    var partyBName = '';
    var partyBStreet = '';
    var partyBSignedDate = '';

    var party_A_x_val = 400; //250;
    var party_A_y_val = 700; //930; //
    //const page2 = pdfDoc.addPage([500, 600]);
    const page2 = pdfDoc.addPage(PageSizes.Letter); //Letter//Legal: [612.0, 1008.0] // Letter: [612.0, 792.0]
    page2.setFont(timesRomanFont);
    page2.drawText(
      'The parties have executed this Mutual Nondisclosure Agreement as of the dat first  above written.',
      { x: 30, y: party_A_y_val + 60, size: 14 },
    );
    page2.drawText('PARTY_A:', {
      x: party_A_x_val,
      y: party_A_y_val + 30,
      size: 14,
    });
    page2.drawLine({
      start: { x: party_A_x_val, y: party_A_y_val - 40 },
      end: { x: party_A_x_val + 100, y: party_A_y_val - 40 },
      thickness: 2,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0.75,
    });
    // page2.drawText('Signed on: ' + partyBSignedDate, {
    //   x: party_A_x_val + 40,
    //   y: party_A_y_val - 60,
    //   size: 12,
    // });
    page2.drawText('Name: ' + partyAName, {
      x: party_A_x_val,
      y: party_A_y_val - 80,
      size: 12,
    });
    page2.drawText('Title: ' + partyAStreetAddress, {
      x: party_A_x_val,
      y: party_A_y_val - 100,
      size: 12,
    });
    page2.drawText('Email: ' + partyASignedDate, {
      x: party_A_x_val,
      y: party_A_y_val - 120,
      size: 12,
    });

    var party_B_x_val = party_A_x_val;
    var party_B_y_val = party_A_y_val - 200;

    page2.drawText('PARTY_B:', {
      x: party_B_x_val,
      y: party_B_y_val + 30,
      size: 14,
    });
    page2.drawLine({
      start: { x: party_B_x_val, y: party_B_y_val - 40 },
      end: { x: party_B_x_val + 100, y: party_B_y_val - 40 },
      thickness: 2,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0.75,
    });
    // page2.drawText('Signed on: ' + partyBSignedDate, {
    //   x: party_B_x_val + 50,
    //   y: party_B_y_val - 60,
    //   size: 12,
    // });
    page2.drawText('Name: ' + partyBName, {
      x: party_B_x_val,
      y: party_B_y_val - 80,
      size: 12,
    });
    page2.drawText('Title: ' + partyBStreet, {
      x: party_B_x_val,
      y: party_B_y_val - 100,
      size: 12,
    });
    page2.drawText('Email: ', {
      x: party_B_x_val,
      y: party_B_y_val - 120,
      size: 12,
    });

    // Note that these fields are visible in the "Document Properties" section of
    // most PDF readers.
    pdfDoc.setTitle('🥚 The Life of an Egg 🍳');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('📘 An Epic Tale of Woe 📖');
    pdfDoc.setKeywords(['eggs', 'wall', 'fall', 'king', 'horses', 'men']);
    pdfDoc.setProducer('PDF App 9000 🤖');
    pdfDoc.setCreator('pdf-lib (https://github.com/Hopding/pdf-lib)');
    pdfDoc.setCreationDate(new Date('2018-06-24T01:58:37.228Z'));
    pdfDoc.setModificationDate(new Date('2019-12-21T07:00:11.000Z'));

    //const pdfBytes = await pdfDoc.save();

    //const pdfBytes = await pdfDoc.saveAsBase64;
    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    //const pdfDataUri = await document.saveAsBase64({dataUri: true});

    // console.log(JSON.stringify(pdfDataUri));
    //setCreatedPdf(pdfDataUri);

    // Call the callback function here
    if (typeof callback === 'function') {
      callback(pdfDataUri);
    }
  };

  //Sender
  static getCombinedPdf = async (
    filePath,

    sender_name,
    sender_email,
    sender_address,
    sender_address_full,

    receiver_name,
    receiver_email,
    receiver_address,
    receiver_address_full,

    type,
    signatureBase64,
    callback,

  ) => {
    console.log('Callback params: ' + callback + ' Type: ' + type);
    console.log('File path:-- ' + filePath);

    let contant = await RNFS.readFile(filePath, 'base64');
    let buffer = this._base64ToArrayBuffer(contant);
    let pdfDocSample = await PDFDocument.load(buffer);

    let pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const copiedPages = await pdfDoc.copyPages(pdfDocSample, [0, 1, 2]);

    for (let i of copiedPages) {
      // Do something with each page2
      pdfDoc.addPage(i);
    }

    //var dateFormat = await AsyncStorageManager.getData(CONSTANTS.DATE_FORMAT /*'date_format'*/);
    let formattedDate = Utils.getOnlyDate(new Date(), 'DD MMM YYYY');
    console.log('Date formate: ' + formattedDate);

    console.log('sender name ' + sender_name);
    let partyAName = sender_name;
    let partyAStreetAddress = sender_address;
    let partyAAddressFull = sender_address_full;
    let partyAEmail = sender_email;

    let partyASignedDate = '';

    console.log("Receiver name: " + receiver_name +
      "\n Receiver address: " + receiver_address +
      "\n Receiver full address: " + receiver_address_full)

    let partyBName = receiver_name ? receiver_name : '';
    let partyBStreet = receiver_address ? receiver_address : '';
    let partyBAddressFull = receiver_address ? receiver_address_full : '';
    let partyBEmail = receiver_email;
    let partyBSignedDate = '';

    //page 1
    let party_A_x_val = 170;
    let party_A_y_val = 300;

    //page 2
    let party_A_p1_x_val = 230;
    let party_A_p1_y_val = 708;
    //const page2 = pdfDoc.addPage([500, 600]);
    //const page21 = pdfDoc.addPage(PageSizes.Letter); //Letter//Legal: [612.0, 1008.0] // Letter: [612.0, 792.0]

    let page1 = pdfDoc.getPage(0);
    let page2 = pdfDoc.getPage(2);
    page1.setFont(timesRomanFont);
    page2.setFont(timesRomanFont);
    // page2.drawLine({
    //   start: { x: party_A_x_val, y: party_A_y_val - 40 },
    //   end: { x: party_A_x_val + 150, y: party_A_y_val - 40 },
    //   thickness: 2,
    //   color: rgb(0.75, 0.75, 0.75),
    //   opacity: 0.75,
    // });

    console.log('=============== Page Position ===========');

    //===============Party A - Last Page ===========
    page2.drawText("" + partyAName, {
      x: party_A_x_val + 25,
      y: party_A_y_val + 234,
      size: 11,
    });

    console.log(' partyAName page: 2 x: '+ (party_A_x_val + 25)+' y: ' + (party_A_y_val + 234) + 'size: 11')

    page2.drawText(formattedDate, {
      x: party_A_x_val + 230,
      y: party_A_y_val + 234,
      size: 11,
    });

    console.log( `formattedDateA page: 2 x: `+ (party_A_x_val + 230)+ ` y: ` + (party_A_y_val + 234) + `size: 11`)

    //===============Party A - First Page ===========
    page1.drawText(formattedDate, {
      x: party_A_p1_x_val - 155,
      y: party_A_p1_y_val - 10,
      size: 10,
    });

    console.log('formattedDateA page: 0 x: '+ (party_A_p1_x_val - 155)+ ' y: ' + (party_A_p1_y_val - 10) + 'size: 10')

    //Top heading
    page1.drawText("" + partyAName, {
      x: party_A_p1_x_val - 110,
      y: party_A_p1_y_val - 32,
      size: 11,
    });

    console.log(' partyAName page: 0 x: '+ (party_A_p1_x_val - 110)+ ' y: ' + (party_A_p1_y_val - 32) + 'size: 11')

    //Top Address
    page1.drawText('' + partyAStreetAddress + ', ' + partyAAddressFull, {
      x: party_A_p1_x_val - 158,
      y: party_A_p1_y_val - 56,
      size: 11,
    });

    console.log(' partyAPdfAddress page: 0 x: '+ (party_A_p1_x_val - 158)+ ' y: ' + (party_A_p1_y_val - 56) + 'size: 11')

    //===============Party B - Last Page ===========
    let party_B_x_val = party_A_x_val;
    let party_B_y_val = party_A_y_val - 90;

    let party_B_p1_x_val = party_A_p1_x_val;
    let party_B_p1_y_val = party_A_p1_y_val - 76;  // 56
    //Name
    page2.drawText('' + partyBName, {
      x: party_B_x_val + 25,
      y: party_B_y_val + 257,
      size: 11,
    });

    console.log(' partyBName page: 2 x: '+ (party_B_x_val + 25)+ ' y: ' + (party_B_y_val + 257) + 'size: 11')

    //===============Party B - First Page ===========
    //This go to Page 1
    page1.drawText('' + partyBName, {
      x: party_B_p1_x_val - 110,
      y: party_B_p1_y_val,
      size: 11,
    });

    console.log(' partyBName page: 0 x: '+ (party_B_p1_x_val - 110)+ ' y: ' + party_B_p1_y_val + 'size: 11')

    //Address: 
    page1.drawText('' + partyBStreet + ", " + partyBAddressFull, {
      x: party_B_p1_x_val - 158,
      y: party_B_p1_y_val - 20,
      size: 11,
    });

    console.log(' partyBPdfAddress page: 0 x: '+ (party_B_p1_x_val - 158)+ ' y: ' + (party_B_p1_y_val - 20) + 'size: 11')

    //===============Party B - Last Page Signature ===========
    let X_VAL = 0;
    let Y_VAL = 0;
    if (type === 'sender') {
      X_VAL = party_A_x_val;
      Y_VAL = party_A_y_val - 40;
    } else { //Receiver
      X_VAL = party_B_x_val;
      Y_VAL = party_B_y_val - 30;
    }

    // console.log('signature start= ' + signatureBase64);
    const signatureImage = await pdfDoc.embedPng(signatureBase64);
    if (Platform.OS === 'ios') {
      page2.drawImage(signatureImage, {
        x: X_VAL + 20,
        y: Y_VAL + 277,
        width: 50,
        height: 50,
      });
    } else {
      page2.drawImage(signatureImage, {
        x: X_VAL + 20,
        y: Y_VAL + 277,
        width: 50,
        height: 50,
      });
    }
    console.log(' partyASignature page: 2 x: '+ (X_VAL + 20) + ' y: ' + (Y_VAL + 277) + ' width: '+ 50+ ' height: '+50 )

    console.log('=============== Page Position end create nda ===========');
    console.log('pdf array: signed--- ');

    // Note that these fields are visible in the "Document Properties" section of
    // most PDF readers.
    pdfDoc.setTitle('Shush');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('Shush Privacy App');
    pdfDoc.setKeywords(['nda', 'send', 'receive','sign']);
    pdfDoc.setProducer('Shush Privacy App');
    pdfDoc.setCreator('Shush Privacy App');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    //const pdfBytes = await pdfDoc.save();
    //const pdfBytes = await pdfDoc.saveAsBase64;
    //const pdfDataUri = await pdfDoc.saveAsBase64({dataUri: true});
    //pdfDoc.save();
    //const pdfDataUri = await document.saveAsBase64({dataUri: true});

    //console.log(JSON.stringify(pdfDataUri));
    //setCreatedPdf(pdfDataUri);
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = this._uint8ToBase64(pdfBytes);
    const path = `${RNFS.DocumentDirectoryPath
      }/react-native_signed_combined_${Date.now()}.pdf`;
    console.log('path', path);

    try {
      //RNFS.writeFile(path, pdfBase64, 'base64')
      RNFS.writeFile(path, pdfBase64, 'base64')
        .then(success => {
          //setNewPdfPath(path);
          //setNewPdfSaved(true);
          //setPdfBase64(pdfBase64);
          //Update ui
          callback(true, path);
        })
        .catch(err => {
          console.log(err.message);
          callback(false, path);
        });
    } catch (error) {
      console.log('Error saving PDF:', error);
      callback(false, error);
    }

  };

  static makeNDAPdf = async (
    filePath,
    pdfEditConfig,

    sender_name,
    sender_email,
    sender_address,
    sender_address_full,

    receiver_name,
    receiver_email,
    receiver_address,
    receiver_address_full,

    type,
    signatureBase64,
    callback,

  ) => {
    console.log('Callback params: ' + callback + ' Type: ' + type);
    console.log('File path:-- ' + filePath);

    let contant = await RNFS.readFile(filePath, 'base64');
    let buffer = this._base64ToArrayBuffer(contant);
    let pdfDocSample = await PDFDocument.load(buffer);

    let pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const copiedPages = await pdfDoc.copyPages(pdfDocSample, [0, 1, 2]);

    for (let i of copiedPages) {
      // Do something with each page2
      pdfDoc.addPage(i);
    }

    //var dateFormat = await AsyncStorageManager.getData(CONSTANTS.DATE_FORMAT /*'date_format'*/);
    let formattedDate = Utils.getOnlyDate(new Date(), 'DD MMM YYYY');
    console.log('Date formate: ' + formattedDate);

    console.log('sender name ' + sender_name);

    console.log("Pdf Config: "+ JSON.stringify(pdfEditConfig))
    let partyAName = sender_name;
    let partyAStreetAddress = sender_address;
    let partyAAddressFull = sender_address_full;
    let partyAEmail = sender_email;

    let partyASignedDate = '';

    console.log("Receiver name: " + receiver_name +
      "\n Receiver address: " + receiver_address +
      "\n Receiver full address: " + receiver_address_full)

    let partyBName = receiver_name ? receiver_name : '';
    let partyBStreet = receiver_address ? receiver_address : '';
    let partyBAddressFull = receiver_address ? receiver_address_full : '';
    let partyBEmail = receiver_email;
    let partyBSignedDate = '';

    //page 1
    let party_A_x_val = 170;
    let party_A_y_val = 300;

    //page 2
    let party_A_p1_x_val = 230;
    let party_A_p1_y_val = 708;
    //const page2 = pdfDoc.addPage([500, 600]);
    //const page21 = pdfDoc.addPage(PageSizes.Letter); //Letter//Legal: [612.0, 1008.0] // Letter: [612.0, 792.0]

    let page1 = pdfDoc.getPage(0);
    let page2 = pdfDoc.getPage(2);
    page1.setFont(timesRomanFont);
    page2.setFont(timesRomanFont);
    // page2.drawLine({
    //   start: { x: party_A_x_val, y: party_A_y_val - 40 },
    //   end: { x: party_A_x_val + 150, y: party_A_y_val - 40 },
    //   thickness: 2,
    //   color: rgb(0.75, 0.75, 0.75),
    //   opacity: 0.75,
    // });

    console.log('=============== Page Position ===========');

    //===============Party A - Last Page ===========
    page2.drawText("" + partyAName, {
      x: party_A_x_val + 25,
      y: party_A_y_val + 234,
      size: 11,
    });

    console.log(' partyAName page: 2 x: '+ (party_A_x_val + 25)+' y: ' + (party_A_y_val + 234) + 'size: 11')

    page2.drawText(formattedDate, {
      x: party_A_x_val + 230,
      y: party_A_y_val + 234,
      size: 11,
    });

    console.log( `formattedDateA page: 2 x: `+ (party_A_x_val + 230)+ ` y: ` + (party_A_y_val + 234) + `size: 11`)

    //===============Party A - First Page ===========
    page1.drawText(formattedDate, {
      x: party_A_p1_x_val - 155,
      y: party_A_p1_y_val - 10,
      size: 10,
    });

    console.log('formattedDateA page: 0 x: '+ (party_A_p1_x_val - 155)+ ' y: ' + (party_A_p1_y_val - 10) + 'size: 10')

    //Top heading
    page1.drawText("" + partyAName, {
      x: party_A_p1_x_val - 110,
      y: party_A_p1_y_val - 32,
      size: 11,
    });

    console.log(' partyAName page: 0 x: '+ (party_A_p1_x_val - 110)+ ' y: ' + (party_A_p1_y_val - 32) + 'size: 11')

    //Top Address
    page1.drawText('' + partyAStreetAddress + ', ' + partyAAddressFull, {
      x: party_A_p1_x_val - 158,
      y: party_A_p1_y_val - 56,
      size: 11,
    });

    console.log(' partyAPdfAddress page: 0 x: '+ (party_A_p1_x_val - 158)+ ' y: ' + (party_A_p1_y_val - 56) + 'size: 11')

    //===============Party B - Last Page ===========
    let party_B_x_val = party_A_x_val;
    let party_B_y_val = party_A_y_val - 90;

    let party_B_p1_x_val = party_A_p1_x_val;
    let party_B_p1_y_val = party_A_p1_y_val - 76;  // 56
    //Name
    page2.drawText('' + partyBName, {
      x: party_B_x_val + 25,
      y: party_B_y_val + 257,
      size: 11,
    });

    console.log(' partyBName page: 2 x: '+ (party_B_x_val + 25)+ ' y: ' + (party_B_y_val + 257) + 'size: 11')

    //===============Party B - First Page ===========
    //This go to Page 1
    page1.drawText('' + partyBName, {
      x: party_B_p1_x_val - 110,
      y: party_B_p1_y_val,
      size: 11,
    });

    console.log(' partyBName page: 0 x: '+ (party_B_p1_x_val - 110)+ ' y: ' + party_B_p1_y_val + 'size: 11')

    //Address: 
    page1.drawText('' + partyBStreet + ", " + partyBAddressFull, {
      x: party_B_p1_x_val - 158,
      y: party_B_p1_y_val - 20,
      size: 11,
    });

    console.log(' partyBPdfAddress page: 0 x: '+ (party_B_p1_x_val - 158)+ ' y: ' + (party_B_p1_y_val - 20) + 'size: 11')

    //===============Party B - Last Page Signature ===========
    let X_VAL = 0;
    let Y_VAL = 0;
    if (type === 'sender') {
      X_VAL = party_A_x_val;
      Y_VAL = party_A_y_val - 40;
    } else { //Receiver
      X_VAL = party_B_x_val;
      Y_VAL = party_B_y_val - 30;
    }

    // console.log('signature start= ' + signatureBase64);
    const signatureImage = await pdfDoc.embedPng(signatureBase64);
    if (Platform.OS === 'ios') {
      page2.drawImage(signatureImage, {
        x: X_VAL + 20,
        y: Y_VAL + 277,
        width: 50,
        height: 50,
      });
    } else {
      page2.drawImage(signatureImage, {
        x: X_VAL + 20,
        y: Y_VAL + 277,
        width: 50,
        height: 50,
      });
    }
    console.log(' partyASignature page: 2 x: '+ (X_VAL + 20) + ' y: ' + (Y_VAL + 277) + ' width: '+ 50+ ' height: '+50 )

    console.log('=============== Page Position end create nda ===========');
    console.log('pdf array: signed--- ');

    // Note that these fields are visible in the "Document Properties" section of
    // most PDF readers.
    pdfDoc.setTitle('Shush');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('Shush Privacy App');
    pdfDoc.setKeywords(['nda', 'send', 'receive','sign']);
    pdfDoc.setProducer('Shush Privacy App');
    pdfDoc.setCreator('Shush Privacy App');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    //const pdfBytes = await pdfDoc.save();
    //const pdfBytes = await pdfDoc.saveAsBase64;
    //const pdfDataUri = await pdfDoc.saveAsBase64({dataUri: true});
    //pdfDoc.save();
    //const pdfDataUri = await document.saveAsBase64({dataUri: true});

    //console.log(JSON.stringify(pdfDataUri));
    //setCreatedPdf(pdfDataUri);
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = this._uint8ToBase64(pdfBytes);
    const path = `${RNFS.DocumentDirectoryPath
      }/react-native_signed_combined_${Date.now()}.pdf`;
    console.log('path', path);

    try {
      //RNFS.writeFile(path, pdfBase64, 'base64')
      RNFS.writeFile(path, pdfBase64, 'base64')
        .then(success => {
          //setNewPdfPath(path);
          //setNewPdfSaved(true);
          //setPdfBase64(pdfBase64);
          //Update ui
          callback(true, path);
        })
        .catch(err => {
          console.log(err.message);
          callback(false, path);
        });
    } catch (error) {
      console.log('Error saving PDF:', error);
      callback(false, error);
    }

  };

  //Receiver
  static signOnPdf = async (filePath, type, signatureBase64, callback) => {
    //pdfEditMode
    console.log('pdf array: ');
    let contant = await RNFS.readFile(filePath, 'base64');
    let buffer = this._base64ToArrayBuffer(contant);

    //var dateFormat = await AsyncStorageManager.getData(CONSTANTS.DATE_FORMAT /*'date_format'*/);
    let formattedDate = Utils.getOnlyDate(new Date(), 'DD MMM YYYY');

    console.log('Date formate: ' + formattedDate);

    //var pdfDoc = await PDFDocument.load(createdPdf);
    let pdfDoc = await PDFDocument.load(buffer);

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    //Last Page
    let party_A_x_val = 170; //250;
    let party_A_y_val = 300; //930; //

    let party_B_x_val = party_A_x_val;
    let party_B_y_val = party_A_y_val - 90;

    let X_VAL = 0;
    let Y_VAL = 0;
    if (type === 'sender') {
      X_VAL = party_A_x_val;
      Y_VAL = party_A_y_val - 40;
    } else {
      X_VAL = party_B_x_val;
      Y_VAL = party_B_y_val - 40;
    }
    //var page2 = 4;
    console.log('pdf page2: ');

    //const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    //const pages = pdfDoc.getPages();

    const firstPage = pdfDoc.getPage(2); //page2s[page2 - 1];

    // const form = pdfDoc.getForm()
    // const fields = form.getFields()
    // fields.forEach(field => {
    //   const type = field.constructor.name
    //   const name = field.getName()

    //   console.log(`${type}: ${name}`)
    //   const alliesField = form.getTextField(name)
    //   alliesField.setText('Name')
    //   alliesField.enableReadOnly
    //   console.log(`${type}: ${name}`)
    // })

    firstPage.setFont(timesRomanFont);

    console.log('=============== Page Position end create nda ===========');
    //==========Party B Last Page ================
    //Party B Formated date
    firstPage.drawText(formattedDate, {
      x: party_B_x_val + 230,
      y: party_B_y_val + 257,
      size: 10,
    });
    console.log('formattedDateA page: 2 x: '+ (party_B_x_val + 230) + ' y: '+ (party_B_y_val + 257)+ " size: 10");

    //Party B Signature
    const signatureImage = await pdfDoc.embedPng(signatureBase64);
    if (Platform.OS === 'ios') {
      firstPage.drawImage(signatureImage, {
        x: X_VAL + 20,
        y: Y_VAL + 297,
        width: 50,
        height: 50,
      });
    } else {
      firstPage.drawImage(signatureImage, {
        x: X_VAL + 20,
        y: Y_VAL + 297,
        width: 50,
        height: 50,
      });
    }
    console.log(' partyBSignature page: 2 x: '+ (X_VAL + 20) + ' y: ' + (Y_VAL + 297) + ' width: '+ 50+ ' height: '+50 )

    console.log('pdf array: signed--- ');
    pdfDoc.setModificationDate(new Date());
    // Play with these values as every project has different requirements
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = this._uint8ToBase64(pdfBytes);
    const path = `${RNFS.DocumentDirectoryPath
      }/react-native_signed_1_${Date.now()}.pdf`;
    console.log('path', path);

    try {
      //RNFS.writeFile(path, pdfBase64, 'base64')
      RNFS.writeFile(path, pdfBase64, 'base64')
        .then(success => {
          //setNewPdfPath(path);
          //setNewPdfSaved(true);
          //setPdfBase64(pdfBase64);
          //Update ui
          callback(true, path);
        })
        .catch(err => {
          console.log(err.message);
          callback(false, path);
        });
    } catch (error) {
      console.log('Error saving PDF:', error);
      callback(false, error);
    }

  };

}
//Unused code
// RNFS.writeFile(path, pdfBase64, 'base64')
//   .then(success => {
//     console.log('Save file in path', path);
//     //callback(path);

//     if (typeof callback === 'function') {
//       //callback(pdfDataUri);
//       //callback(pdfBytes);
//        callback(path);
//     }
//   })
//   .catch(err => {
//     console.log(err.message);
//   });
// Call the callback function here

export default PdfEditor;
