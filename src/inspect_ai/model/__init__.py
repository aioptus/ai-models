# ruff: noqa: F401 F403 F405

from aioptus._util.content import Content, ContentImage, ContentText
from aioptus._util.deprecation import relocated_module_attribute

from ._cache import (
    CachePolicy,
    cache_clear,
    cache_list_expired,
    cache_path,
    cache_prune,
    cache_size,
)
from ._call_tools import call_tools
from ._chat_message import (
    ChatMessage,
    ChatMessageAssistant,
    ChatMessageSystem,
    ChatMessageTool,
    ChatMessageUser,
)
from ._generate_config import GenerateConfig, GenerateConfigArgs
from ._model import (
    Model,
    ModelAPI,
    ModelName,
    get_model,
)
from ._model_output import (
    ChatCompletionChoice,
    Logprob,
    Logprobs,
    ModelOutput,
    ModelUsage,
    StopReason,
    TopLogprob,
)
from ._providers.providers import *
from ._registry import modelapi

__all__ = [
    "GenerateConfig",
    "GenerateConfigArgs",
    "CachePolicy",
    "ContentText",
    "ContentImage",
    "Content",
    "ChatMessage",
    "ChatMessageSystem",
    "ChatMessageUser",
    "ChatMessageAssistant",
    "ChatMessageTool",
    "ChatCompletionChoice",
    "ModelOutput",
    "Logprobs",
    "Logprob",
    "TopLogprob",
    "Model",
    "ModelAPI",
    "ModelName",
    "ModelUsage",
    "StopReason",
    "call_tools",
    "cache_clear",
    "cache_list_expired",
    "cache_path",
    "cache_prune",
    "cache_size",
    "get_model",
    "modelapi",
]

_TOOL_MODULE_VERSION = "0.3.18"
_REMOVED_IN = "0.4"
relocated_module_attribute(
    "ToolCall", "aioptus.tool.ToolCall", _TOOL_MODULE_VERSION, _REMOVED_IN
)
relocated_module_attribute(
    "ToolChoice", "aioptus.tool.ToolChoice", _TOOL_MODULE_VERSION, _REMOVED_IN
)
relocated_module_attribute(
    "ToolFunction", "aioptus.tool.ToolFunction", _TOOL_MODULE_VERSION, _REMOVED_IN
)
relocated_module_attribute(
    "ToolParam", "aioptus.tool.ToolParam", _TOOL_MODULE_VERSION, _REMOVED_IN
)
relocated_module_attribute(
    "ToolInfo", "aioptus.tool.ToolInfo", _TOOL_MODULE_VERSION, _REMOVED_IN
)
