# 2026-04-13 Notion連携セットアップログ

## 何をしたか
- Claude Code で、Notion連携が使えるか確認した
- 最初は Notion連携（MCP）が入っていなかった
- Notion 公式 MCP を追加した
- Claude Code 内で認証を進めた
- Notion との接続に成功した
- 最後に、Notion のページを読めるか確認した

## 実際にやった手順
### 1. Notion MCP を追加
以下のコマンドを実行した

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

### 2. Claude Code 内で `/mcp` を実行
- ここで Notion の認証画面に進んだ
- `/mcp` は普通のターミナルではなく、Claude Code の中で使うコマンド

### 3. Notion で認証
- ブラウザで Notion の認証を進めた
- 認証後、以下の表示を確認した

Authentication successful. Connected to notion.

### 4. 読み取り確認
- Claude Code から Notion のページを検索した
- 学習ログページが見えたので、連携成功と確認できた

## 今回わかったこと
- Notion連携は、最初から入っているわけではない
- まず MCP を追加して、その後に認証が必要
- `/mcp` は Claude Code 内専用コマンド
- 連携後はいきなり書き込みではなく、まず読み取り確認をすると安全
- 連携が成功すると、Claude Code から Notion ページを検索できる

## 詰まりやすいポイント
- `/mcp` を普通のターミナルで打つと動かない
- MCP を追加しただけではまだ使えない
- Notion 側の認証まで終わって、はじめて使える
- 連携がうまくいかないときは、Claude Code の再起動も候補

## ひとこと
今日は、Claude Code と Notion をつなぐ準備ができた。
今後は、Notion のページを読むだけでなく、書き込みまで自動化できる可能性がある。
