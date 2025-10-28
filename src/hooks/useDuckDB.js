import { useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';

/**
 * DuckDB-WASMの非同期初期化処理を行います。
 * 必要なWASMバンドルを選択し、ワーカーを生成して、
 * DuckDBの非同期インスタンスを生成・初期化します。
 * @returns {Promise<duckdb.AsyncDuckDB>} 初期化されたDuckDBインスタンス
 */
async function initDB() {
  // DuckDB-WASMのバンドル情報をJSDelivrから取得
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  // 最適なバンドルを自動選択（ブラウザの機能に応じて `mvp` または `eh` を選択）
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
  
  // DuckDBのメイン処理を実行するWeb Workerを作成
  const worker = await duckdb.createWorker(bundle.mainWorker);
  // ログ出力用のロガーを作成（コンソールに出力）
  const logger = new duckdb.ConsoleLogger();
  // 非同期版のDuckDBインスタンスを作成
  const db = new duckdb.AsyncDuckDB(logger, worker);
  
  // WASMモジュールとpthreadワーカーを使ってインスタンスを初期化
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  return db;
}

/**
 * Reactアプリケーション内でDuckDBインスタンスを管理するためのカスタムフック。
 * コンポーネントのマウント時にDuckDBを非同期で初期化し、
 * そのインスタンス、ローディング状態、エラー情報をコンポーネントに提供します。
 * @returns {{db: duckdb.AsyncDuckDB | null, loading: boolean, error: string | null}}
 */
export function useDuckDB() {
  // DuckDBインスタンスを保持するstate
  const [db, setDb] = useState(null);
  // エラー情報を保持するstate
  const [error, setError] = useState(null);
  // 初期化処理中のローディング状態を保持するstate
  const [loading, setLoading] = useState(true);

  // コンポーネントのマウント時に一度だけ実行される副作用
  useEffect(() => {
    // 非同期の即時実行関数で初期化処理を呼び出す
    (async () => {
      try {
        // initDBを呼び出してDuckDBインスタンスを取得
        const dbInstance = await initDB();
        // 取得したインスタンスをstateにセット
        setDb(dbInstance);
      } catch (e) {
        // エラーが発生した場合はエラー情報をstateにセット
        setError(e.toString());
        console.error(e);
      } finally {
        // 処理が成功しても失敗しても、ローディング状態を解除
        setLoading(false);
      }
    })();
  }, []); // 空の依存配列なので、マウント時に一度だけ実行される

  // 管理しているDBインスタンス、ローディング状態、エラーを返す
  return { db, loading, error };
}
