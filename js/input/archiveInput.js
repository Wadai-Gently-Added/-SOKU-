// 束 -SOKU-
// 機能02：ZIP / アーカイブ投入
// Version: v0.1

/*
 * ZIP処理には JSZip を使用する。
 *
 * このファイルはZIPを展開し、
 * 機能01のフォルダ投入と同じ形式の
 * ファイル集合へ変換することを担当する。
 *
 * この機能では、まだ
 * ファイル種類判定・本文読み取り・結合は行わない。
 */

const archiveInput = document.querySelector("#archiveInput");
const archiveStatus = document.querySelector("#archiveStatus");
const archiveSummary = document.querySelector("#archiveSummary");
const archiveFileList = document.querySelector("#archiveFileList");

/**
 * ZIP内部のパスからファイル名を取得する。
 *
 * @param {string} path
 * @returns {string}
 */
function getFileName(path) {
  const normalizedPath = path.replace(/\\/g, "/");
  const parts = normalizedPath.split("/");

  return parts[parts.length - 1] || "";
}

/**
 * ZIPエントリがディレクトリか判定する。
 *
 * @param {string} path
 * @param {Object} entry
 * @returns {boolean}
 */
function isDirectoryEntry(path, entry) {
  return Boolean(entry.dir) || path.endsWith("/");
}

/**
 * ZIPを展開してファイル集合へ変換する。
 *
 * @param {File} archiveFile
 * @returns {Promise<Array>}
 */
async function extractZip(archiveFile) {
  if (!archiveFile) {
    throw new Error("ZIPファイルが指定されていません。");
  }

  if (!window.JSZip) {
    throw new Error(
      "ZIP処理ライブラリ JSZip が読み込まれていません。"
    );
  }

  const zip = await window.JSZip.loadAsync(archiveFile);

  const extractedFiles = [];

  for (const [path, entry] of Object.entries(zip.files)) {
    if (isDirectoryEntry(path, entry)) {
      continue;
    }

    const blob = await entry.async("blob");

    const fileName = getFileName(path);

    const file = new File(
      [blob],
      fileName,
      {
        type: blob.type || "application/octet-stream",
        lastModified: Date.now()
      }
    );

    extractedFiles.push({
      file,
      fileName,
      relativePath: path,
      size: file.size,
      lastModified: file.lastModified,
      source: "zip"
    });
  }

  return extractedFiles;
}

/**
 * ZIP投入処理。
 *
 * @param {File} archiveFile
 */
async function handleArchiveInput(archiveFile) {
  if (!archiveFile) {
    archiveStatus.textContent =
      "ZIPファイルが選択されていません。";
    archiveSummary.textContent = "";
    archiveFileList.textContent = "";
    return;
  }

  try {
    archiveStatus.textContent =
      "ZIPを展開しています……";

    archiveSummary.textContent = "";
    archiveFileList.textContent = "";

    const extractedFiles =
      await extractZip(archiveFile);

    archiveStatus.textContent =
      "ZIP展開完了";

    archiveSummary.textContent =
      `ファイル数：${extractedFiles.length}`;

    archiveFileList.textContent =
      extractedFiles
        .map(
          (item, index) =>
            `${index + 1}. ${item.relativePath}`
        )
        .join("\n");

    /*
     * 機能01と同じ受け渡し先を使用する。
     *
     * ZIPを展開した後は、
     * 「ZIPから来たファイル」ではなく
     * 「処理対象となるファイル集合」として
     * 後工程へ渡せるようにする。
     */
    window.sokuInputFiles = extractedFiles;

    /*
     * 元ZIP情報も保持しておく。
     * 後の状態保存やエラー表示等で利用できる。
     */
    window.sokuArchiveFile = archiveFile;

    return extractedFiles;
  } catch (error) {
    archiveStatus.textContent =
      "ZIPの展開に失敗しました。";

    archiveSummary.textContent =
      error instanceof Error
        ? error.message
        : String(error);

    archiveFileList.textContent = "";

    /*
     * ここでは全体処理を停止させるために
     * throw し直さない。
     *
     * 後の機能17で正式なエラー管理へ
     * 統合する予定。
     */
    console.error(
      "束 -SOKU- ZIP extraction error:",
      error
    );

    return [];
  }
}

if (archiveInput) {
  archiveInput.addEventListener(
    "change",
    async (event) => {
      const archiveFile =
        event.target.files?.[0];

      await handleArchiveInput(
        archiveFile
      );
    }
  );
}

export {
  extractZip,
  handleArchiveInput
};
