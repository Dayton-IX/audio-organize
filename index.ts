import { parseBuffer } from "music-metadata";
import fs from "node:fs";
import { extname } from "node:path";

const handleAudioFile = async (
  filePath: string,
  orgPath: string,
): Promise<void> => {
  const file = Bun.file(filePath);
  await file.exists();

  if (!file.type.includes("audio")) {
    console.log("non-audio file, skipping: ", file.name);
    return;
  }

  const fileBuffer = await file.bytes();

  const musicMetadata = await parseBuffer(fileBuffer).catch((err) => {
    console.error("failed to parse music file:", err);
    return;
  });
  if (!musicMetadata) {
    return;
  }

  const parsedMusicData = {
    trackNumber: musicMetadata.common.track.no,
    artist:
      musicMetadata.common.artist ??
      (musicMetadata.common.artists ? musicMetadata.common.artists[0] : null),
    album: musicMetadata.common.album,
    title: musicMetadata.common.title,
  };
  console.log(parsedMusicData);

  const targetTrackPath =
    orgPath +
    "/" +
    (parsedMusicData.artist ?? "unknown_artist") +
    "/" +
    (parsedMusicData.album ?? "no_album") +
    "/" +
    ((parsedMusicData.trackNumber ?? "00") +
      "_" +
      (parsedMusicData.title ?? "no_title") +
      (extname(filePath) ?? ""));
  console.log("writing audio file to target path: ", targetTrackPath);

  Bun.write(targetTrackPath, file);
};

const createOrganizedMusicDir = async (dirPath: string, dirName: string) => {
  const basePath = "/home/daytonix/Music/organized";
  const targetOutputPath = basePath + "/" + dirName;
  if (!fs.existsSync(targetOutputPath)) {
    fs.mkdirSync(targetOutputPath, { recursive: true });
  }

  fs.readdir(dirPath, (_, files) => {
    files.forEach(async (filePath) => {
      handleAudioFile(dirPath + "/" + filePath, targetOutputPath);
    });
  });
};

const dirPathInput = Bun.argv[2];
if (!dirPathInput)
  throw Error("please provide a directory for audio organizer");

const dirNameInput = Bun.argv[3];
if (!dirNameInput)
  throw Error(
    "please provide a directory name for the organized audio to be written to",
  );

await createOrganizedMusicDir(dirPathInput, dirNameInput);

