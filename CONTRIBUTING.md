# 开发环境配置

## 环境要求

- Python 3.11+
- Node.js 18+
- Git

## 后端开发

### 安装依赖

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -e ".[dev]"
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填写你的配置
```

### 运行测试

```bash
pytest -v
```

### 启动服务

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 代码质量

```bash
# 格式化代码
black app/ tests/

# 检查代码
ruff check app/ tests/

# 类型检查
mypy app/
```

## 桌面端开发

### 安装依赖

```bash
cd desktop
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
# 构建当前平台
npm run build

# 构建 Windows
npm run build:win

# 构建 macOS
npm run build:mac

# 构建 Linux
npm run build:linux
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

## 提交规范

我们使用 Conventional Commits 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat: 添加文件自动归档功能
fix: 修复 Git 提交失败的问题
docs: 更新 README 文档
```
