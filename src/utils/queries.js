/**
 * DuckDBインスタンスを使用してSQLクエリを実行し、
 * 結果をApache Arrow形式のテーブルとして返します。
 * @param {import('@duckdb/duckdb-wasm').AsyncDuckDB} db - 初期化済みのDuckDBインスタンス
 * @param {string} sqlQuery - 実行するSQLクエリ
 * @returns {Promise<import('apache-arrow').Table|null>} Apache ArrowのTableオブジェクト、またはエラー時や入力がない場合はnull
 */
export async function executeQuery(db, sqlQuery) {
  // DBインスタンスまたはクエリがなければ何もせずnullを返す
  if (!db || !sqlQuery) return null;

  // DBへの新しい接続を確立
  const conn = await db.connect();

  try {
    // --- 拡張機能のロード ---
    // httpfsとspatial拡張機能をインストール・ロード
    await conn.query("INSTALL httpfs;");
    await conn.query("LOAD httpfs;");
    await conn.query("INSTALL spatial;");
    await conn.query("LOAD spatial;");

    // --- クエリの実行 ---
    // 引数で受け取ったSQLクエリを実行し、結果をそのまま返す
    const result = await conn.query(sqlQuery);
    return result;

  } finally {
    // --- 接続のクローズ ---
    // 処理が成功してもエラーが発生しても、必ず接続を閉じる
    await conn.close();
  }
}