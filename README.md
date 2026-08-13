# じょすうし ふらっしゅ とれーにんぐ

日本語学習者向けの、助数詞と時間表現を練習するブラウザーアプリです。教室での投影と、1台の端末での利用を想定しています。

## 公開ページ

https://testeste55555.github.io/counters_training_Japanese/

## 使い方

- ビルドやインストールは不要です。
- 公開版は `docs/index.html` です。
- オフライン利用では、`docs` フォルダー全体を保存して `index.html` を開いてください。
- 外部CDN・外部API・アクセス解析は使用していません。

## ファイル構成

- `docs/index.html`: 画面構造
- `docs/css/app.css`: レイアウトと装飾
- `docs/js/data.js`: 助数詞・語彙・読み方
- `docs/js/randomizer.js`: 偏りを抑えた出題順
- `docs/js/app.js`: 画面操作・音声・進行

## 更新方法

変更する役割に対応したファイルを更新し、`main` ブランチへコミットしてください。GitHub Pagesは `main` ブランチの `/docs` から公開します。

## 公開リポジトリでの注意

認証情報、APIキー、個人情報、学習者データはコミットしないでください。
