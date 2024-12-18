from aioptus._util.content import Content, ContentImage, ContentText
from aioptus._util.deprecation import relocated_module_attribute

from ._tool import Tool, ToolError, ToolResult, tool
from ._tool_call import (
    ToolCall,
    ToolCallContent,
    ToolCallError,
    ToolCallView,
    ToolCallViewer,
)
from ._tool_choice import ToolChoice, ToolFunction
from ._tool_def import ToolDef
from ._tool_info import ToolInfo
from ._tool_params import ToolParam, ToolParams
from ._tool_with import tool_with
from ._tools._execute import bash, python
from ._tools._web_browser import web_browser
from ._tools._web_search import web_search

__all__ = [
    "bash",
    "python",
    "web_browser",
    "web_search",
    "tool",
    "tool_with",
    "Tool",
    "ToolCallError",
    "ToolError",
    "ToolResult",
    "Content",
    "ContentImage",
    "ContentText",
    "ToolCall",
    "ToolCallContent",
    "ToolCallView",
    "ToolCallViewer",
    "ToolChoice",
    "ToolDef",
    "ToolFunction",
    "ToolInfo",
    "ToolParam",
    "ToolParams",
]

_UTIL_MODULE_VERSION = "0.3.19"
_REMOVED_IN = "0.4"


relocated_module_attribute(
    "ToolEnvironment",
    "aioptus.util.SandboxEnvironment",
    _UTIL_MODULE_VERSION,
    _REMOVED_IN,
)
relocated_module_attribute(
    "ToolEnvironments",
    "aioptus.util.SandboxEnvironments",
    _UTIL_MODULE_VERSION,
    _REMOVED_IN,
)
relocated_module_attribute(
    "ToolEnvironmentSpec",
    "aioptus.util.SandboxEnvironmentSpec",
    _UTIL_MODULE_VERSION,
    _REMOVED_IN,
)
relocated_module_attribute(
    "tool_environment",
    "aioptus.util.sandbox",
    _UTIL_MODULE_VERSION,
    _REMOVED_IN,
)
relocated_module_attribute(
    "toolenv", "aioptus.util.sandboxenv", _UTIL_MODULE_VERSION, _REMOVED_IN
)
relocated_module_attribute(
    "web_browser_tools",
    "aioptus.tool.web_browser",
    "0.3.19",
    _REMOVED_IN,
)