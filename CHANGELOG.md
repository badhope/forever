# 变更日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划添加
- GitHub Pages 项目介绍页面
- CI/CD 自动化流程
- 更多单元测试覆盖
- 性能优化和监控

### 计划变更
- 优化插件系统的事件处理机制
- 改进文件归档的智能分类算法

## [0.1.0] - 2026-06-12

### 新增
- **后端核心功能**
  - FastAPI 异步 Web 框架搭建
  - SQLAlchemy 2.0 异步数据库 ORM
  - SQLite 数据库初始化和管理
  - 配置管理系统（Pydantic Settings）
  
- **核心业务模块**
  - LLM 统一调度模块（支持 OpenAI 和 Ollama）
  - Git 仓库管理模块（克隆、提交、拉取、状态查询）
  - 文件自动归档模块（分类、扫描、搜索）
  - 上下文管理模块（对话历史管理）
  
- **API 接口**
  - 文件管理 API（CRUD、扫描、归档）
  - Git 操作 API（clone、commit、pull、status）
  - 插件管理 API（加载、卸载、发现）
  - 健康检查接口
  
- **插件系统**
  - 基于 pluggy 的插件架构
  - 钩子规范定义（文件创建、Git 提交等）
  - 插件管理器（加载、卸载、发现）
  - 示例插件实现
  
- **工具模块**
  - 参数校验工具
  - 日志管理工具
  
- **桌面端**
  - Electron 项目结构搭建
  - React 18 + TypeScript 配置
  - Ant Design 5 集成
  - 数字人组件（Ready Player Me）
  - 基础页面组件（Home、Settings、Plugins）
  
- **测试**
  - 47 个单元测试全部通过
  - API 集成测试
  - 插件系统测试
  - Git 操作测试
  - LLM 调度测试
  
- **文档**
  - README.md - 项目介绍和快速开始
  - ARCHITECTURE.md - 系统架构说明
  - CONTRIBUTING.md - 开发贡献指南
  - .env.example - 环境变量配置示例

### 技术栈
- Python 3.11+
- FastAPI
- SQLAlchemy 2.0
- langchain-core
- pygit2
- pluggy
- Electron 28+
- React 18
- TypeScript
- Ant Design 5

[未发布]: https://github.com/badhope/forever/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/badhope/forever/releases/tag/v0.1.0
