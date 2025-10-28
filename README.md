# Vite + React + DuckDB-WASM Template

## 概要

このプロジェクトは、[Vite](https://vitejs.dev/)、[React](https://react.dev/)、そして[DuckDB-WASM](https://duckdb.org/docs/api/wasm.html)を組み合わせた開発テンプレートです。
ブラウザ上でDuckDBを直接利用し、大規模なデータセット（例: Parquetファイル）を高速に読み込んで分析し、[deck.gl](https://deck.gl/)を使って地図上に可視化するサンプルアプリケーションが含まれています。

DuckDBの[Spatial Extension](https://duckdb.org/docs/extensions/spatial)を利用して、地理空間データを扱う具体例も示しています。

## demo

https://shimizu.github.io/vite-duckdb-client/

## 特徴

*   **ブラウザ内データベース**: DuckDB-WASMを使い、サーバーレスでデータ分析を実行
*   **地理空間データの可視化**: リモートのParquet形式の警察署データを読み込み、deck.glで地図上に表示
*   **拡張性**: DuckDBの拡張機能（`httpfs`, `spatial`）を利用

## セットアップと実行

### 1. パッケージのインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` (デフォルト) にアクセスすると、サンプルアプリケーションが表示されます。

## 使い方

### サンプルクエリ

アプリケーションは、リモートにある警察署の位置情報を含むParquetファイルを読み込み、地図上に表示します。
デフォルトのクエリは以下の通りです。

```sql
SELECT *, ST_AsGeoJSON(geometry) as geojson FROM 'https://storage.googleapis.com/g3-open-resource/parquet/police_station2.parquet';
```

入力欄でクエリを自由に変更し、**「クエリ実行」**ボタンを押すことで、DuckDB-WASMの力を試すことができます。

※ 地図に表示されるにはgeometryカラムがST_AsGeoJSON関数によってgeojsonに変換される必要があります（エイリアスはgeojsonにしてください）<br> parquetのフォーマットがGeoParquet



## コードの構成

主要なコードは `src` ディレクトリに配置されています。

*   `main.jsx`: アプリケーションのエントリーポイント。
*   `App.jsx`: アプリケーションのメインコンポーネント。状態管理、UI、Deck.glの初期化など、全体のロジックを担います。
*   `index.css`: アプリケーション全体の基本的なスタイリング。

### `src/hooks`

*   `useDuckDB.js`: DuckDB-WASMの初期化とインスタンス管理を行うカスタムフック。これにより、どのコンポーネントからでも簡単にDuckDBインスタンスにアクセスできます。

### `src/utils`

*   `queries.js`: DuckDBのクエリ実行に関するロジックをカプセル化しています。`httpfs`や`spatial`といった必要な拡張機能の読み込みもここで行います。

### `src/components`

*   `ResultTable.jsx`: クエリ結果を画面下部に表示するためのReactコンポーネント。Apache Arrow形式のデータをテーブルとして描画します。

### `src/Layers`

*   `index.js`: Deck.glのレイヤー設定を定義します。ベースマップとしてOpenStreetMapタイルレイヤーを、データ可視化用としてGeoJsonレイヤーを生成します。

## DuckDB-WASM

DuckDB-WASMは、DuckDBをWebAssemblyにコンパイルしたもので、ブラウザ上で直接SQLクエリを実行できる強力なツールです。

詳細は公式ドキュメントを参照してください。
*   [DuckDB-WASM Documentation](https://duckdb.org/docs/api/wasm.html)
*   [Available Extensions for DuckDB-WASM](https://shell.duckdb.org/extensions.html)

## ライセンス

このテンプレートはMITライセンスです。
