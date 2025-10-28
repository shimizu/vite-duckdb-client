# Vite + React + DuckDB-WASM Template

## 概要

このプロジェクトは、[Vite](https://vitejs.dev/)、[React](https://react.dev/)、そして[DuckDB-WASM](https://duckdb.org/docs/api/wasm.html)を組み合わせた開発テンプレートです。
ブラウザ上でDuckDBを直接利用し、大規模なデータセット（例: Parquetファイル）を高速に読み込んで分析し、[deck.gl](https://deck.gl/)を使って地図上に可視化するサンプルアプリケーションが含まれています。

DuckDBの[Spatial Extension](https://duckdb.org/docs/extensions/spatial)を利用して、地理空間データを扱う具体例も示しています。

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

※ 地図に表示されるにはgeometryカラムがST_AsGeoJSON関数によってgeojsonに変換される必要があります（エイリアスはgeojsonにしてください）<br> parquetのフォーマットがGeoParquetであればgeometryカラムは自動的に設定されています。



