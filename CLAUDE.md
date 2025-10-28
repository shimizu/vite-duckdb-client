# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Vite + React + DuckDB-WASMテンプレート。ブラウザ上でDuckDBを直接利用し、大規模なデータセット（Parquetファイル）を高速に読み込んで分析し、deck.glを使って地図上に可視化するアプリケーション。

## よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# ESLintによるコード検証
npm run lint
```

## アーキテクチャ

### ディレクトリ構造

- `src/App.jsx`: メインアプリケーション - DuckDB初期化、データ読み込み、deck.glレイヤー設定
- `src/hooks/useDuckDB.js`: DuckDB-WASMインスタンス管理のカスタムフック
- `src/utils/queries.js`: SQLクエリ実行とDuckDB拡張機能ロード処理
- `src/Layers/`: deck.gl地図レイヤー設定
- `src/components/`: React UIコンポーネント (ResultTable.jsx等)
- `public/data/`: 静的データファイル (Parquetファイル等)

### 技術スタック

- **フロントエンド**: React 19.2 + Vite
- **データベース**: DuckDB-WASM + httpfs/spatial拡張機能
- **地図可視化**: deck.gl
- **データ形式**: Apache Arrow, Parquet
- **開発ツール**: ESLint, vite-plugin-wasm

### データフロー

1. `useDuckDB()` フックでDuckDB-WASMインスタンスを初期化
2. `executeQuery()` でSQLクエリ実行（httpfs/spatial拡張機能含む）
3. Apache Arrow Tableとして結果を取得
4. GeoJSONに変換してdeck.glレイヤーに渡す
5. 結果をテーブルと地図の両方で表示

### 重要な設定

- **Vite設定**: WebAssembly対応 (`vite-plugin-wasm`)
- **ChunkSize制限**: 1600KB (DuckDB-WASMのサイズ対応)
- **Manual Chunks**: react, deck.gl関連ライブラリを分離
- **初期位置**: 東京駅周辺 (lat: 35.681236, lng: 139.767125)

## 開発時の注意点

- DuckDBの拡張機能（httpfs, spatial）は各クエリ実行時に自動ロードされる
- GeoJSONデータはArrow Tableから変換される (`createGeoJsonFromTable()`)
- Parquetファイルは`public/data/`に配置し、HTTPSアクセスまたはローカルパスで読み込み可能
- SQL内で`ST_AsGeoJSON(geometry)`を使用して地理データをGeoJSON形式で取得