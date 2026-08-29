// 束 -SOKU-
// 機能01：フォルダ投入
// Version: v0.1

const folderInput = document.querySelector("#folderInput");
const dropArea = document.querySelector("#dropArea");
const status = document.querySelector("#status");
const summary = document.querySelector("#summary");
const fileList = document.querySelector("#fileList");

/**
 * フォルダから取得した FileList を処理する。
 *
 * @param {FileList|File[]} fileListObject
 */
function handleFolderInput(fileListObject) {
  const files = Array.from(fileListObject || []);

  if (files.length === 0) {
    status.textContent = "フォルダが選択されていません。";
    summary.textContent = "";
    fileList.textContent = "";
    return;
  }

  const normalizedFiles = files.map((file) => ({
    file,
    fileName: file.name,
    relativePath:
      file.webkitRelativePath || file.name,
    size: file.size,
    lastModified: file.lastModified
  }));

  const rootNames = new Set(
    normalizedFiles
      .map((item) => item.relativePath.split("/")[0])
      .filter(Boolean)
  );

  status.textContent = "フォルダ取得完了";

  summary.textContent =
    `ファイル数：${normalizedFiles.length}　` +
    `ルートフォルダ数：${rootNames.size}`;

  fileList.textContent = normalizedFiles
    .map(
      (item, index) =>
        `${index + 1}. ${item.relativePath}`
    )
    .join("\n");

  /*
   * 次の機能へ渡せるよう、
   * 現在の取得結果を公開する。
   *
   * 機能02以降では、
   * この受け渡し方法を必要に応じて
   * マスター仕様に従って整理する。
   */
  window.sokuInputFiles = normalizedFiles;
}

folderInput.addEventListener("change", (event) => {
  handleFolderInput(event.target.files);
});

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("is-dragover");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("is-dragover");
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();

  dropArea.classList.remove("is-dragover");

  const files = Array.from(
    event.dataTransfer?.files || []
  );

  if (files.length > 0) {
    handleFolderInput(files);
  }
});

export {
  handleFolderInput
};
