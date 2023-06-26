import mime from "mime/lite";
import { NFTStorage } from "nft.storage";

const API_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;

export async function storeTribeInfo(image, name, description, link) {
  const client = new NFTStorage({ token: API_KEY });

  const tribe = {
    image: image,
    name: name,
    description: description,
    link: link,
  };

  // const metadata = await client.store(tribe);
  const metadata = 0;
  return metadata;
}
