// 束 -SOKU-
// 機能02：ZIP / アーカイブ投入
// Version: v0.1

const archiveInput =
  document.querySelector("#archiveInput");

const archiveResetButton =
  document.querySelector(
    "#archiveResetButton"
  );

const archiveStatus =
  document.querySelector(
    "#archiveStatus"
  );

const archiveSummary =
  document.querySelector(
    "#archiveSummary"
  );

const archiveFileList =
  document.querySelector(
    "#archiveFileList"
  );


/*
 * 共通入力データを初期化。
 */
if (!Array.isArray(window.sokuInputFiles)) {
  window.sokuInputFiles = [];
}


/**
 * 入力データ更新通知。
 */
function notifyInputUpdated() {
  window.dispatchEvent(
    new CustomEvent(
      "soku:input-updated"
    )
  );
}


/**
 * ZIP内部ファイルを共通形式へ変換する。
 *
 * @param {Object} zipEntry
 * @param {File} archiveFile
 * @returns {Promise<Object|null>}
 */
async function convertZipEntry(
  zipEntry,
  archiveFile
) {
  if (zipEntry.dir) {
    return null;
  }

  const blob =
    await zipEntry.async(
      "blob"
    );

  const path =
    zipEntry.name
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

  const fileName =
    path.split("/").pop();

  const file =
    new File(
      [blob],
      fileName,
      {
        type:
          blob.type ||
          "application/octet-stream"
      }
    );

  return {
    file,
    fileName,
    filePath: path,
    relativePath: path,
    sourceType: "archive",
    sourceArchive: archiveFile.name
  };
}


/**
 * ZIPを読み込む。
 *
 * @param {File} archiveFile
 * @returns {Promise<Object[]>}
 */
async function extractZip(
  archiveFile
) {
  if (
    typeof JSZip ===
    "undefined"
  ) {
    throw new Error(
      "ZIP処理ライブラリが読み込まれていません。"
    );
  }

  const zip =
    await JSZip.loadAsync(
      archiveFile
    );

  const entries =
    Object.values(
      zip.files
    );

  const extractedFiles = [];

  for (const entry of entries) {
    const converted =
      await convertZipEntry(
        entry,
        archiveFile
      );

    if (converted) {
      extractedFiles.push(
        converted
      );
    }
  }

  return extractedFiles;
}


/**
 * ZIP投入結果を表示する。
 *
 * @param {Object[]} extractedFiles
 */
function renderArchiveResult(
  extractedFiles
) {
  archiveStatus.textContent =
    `${extractedFiles.length}ファイルを追加しました。`;

  archiveSummary.textContent =
    `現在の投入ファイル数：` +
    `${window.sokuInputFiles.length}`;

  archiveFileList.textContent =
    window.sokuInputFiles
      .map(
        item =>
          item.relativePath ||
          item.filePath ||
          item.fileName
      )
      .join("\n");
}


/**
 * ZIP入力処理。
 *
 * @param {File} archiveFile
 */
async function handleArchiveInput(
  archiveFile
) {
  if (!archiveFile) {
    return;
  }

  archiveStatus.textContent =
    "ZIPを展開しています……";

  archiveSummary.textContent = "";
  archiveFileList.textContent = "";

  try {
    const extractedFiles =
      await extractZip(
        archiveFile
      );

    /*
     * 既存のフォルダ／ZIPデータを
     * 消さずに後ろへ追加。
     */
    window.sokuInputFiles.push(
      ...extractedFiles
    );

    renderArchiveResult(
      extractedFiles
    );

    notifyInputUpdated();

  } catch (error) {
    archiveStatus.textContent =
      "ZIPの処理に失敗しました。";

    archiveSummary.textContent =
      error instanceof Error
        ? error.message
        : String(error);
  }
}


/**
 * ZIP由来のデータだけをリセットする。
 */
function resetArchiveInput() {
  window.sokuInputFiles =
    window.sokuInputFiles.filter(
      item =>
        item.sourceType !== "archive"
    );

  archiveInput.value = "";

  archiveStatus.textContent =
    "ZIP入力をリセットしました。";

  archiveSummary.textContent =
    window.sokuInputFiles.length > 0
      ? `現在の投入ファイル数：` +
        `${window.sokuInputFiles.length}`
      : "";

  archiveFileList.textContent =
    window.sokuInputFiles
      .map(
        item =>
          item.relativePath ||
          item.filePath ||
          item.fileName
      )
      .join("\n");

  notifyInputUpdated();
}


archiveInput.addEventListener(
  "change",
  async event => {
    const file =
      event.target.files?.[0];

    await handleArchiveInput(
      file
    );
  }
);


archiveResetButton.addEventListener(
  "click",
  resetArchiveInput
);


export {
  extractZip,
  handleArchiveInput,
  resetArchiveInput
};
