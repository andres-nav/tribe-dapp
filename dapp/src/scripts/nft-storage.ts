import { NFTStorage } from "nft.storage";

const API_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;

export async function storeTribeInfo(
  name,
  description,
  priceToJoin,
  maxCapacity,
  link
) {
  const client = new NFTStorage({ token: API_KEY });
  const image = new Blob([], {
    type: "image/png",
  });
  const tribe = {
    image,
    name: name,
    description: description,
    priceToJoin: priceToJoin,
    maxCapacity: maxCapacity,
    link: link,
  };

  const metadata = await client.store(tribe);
  console.log(metadata);
  return metadata;
}
