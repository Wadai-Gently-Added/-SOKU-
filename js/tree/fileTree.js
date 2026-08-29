// 束 -SOKU-
// 機能03：ファイルツリー生成
// Version: v0.1

const treeStatus =
  document.querySelector("#treeStatus");

const treeSummary =
  document.querySelector("#treeSummary");

const fileTreeElement =
  document.querySelector("#fileTree");


/**
 * パスを安全に正規化する。
 *
 * @param {string} path
 * @returns {string[]}
 */
function splitPath(path) {
  return String(path || "")
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean);
}


/**
 * ファイルツリー用のノードを作成する。
 *
 * @param {string} name
 * @param {"file"|"folder"} type
 * @returns {Object}
 */
function createNode(name, type) {
  return {
    name,
    type,
    children: []
  };
}


/**
 * 子ノードを検索する。
 *
 * @param {Object} parent
 * @param {string} name
 * @param {"file"|"folder"} type
 * @returns {Object|null}
 */
function findChild(parent, name, type) {
  return (
    parent.children.find(
      child =>
        child.name === name &&
        child.type === type
    ) || null
  );
}


/**
 * パスをツリーへ追加する。
 *
 * @param {Object} root
 * @param {string} path
 */
function addPathToTree(root, path) {
  const parts = splitPath(path);

  if (parts.length === 0) {
    return;
  }

  let current = root;

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;

    const type = isLast
      ? "file"
      : "folder";

    let child =
      findChild(
        current,
        part,
        type
      );

    if (!child) {
      child =
        createNode(
          part,
          type
        );

      current.children.push(child);
    }

    current = child;
  });
}


/**
 * ツリーを名前順に並べる。
 *
 * フォルダを先に表示し、
 * 同じ種類では名前順にする。
 *
 * @param {Object} node
 */
function sortTree(node) {
  node.children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder"
        ? -1
        : 1;
    }

    return a.name.localeCompare(
      b.name,
      "ja",
      {
        numeric: true,
        sensitivity: "base"
      }
    );
  });

  node.children.forEach(sortTree);
}


/**
 * ツリーを表示用文字列へ変換する。
 *
 * @param {Object} node
 * @param {string} prefix
 * @returns {string}
 */
function renderTreeNode(node, prefix = "") {
  const lines = [];

  node.children.forEach(
    (child, index) => {
      const isLast =
        index ===
        node.children.length - 1;

      const branch =
        isLast
          ? "└─ "
          : "├─ ";

      lines.push(
        `${prefix}${branch}${child.name}${
          child.type === "folder"
            ? "/"
            : ""
        }`
      );

      if (
        child.type === "folder" &&
        child.children.length > 0
      ) {
        const nextPrefix =
          prefix +
          (isLast
            ? "   "
            : "│  ");

        lines.push(
          renderTreeNode(
            child,
            nextPrefix
          )
        );
      }
    }
  );

  return lines.join("\n");
}


/**
 * ファイル集合からツリーを構築する。
 *
 * @param {Array} files
 * @returns {Object}
 */
function buildFileTree(files) {
  const root =
    createNode(
      "root",
      "folder"
    );

  for (const item of files || []) {
    if (!item) {
      continue;
    }

    const path =
      item.relativePath ||
      item.filePath ||
      item.fileName ||
      item.file?.name;

    if (!path) {
      continue;
    }

    addPathToTree(
      root,
      path
    );
  }

  sortTree(root);

  return root;
}


/**
 * ツリーのファイル数を数える。
 *
 * @param {Object} node
 * @returns {number}
 */
function countFiles(node) {
  if (node.type === "file") {
    return 1;
  }

  return node.children.reduce(
    (total, child) =>
      total + countFiles(child),
    0
  );
}


/**
 * ツリーのフォルダ数を数える。
 *
 * root自身は数えない。
 *
 * @param {Object} node
 * @returns {number}
 */
function countFolders(node) {
  return node.children.reduce(
    (total, child) =>
      total +
      (child.type === "folder"
        ? 1 + countFolders(child)
        : 0),
    0
  );
}


/**
 * ファイル集合からファイルツリーを生成する。
 *
 * @param {Array} files
 * @returns {Object}
 */
function renderFileTree(files) {
  if (
    !Array.isArray(files) ||
    files.length === 0
  ) {
    treeStatus.textContent =
      "ファイルツリーを生成するファイルがありません。";

    treeSummary.textContent = "";
    fileTreeElement.textContent = "";

    return null;
  }

  const tree =
    buildFileTree(files);

  const treeText =
    renderTreeNode(tree);

  const fileCount =
    countFiles(tree);

  const folderCount =
    countFolders(tree);

  treeStatus.textContent =
    "ファイルツリー生成完了";

  treeSummary.textContent =
    `ファイル数：${fileCount}　` +
    `フォルダ数：${folderCount}`;

  fileTreeElement.textContent =
    treeText;

  /*
   * 後続機能で利用できるよう、
   * 現在のツリーを保持する。
   */
  window.sokuFileTree = tree;

  window.sokuFileTreeStats = {
    fileCount,
    folderCount
  };

  return tree;
}


/**
 * 現在の入力ファイルから
 * ファイルツリーを生成する。
 */
function renderCurrentFileTree() {
  return renderFileTree(
    window.sokuInputFiles || []
  );
}


/*
 * 機能01・02の処理後に
 * ファイルツリーを自動更新するため、
 * CustomEventを監視する。
 *
 * 既存機能を直接変更せず、
 * 機能間の接続をイベントで行う。
 */
window.addEventListener(
  "soku:input-updated",
  () => {
    renderCurrentFileTree();
  }
);


/*
 * 初期状態ですでに
 * ファイルが存在する場合にも対応。
 */
if (
  Array.isArray(
    window.sokuInputFiles
  ) &&
  window.sokuInputFiles.length > 0
) {
  renderCurrentFileTree();
}


export {
  buildFileTree,
  renderFileTree,
  renderCurrentFileTree,
  countFiles,
  countFolders
};
