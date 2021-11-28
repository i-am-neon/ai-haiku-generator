import fs from 'fs'
import Image from '../models/Image';

export async function saveImageToMongo(address, filePath, paperName) {


  function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
  }

  var bitmap = base64_encode(filePath);
  const encodedPng = 'data:image/png;base64,' + bitmap;
  // console.log(`encodedPng`, encodedPng);

  const img = new Image({
    walletAddress: address,
    png: encodedPng,
    paperName
  })
  await img.save();

}