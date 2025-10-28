# Vite + React + DuckDB-WASM Template

## 概要

このプロジェクトは、[Vite](https://vitejs.dev/)、[React](https://react.dev/)、そして[DuckDB-WASM](https://duckdb.org/docs/api/wasm.html)を組み合わせた開発テンプレートです。
ブラウザ上でDuckDBを直接利用し、大規模なデータセット（例: Parquetファイル）を高速に読み込んで分析し、[deck.gl](https.deck.gl/)を使って地図上に可視化するサンプルアプリケーションが含まれています。

DuckDBの[Spatial Extension](https://duckdb.org/docs/extensions/spatial)を利用して、地理空間データを扱う具体例も示しています。

## 特徴

*   **高速な開発体験**: ViteによるHMR (Hot Module Replacement)
*   **モダンなUI**: ReactによるコンポーネントベースのUI構築
*   **ブラウザ内データベース**: DuckDB-WASMを使い、サーバーレスでデータ分析を実行
*   **地理空間データの可視化**: Parquet形式の警察署データを読み込み、deck.glで地図上に表示
*   **拡張性**: DuckDBの拡張機能（Spatial Extension）を簡単に利用可能

## セットアップと実行

### 1. テンプレートの使用

このリポジトリをテンプレートとして使用し、新しいリポジトリを作成してください。

### 2. パッケージのインストール

作成したリポジトリをクローンし、依存関係をインストールします。

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
npm install
```

### 3. 開発サーバーの起動

以下のコマンドで開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:5173` (デフォルト) にアクセスすると、サンプルアプリケーションが表示されます。

## 使い方

### サンプルデータ

サンプルとして、警察署の位置情報を含むParquetファイルが `public/data/parquet_police_station.parquet` に配置されています。

### コードの構成

*   `src/App.jsx`: DuckDBの初期化、データ読み込み、deck.glのレイヤー設定など、主要なロジックが記述されています。
*   `public/data/`: 静的なデータファイルを配置するディレクトリです。ここに独自のParquetファイルなどを配置できます。

### 独自のデータを使うには

1.  `public/data/` ディレクトリにデータファイル（例: `my_data.parquet`）を配置します。
2.  `src/App.jsx` 内のファイルパスを、配置したファイル名に変更します。
    ```javascript
    // src/App.jsx
    const PARQUET_URL = '/data/my_data.parquet'; 
    ```
3.  データのスキーマに合わせて、SQLクエリやdeck.glのレイヤー設定を調整してください。

## DuckDB-WASM

DuckDB-WASMは、DuckDBをWebAssemblyにコンパイルしたもので、ブラウザ上で直接SQLクエリを実行できる強力なツールです。

詳細は公式ドキュメントを参照してください。
*   [DuckDB-WASM Documentation](https://duckdb.org/docs/api/wasm.html)
*   [Available Extensions for DuckDB-WASM](https://shell.duckdb.org/extensions.html)

## ライセンス

このテンプレートはMITライセンスです。