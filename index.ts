import { parseBlob, parseBuffer } from "music-metadata";

const audioMetadataReader = async (filePath: string): Promise<void> => {
  const file = Bun.file(filePath);
  await file.exists();
  console.log("bun file:", file);

  const fileBuffer = await file.bytes();

  const musicMetadata = await parseBuffer(fileBuffer);
  console.log(musicMetadata);
};

const filePathInput = Bun.argv[2];
if (!filePathInput) throw Error("please provide a file path for mp3 reader");

audioMetadataReader(filePathInput);

