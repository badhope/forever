# Forever - AI 开发助手

一个高度自定义的 AI 开发助手智能体，支持开发资料自动整理、Git 仓库自主管理、桌面端数字人交互，具备插件扩展能力。

## 特性

- 🤖 **统一大模型调度**: 支持 OpenAI 和 Ollama，灵活切换云端和本地模型
- 📁 **文件自动归档**: 智能分类和整理开发文件
- 🔧 **Git 仓库管理**: 自动化克隆、提交、拉取等操作
- 🔌 **插件系统**: 基于 pluggy 的可扩展架构
- 💻 **桌面应用**: Electron + React + Ant Design 现代化界面
- 🎭 **数字人交互**: 集成 Ready Player Me 3D 数字人

## 技术栈

### 后端
- Python 3.11+
- FastAPI (异步 Web 框架)
- SQLAlchemy 2.0 (异步 ORM)
- langchain-core (LLM 统一调度)
- pygit2 (Git 操作)
- pluggy (插件系统)

### 前端
- Electron 28+
- React 18
- TypeScript
- Ant Design 5
- Ready Player Me

## 快速开始

### 后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -e ".[dev]"

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置你的 API Key

# 运行测试
pytest -v

# 启动服务
uvicorn app.main:app --reload
```

### 桌面端

```bash
cd desktop

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 项目结构

```
.
├── backend/              # Python 后端
│   ├── app/
│   │   ├── api/         # API 路由
│   │   ├── core/        # 核心业务逻辑
│   │   ├── models/      # 数据模型
│   │   ├── plugins/     # 插件系统
│   │   └── utils/       # 工具函数
│   └── tests/           # 测试文件
└── desktop/             # Electron 桌面端
    └── src/
        ├── main/        # 主进程
        ├── renderer/    # 渲染进程
        └── preload/     # 预加载脚本
```

## API 文档

启动后端服务后，访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 配置说明

在 `backend/.env` 中配置：

```env
# 大模型配置
LLM_PROVIDER=openai  # 或 ollama
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# Ollama 配置（如果使用本地模型）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## 开发

```bash
# 运行所有测试
cd backend && pytest -v

# 代码格式化
black app/ tests/

# 代码检查
ruff check app/ tests/
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
