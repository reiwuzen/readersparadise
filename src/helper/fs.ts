//fs.ts
import { invoke } from "@tauri-apps/api/core";

type ImageFile = {
  name: string;
  path: string;
  extension: string;
}

async function selectAndList(): Promise<ImageFile[]> {
  const files: string[] = await invoke("open_folder_and_list_items");

  const images: ImageFile[] = files
    .map((filePath) => {
      const parts = filePath.split(/[/\\]/); // split path into components
      const nameWithExt = parts[parts.length - 1];
      const dotIndex = nameWithExt.lastIndexOf(".");
      const name = dotIndex >= 0 ? nameWithExt.slice(0, dotIndex) : nameWithExt;
      const extension = dotIndex >= 0 ? nameWithExt.slice(dotIndex + 1).toLowerCase() : "";
      return { name, path: filePath, extension };
    })
    .filter((file) =>
      ["jpg", "jpeg", "png", "webp"].includes(file.extension)
    );

  return images;
}

export default selectAndList;
export { type ImageFile};