# Forever 永生项目 - 技术选型调研报告

## 调研日期
2025年5月13日

---

## 一、语音方案

### 1.1 推荐方案：Chatterbox TTS

**GitHub:** https://github.com/resemble-ai/chatterbox

**核心优势：**
- ✅ 首个支持情感夸张控制的开源TTS模型
- ✅ 0.5B参数，推理延迟<200ms
- ✅ 23种语言支持，中文MOS评分4.2
- ✅ 5秒音频零样本克隆
- ✅ MIT许可证，可商用

**关键参数：**
```python
exaggeration=0.5  # 情感强度 0.0-1.0
cfg_weight=0.5     # 分类器自由引导权重
temperature=0.7    # 采样温度
```

**情感配置参考：**
| 场景 | exaggeration | cfg_weight |
|------|-------------|------------|
| 日常对话 | 0.3-0.5 | 0.5-0.7 |
| 关心叮嘱 | 0.6 | 0.4 |
| 回忆往事 | 0.4 | 0.6 |
| 激动/责备 | 0.7+ | 0.3 |

**安装：**
```bash
pip install chatterbox-tts
```

### 1.2 备用方案：GPT-SoVITS
- 中文语音克隆效果最佳
- 需要10秒参考音频
- 适合已有高质量录音的情况

---

## 二、记忆方案

### 2.1 推荐方案：Mem0

**GitHub:** https://github.com/mem0ai/mem0

**核心优势：**
- ✅ 专为AI Agent设计的记忆层
- ✅ 多级记忆：用户/会话/Agent状态
- ✅ 向量+图数据库双存储架构
- ✅ <50ms检索延迟
- ✅ LOCOMO基准比OpenAI Memory高26%准确率

**核心API：**
```python
from mem0 import Memory

memory = Memory()

# 添加记忆
memory.add(messages, user_id="user123")

# 检索记忆
results = memory.search(query, user_id="user123", limit=3)

# 获取所有记忆
all_memories = memory.get_all(user_id="user123")
```

**安装：**
```bash
pip install mem0ai
```

### 2.2 向量数据库备选
- **Chroma**: 轻量级，适合本地部署
- **Milvus Lite**: 高性能，支持大规模数据

---

## 三、头像方案

### 3.1 推荐方案：SadTalker

**GitHub:** https://github.com/OpenTalker/SadTalker

**核心优势：**
- ✅ 单张照片+音频生成说话视频
- ✅ 3D运动系数，表情自然
- ✅ 支持全身图像动画
- ✅ CVPR 2023论文背书
- ✅ Apache 2.0许可证

**使用方式：**
```bash
python inference.py \
  --driven_audio audio.wav \
  --source_image photo.png \
  --enhancer gfpgan \
  --expression_scale 1.0
```

**参数说明：**
- `enhancer`: 面部增强(gfpgan)
- `expression_scale`: 表情强度(1.0-1.5)
- `preprocess`: 预处理模式(crop/full)
- `still`: 静止模式(减少头部运动)

### 3.2 进阶方案：Live2D

**官网:** https://www.live2d.com/sdk/about/

**适用场景：**
- 需要长期交互的虚拟形象
- 游戏化/动漫风格角色
- 实时口型同步

**技术栈：**
- Cubism Web Framework
- pixi-live2d-display
- 需要专业模型制作

---

## 四、技术选型总结

| 模块 | 首选方案 | 备选方案 | 选型理由 |
|------|----------|----------|----------|
| 语音合成 | Chatterbox | GPT-SoVITS | 情感控制+零样本克隆 |
| 记忆系统 | Mem0 | Chroma | 专为Agent设计+多级记忆 |
| 数字人 | SadTalker | Live2D | 照片驱动+快速部署 |
| LLM | DeepSeek | OpenAI | 中文优化+成本优势 |
| 向量存储 | Chroma | Milvus Lite | 轻量本地优先 |

---

## 五、集成架构

```
┌─────────────────────────────────────────┐
│           Forever Core Engine           │
│         (LangChain + LangGraph)         │
├─────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌───────────┐  │
│  │ Chatter │ │  Mem0   │ │ SadTalker │  │
│  │  box    │ │ Memory  │ │  Avatar   │  │
│  │ Plugin  │ │ Plugin  │ │  Plugin   │  │
│  └────┬────┘ └────┬────┘ └─────┬─────┘  │
│       └───────────┴────────────┘        │
│              Plugin Manager             │
└─────────────────────────────────────────┘
```

---

## 六、下一步行动

1. **下载并测试Chatterbox** - 验证中文情感合成效果
2. **集成Mem0** - 搭建记忆存储与检索流程
3. **封装SadTalker** - 创建照片驱动视频生成服务
4. **开发Plugin Manager** - 实现插件注册与调用机制
5. **整合LangGraph** - 构建完整的智能体工作流
