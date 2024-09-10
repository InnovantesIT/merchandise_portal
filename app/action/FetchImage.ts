"use server";
import axios from "axios";

export default async function FetchImage( product : any,auth:any) {
  const config = {
    headers: {
      'Authorization': `Zoho-oauthtoken ${auth}`,
    },
     // Fetch the image as a binary buffer
  };

  try {
    const response = await axios.get(
      `https://www.zohoapis.in/inventory/v1/items/${product.item_id}/image?organization_id=60032377997`,
      {...config,responseType: 'arraybuffer',}
    );

    // Convert the binary data to a Base64 string
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const mimeType = response.headers['content-type']; // Get the mime type from response headers
    const imageSrc = `data:${mimeType};base64,${base64Image}`;

    return imageSrc;
  } catch (error) {
    console.error('Error fetching product image:', error);
    return "";
  }
}
