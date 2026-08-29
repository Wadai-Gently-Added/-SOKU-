// 束 -SOKU-
// 機能01：フォルダ投入
// Version: v0.1

const folderInput =
  document.querySelector("#folderInput");

const folderResetButton =
  document.querySelector("#folderResetButton");

const dropArea =
  document.querySelector("#dropArea");

const statusElement =
  document.querySelector("#status");

const summaryElement =
  document.querySelector("#summary");

const fileListElement =
  document.querySelector("#fileList");


/*
 * 共通入力データを初期化。
 *
 * ZIP側など別の入力機能から
 * すでにデータが入っている場合は
 * それを保持する。
 */
if (!Array.isArray(window.sokuInputFiles)) {
  window.sokuInputFiles = [];
}


/**
 * ファイルオブジェクトから
 * 相対パスを取得する。
 *
 * @param {File} file
 * @returns {string}
 */
function getRelativePath(file) {
  return (
    file.webkitRelativePath ||
    file.name
  );
}


/**
 * 共通入力データへファイルを追加する。
 *
 * @param {File[]} files
 */
function appendInputFiles(files) {
  for (const file of files) {
    const relativePath =
      getRelativePath(file);

    window.sokuInputFiles.push({
      file,
      fileName: file.name,
      filePath: relativePath,
      relativePath,
      sourceType: "folder"
    });
  }

  notifyInputUpdated();
}


/**
 * 入力データが更新されたことを
 * 他機能へ通知する。
 */
function notifyInputUpdated() {
  window.dispatchEvent(
    new CustomEvent(
      "soku:input-updated"
    )
  );
}


/**
 * 重複パスを調べる。
 *
 * @returns {string[]}
 */
function findDuplicatePaths() {
  const counts = new Map();

  for (
    const item of window.sokuInputFiles
  ) {
    const path =
      item.relativePath ||
      item.filePath ||
      item.fileName;

    counts.set(
      path,
      (counts.get(path) || 0) + 1
    );
  }

  return Array.from(
    counts.entries()
  )
    .filter(
      ([, count]) => count > 1
    )
    .map(
      ([path]) => path
    );
}


/**
 * フォルダ投入後の表示を更新する。
 *
 * @param {number} addedCount
 */
function renderFolderResult(
  addedCount
) {
  const duplicatePaths =
    findDuplicatePaths();

  statusElement.textContent =
    `${addedCount}ファイルを追加しました。`;

  summaryElement.textContent =
    `現在の投入ファイル数：` +
    `${window.sokuInputFiles.length}` +
    (
      duplicatePaths.length > 0
        ? `　重複パス：${duplicatePaths.length}`
        : ""
    );

  fileListElement.textContent =
    window.sokuInputFiles
      .map(
        item =>
          item.relativePath ||
          item.filePath ||
          item.fileName
      )
      .join("\n");

  if (duplicatePaths.length > 0) {
    statusElement.textContent +=
      ` 同一パスを${duplicatePaths.length}件検出しました。` +
      `両方とも保持しています。`;
  }
}


/**
 * フォルダ選択処理。
 *
 * @param {FileList|File[]} files
 */
function handleFolderInput(files) {
  const fileArray =
    Array.from(files || []);

  if (fileArray.length === 0) {
    return;
  }

  appendInputFiles(
    fileArray
  );

  renderFolderResult(
    fileArray.length
  );
}


/**
 * フォルダ入力をリセットする。
 */
function resetFolderInput() {
  /*
   * フォルダ由来のデータだけを削除。
   * ZIP由来のデータは残す。
   */
  window.sokuInputFiles =
    window.sokuInputFiles.filter(
      item =>
        item.sourceType !== "folder"
    );

  folderInput.value = "";

  statusElement.textContent =
    "フォルダ入力をリセットしました。";

  summaryElement.textContent =
    window.sokuInputFiles.length > 0
      ? `現在の投入ファイル数：` +
        `${window.sokuInputFiles.length}`
      : "";

  fileListElement.textContent =
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


/**
 * ドラッグ＆ドロップ処理。
 *
 * @param {DragEvent} event
 */
function handleDrop(event) {
  event.preventDefault();

  dropArea.classList.remove(
    "is-dragover"
  );

  const files =
    event.dataTransfer?.files;

  handleFolderInput(files);
}


folderInput.addEventListener(
  "change",
  event => {
    handleFolderInput(
      event.target.files
    );
  }
);


folderResetButton.addEventListener(
  "click",
  resetFolderInput
);


dropArea.addEventListener(
  "dragover",
  event => {
    event.preventDefault();

    dropArea.classList.add(
      "is-dragover"
    );
  }
);


dropArea.addEventListener(
  "dragleave",
  () => {
    dropArea.classList.remove(
      "is-dragover"
    );
  }
);


dropArea.addEventListener(
  "drop",
  handleDrop
);


export {
  handleFolderInput,
  resetFolderInput
};
