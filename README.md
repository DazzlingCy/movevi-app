<div align="center">
  <img src="./public/splash.png" alt="MOVEVI 木卫六——把世界装进跑步机" width="260" />

  # MOVEVI 木卫六

  **把世界装进跑步机**

  一款以世界城市探索为主题的沉浸式跑步应用，让每次运动都成为一段可收集、可回顾、可分享的城市旅程。

  [在线预览](https://dazzlingcy.github.io/movevi-app/)
</div>

## 项目简介

MOVEVI 将跑步数据与城市路线、地标勋章和收藏体系结合。用户可以选择城市路线开始运动，在完成路线的过程中解锁沿途景点勋章；完成一座城市的全部路线后，还能获得专属城市卡片。

项目目前为移动端体验原型，使用前端演示数据呈现完整的探索、运动和收藏流程。

## 核心功能

- **世界城市探索**：通过交互式地球选择城市，体验不同城市的主题路线。
- **城市图鉴**：集中展示城市卡片、路线进度和景点勋章，清晰区分已收集与待解锁内容。
- **运动体验**：提供路线详情、跑步过程、完成反馈和运动数据回顾。
- **路线回忆**：记录完成时间、里程、配速、热量和沿途勋章，保存每次城市跑步记忆。
- **分享图片**：生成适合手机查看的 1080 × 1920 票券式路线回忆图片。
- **光迹值体系**：完成路线和城市收集可获得光迹值，切换城市时消耗光迹值。
- **个人中心**：包含运动记录、设备、钱包、账户设置及其他个人功能入口。

## 技术栈

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Motion
- Three.js / React Globe GL
- Lucide React

## 本地运行

### 环境要求

- Node.js 20 或更高版本
- npm

### 启动开发环境

```bash
npm install
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000)。

### 类型检查

```bash
npm run lint
```

### 生产构建

```bash
npm run build
npm run preview
```

构建产物会输出到 `dist` 目录。

## 部署

项目使用 GitHub Actions 构建并发布到 GitHub Pages。推送到 `main` 分支后，部署工作流会自动运行。

在线地址：<https://dazzlingcy.github.io/movevi-app/>

## 项目状态

当前版本聚焦中文移动端体验与核心流程验证，所有用户、运动和收藏数据均为前端演示数据，暂未接入后端持久化服务。
