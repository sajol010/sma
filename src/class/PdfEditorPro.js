// src/utils/pdfEditor.js
import { PDFDocument, StandardFonts } from 'pdf-lib';
const RNFS = require('react-native-fs');
import { decode as atob, encode as btoa } from 'base-64';
import Utils from './Utils';

export const base64ToArrayBuffer = (base64) => {
  // Implementation for converting base64 to ArrayBuffer
  let binary_string = atob(base64);
  let len = binary_string.length;
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

export const uint8ToBase64 = (u8Arr) => {
  // Implementation for converting Uint8Array to base64
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

export const makeNDAPdfForView = async (
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
  // Implementation for getting combined PDF
  console.log('Callback params: ' + callback + ' Type: ' + type);
  console.log('File path:-- ' + filePath);

  let contant = await RNFS.readFile(filePath, 'base64');
  let buffer = base64ToArrayBuffer(contant);
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
  let partyBStreetAddress = receiver_address ? receiver_address : '';
  let partyBAddressFull = receiver_address ? receiver_address + ', ' + receiver_address_full : '';
  let partyBEmail = receiver_email;
  let partyBSignedDate = '';


  let senderConfig = pdfEditConfig.sender;
  console.log("Pdf Config: " + JSON.stringify(senderConfig));

  for (let i = 0; i < senderConfig.length; i++) {
    let item = senderConfig[i];
    console.log("Item: " + JSON.stringify(item));

    let textPrint = ''
    switch (item.text) {
      case 'partyAName':
        textPrint = partyAName
        break
      case 'formattedDateA':
        textPrint = formattedDate
        break
      case 'partyAPdfAddress':
        textPrint = partyAStreetAddress + ', ' + partyAAddressFull
        break
      case 'partyBName':
        textPrint = partyBName
        break
      case 'partyBPdfAddress':
        textPrint = partyBAddressFull
        break
      default:
        console.log("Text not found not match")
    }

    //textPrint = timesRomanFont.encodeText(textPrint);

    let type = item.type;
    switch (type) {
      case 'drawText':
        let page = pdfDoc.getPage(item.page);
        page.setFont(timesRomanFont);

        page.drawText(textPrint, {
          x: item.x,
          y: item.y,
          size: item.size,
        });

        break
      case 'drawImage':
        let page_ = pdfDoc.getPage(item.page);
        // console.log('signature start= ' + signatureBase64);
        const signatureImage = await pdfDoc.embedPng(signatureBase64);
        if (Platform.OS === 'ios') {
          page_.drawImage(signatureImage, {
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
          });
        } else {
          page_.drawImage(signatureImage, {
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
          });
        }

        break
      default:
        console.log("Type not match")
    }
  }

  console.log('pdf array: signed--- ');

  // Note that these fields are visible in the "Document Properties" section of
  // most PDF readers.
  pdfDoc.setTitle('Shush');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('Shush Privacy App');
  pdfDoc.setKeywords(['nda', 'send', 'receive', 'sign']);
  pdfDoc.setProducer('Shush Privacy App');
  pdfDoc.setCreator('Shush Privacy App');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  let pdfBytes = await pdfDoc.save();
  let pdfBase64 = uint8ToBase64(pdfBytes);
  let path = `${RNFS.DocumentDirectoryPath
    }/react-native_signed_combined_${Date.now()}.pdf`;
  console.log('path', path);

  try {
    RNFS.writeFile(path, pdfBase64, 'base64')
      .then(success => {
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

export const makeNDAPdf = async (
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

  custom_section,

  type,
  signatureBase64,
  callback,
) => {
  // Implementation for getting combined PDF
  console.log('Callback params: ' + callback + ' Type: ' + type);
  console.log('File path:-- ' + filePath);

  let contant = await RNFS.readFile(filePath, 'base64');
  let buffer = base64ToArrayBuffer(contant);
  let pdfDocSample = await PDFDocument.load(buffer);

  let pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const totalPages = parseInt(pdfEditConfig.pageCount, 10);
  const pageIndices = Array.from({ length: totalPages }, (_, i) => i);
  const copiedPages = await pdfDoc.copyPages(pdfDocSample, pageIndices);


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

  console.log('Custom section: ' + custom_section);
  let customSection = custom_section ? custom_section : ''

  console.log("Receiver name: " + receiver_name +
    "\n Receiver address: " + receiver_address +
    "\n Receiver full address: " + receiver_address_full)

  let partyBName = receiver_name ? receiver_name : '';
  let partyBStreetAddress = receiver_address ? receiver_address : '';
  let partyBAddressFull = receiver_address ? receiver_address + ', ' + receiver_address_full : '';
  let partyBEmail = receiver_email;
  let partyBSignedDate = '';


  let senderConfig = pdfEditConfig.sender;

  console.log('Sender config: ' + senderConfig);

  // senderConfig = [
  //   {
  //     "x": 195,
  //     "y": 448,
  //     "page": 2,
  //     "size": 12,
  //     "text": "partyAName",
  //     "type": "drawText"
  //   },
  //   {
  //     "x": 400,
  //     "y": 448,
  //     "page": 2,
  //     "size": 12,
  //     "text": "formattedDateA",
  //     "type": "drawText"
  //   },
  //   {
  //     "x": 75,
  //     "y": 695,
  //     "page": 0,
  //     "size": 12,
  //     "text": "formattedDateA",
  //     "type": "drawText"
  //   },
  //   {
  //     "x": 120,
  //     "y": 674,
  //     "page": 0,
  //     "size": 12,
  //     "text": "partyAName",
  //     "type": "drawText"
  //   },
  //   {
  //     "x": 72,
  //     "y": 652,
  //     "page": 0,
  //     "size": 12,
  //     "text": "partyAPdfAddress",
  //     "type": "drawText"
  //   },
  //   {
  //     "x": 195,
  //     "y": 383,
  //     "page": 2,
  //     "size": 12,
  //     "text": "partyBName",
  //     "type": "drawText"
  //   },
  //   {
  //     "x": 120,
  //     "y": 630,
  //     "page": 0,
  //     "size": 12,
  //     "text": "partyBName",
  //     "type": "drawText"
  //   },
  //   {
  //     "x": 72,
  //     "y": 609,
  //     "page": 0,
  //     "size": 12,
  //     "text": "partyBPdfAddress",
  //     "type": "drawText"
  //   },
  //   {
  //     "x": 75,
  //     "y": 693,
  //     "page": 1,
  //     "size": 12,
  //     "text": "customSection",
  //     "type": "drawText",

  //   },
  //   {
  //     "x": 190,
  //     "y": 471,
  //     "page": 2,
  //     "type": "drawImage",
  //     "width": 71,
  //     "height": 40
  //   }
  // ]

  console.log("Pdf Config: " + JSON.stringify(senderConfig));

  for (let i = 0; i < senderConfig.length; i++) {
    let item = senderConfig[i];
    console.log("Item: " + JSON.stringify(item));

    let textPrint = ''
    switch (item.text) {
      case 'partyAName':
        textPrint = partyAName
        break
      case 'formattedDateA':
        textPrint = formattedDate
        break
      case 'partyAPdfAddress':
        textPrint = partyAStreetAddress + ', ' + partyAAddressFull
        break
      case 'partyBName':
        textPrint = partyBName
        break
      case 'partyBPdfAddress':
        textPrint = partyBAddressFull
        break

      case 'customSection':
        textPrint = customSection
        break

      default:
        console.log("Text not found not match")
    }

    let type = item.type;
    switch (type) {
      case 'drawText':
        let page = pdfDoc.getPage(item.page);
        page.setFont(timesRomanFont);

        page.drawText(textPrint, {
          x: item.x,
          y: item.y,
          size: item.size,

          lineHeight: 14,

          maxWidth: 500,
          wordBreaks: [" "]

        });

        break
      case 'drawImage':
        let page_ = pdfDoc.getPage(item.page);
        //console.log('signature start= ' + signatureBase64);
        const signatureImage = await pdfDoc.embedPng(signatureBase64);
        if (Platform.OS === 'ios') {
          page_.drawImage(signatureImage, {
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
          });
        } else {
          page_.drawImage(signatureImage, {
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
          });
        }

        break
      default:
        console.log("Type not match")
    }
  }

  console.log('pdf array: signed--- ');

  // Note that these fields are visible in the "Document Properties" section of
  // most PDF readers.
  pdfDoc.setTitle('Shush');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('Shush Privacy App');
  pdfDoc.setKeywords(['nda', 'send', 'receive', 'sign']);
  pdfDoc.setProducer('Shush Privacy App');
  pdfDoc.setCreator('Shush Privacy App');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  let pdfBytes = await pdfDoc.save();
  let pdfBase64 = uint8ToBase64(pdfBytes);
  let path = `${RNFS.DocumentDirectoryPath
    }/react-native_signed_combined_${Date.now()}.pdf`;
  console.log('path', path);

  try {
    RNFS.writeFile(path, pdfBase64, 'base64')
      .then(success => {
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

export const signOnPdf = async (
  filePath, pdfEditConfig, signatureBase64, callback
) => {
  //pdfEditMode
  console.log('pdf array: ');
  let contant = await RNFS.readFile(filePath, 'base64');
  let buffer = base64ToArrayBuffer(contant);

  //var dateFormat = await AsyncStorageManager.getData(CONSTANTS.DATE_FORMAT /*'date_format'*/);
  let formattedDate = Utils.getOnlyDate(new Date(), 'DD MMM YYYY');

  console.log('Date formate: ' + formattedDate);

  //var pdfDoc = await PDFDocument.load(createdPdf);
  let pdfDoc = await PDFDocument.load(buffer);

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  let receiverConfig = pdfEditConfig.receiver;
  console.log("Pdf receiver Config: " + JSON.stringify(receiverConfig));

  // receiverConfig = [
  //   {
  //     "x": 400,
  //     "y": 381,
  //     "page": 2,
  //     "size": 12,
  //     "text": "formattedDateB",
  //     "type": "drawText"
  //   },
  //   {
  //     "x": 190,
  //     "y": 403,
  //     "page": 2,
  //     "type": "drawImage",
  //     "width": 71,
  //     "height": 40
  //   }
  // ]

  for (let i = 0; i < receiverConfig.length; i++) {
    let item = receiverConfig[i];
    console.log("Item: " + JSON.stringify(item));

    let textPrint = ''
    switch (item.text) {
      case 'formattedDateB':
        textPrint = formattedDate
        break
      default:
        console.log("Text not found not match")
    }

    let type = item.type;
    switch (type) {
      case 'drawText':
        let page = pdfDoc.getPage(item.page);
        page.setFont(timesRomanFont);

        page.drawText(textPrint, {
          x: item.x,
          y: item.y,
          size: item.size,
        });

        break
      case 'drawImage':
        let page_ = pdfDoc.getPage(item.page);
        // console.log('signature start= ' + signatureBase64);
        let signatureImage = await pdfDoc.embedPng(signatureBase64);
        if (Platform.OS === 'ios') {
          page_.drawImage(signatureImage, {
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
          });
        } else {
          page_.drawImage(signatureImage, {
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
          });
        }
        break
      default:
        console.log("Type not match")
    }
  }

  console.log('pdf array: signed--- ');
  pdfDoc.setModificationDate(new Date());
  // Play with these values as every project has different requirements
  const pdfBytes = await pdfDoc.save();
  const pdfBase64 = uint8ToBase64(pdfBytes);
  const path = `${RNFS.DocumentDirectoryPath
    }/react-native_signed_1_${Date.now()}.pdf`;
  console.log('path', path);

  try {
    //RNFS.writeFile(path, pdfBase64, 'base64')
    RNFS.writeFile(path, pdfBase64, 'base64')
      .then(success => {
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