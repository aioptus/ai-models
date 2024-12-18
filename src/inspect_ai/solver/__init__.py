from aioptus._util.deprecation import relocated_module_attribute

from ._basic_agent import basic_agent
from ._chain import chain
from ._critique import self_critique
from ._fork import fork
from ._multiple_choice import MultipleChoiceTemplate, multiple_choice
from ._plan import Plan, plan
from ._prompt import (
    chain_of_thought,
    prompt_template,
    system_message,
)
from ._solver import Generate, Solver, SolverSpec, generate, solver
from ._task_state import Choice, Choices, TaskState
from ._use_tools import use_tools

__all__ = [
    "basic_agent",
    "chain",
    "fork",
    "generate",
    "prompt_template",
    "chain_of_thought",
    "multiple_choice",
    "system_message",
    "self_critique",
    "use_tools",
    "plan",
    "Plan",
    "Solver",
    "SolverSpec",
    "solver",
    "Choice",
    "Choices",
    "TaskState",
    "Generate",
    "MultipleChoiceTemplate",
]


_TOOL_MODULE_VERSION_3_18 = "0.3.18"
_TOOL_MODULE_VERSION_3_19 = "0.3.19"
_SUBTASKS_MODULE_VERSION = "0.3.26"
_REMOVED_IN = "0.4"
relocated_module_attribute(
    "Tool", "aioptus.tool.Tool", _TOOL_MODULE_VERSION_3_18, _REMOVED_IN
)
relocated_module_attribute(
    "ToolEnvironment",
    "aioptus.util.SandboxEnvironment",
    _TOOL_MODULE_VERSION_3_18,
    _REMOVED_IN,
)
relocated_module_attribute(
    "ToolEnvironments",
    "aioptus.util.SandboxEnvironments",
    _TOOL_MODULE_VERSION_3_18,
    _REMOVED_IN,
)
relocated_module_attribute(
    "ToolEnvironmentSpec",
    "aioptus.util.SandboxEnvironmentSpec",
    _TOOL_MODULE_VERSION_3_18,
    _REMOVED_IN,
)
relocated_module_attribute(
    "ToolError", "aioptus.tool.ToolError", _TOOL_MODULE_VERSION_3_18, _REMOVED_IN
)
relocated_module_attribute(
    "ToolResult", "aioptus.tool.ToolResult", _TOOL_MODULE_VERSION_3_18, _REMOVED_IN
)
relocated_module_attribute(
    "tool", "aioptus.tool.tool", _TOOL_MODULE_VERSION_3_18, _REMOVED_IN
)
relocated_module_attribute(
    "tool_environment",
    "aioptus.util.sandbox",
    _TOOL_MODULE_VERSION_3_18,
    _REMOVED_IN,
)
relocated_module_attribute(
    "toolenv", "aioptus.util.sandboxenv", _TOOL_MODULE_VERSION_3_18, _REMOVED_IN
)
relocated_module_attribute(
    "bash", "aioptus.tool.bash", _TOOL_MODULE_VERSION_3_19, _REMOVED_IN
)
relocated_module_attribute(
    "python", "aioptus.tool.python", _TOOL_MODULE_VERSION_3_19, _REMOVED_IN
)
relocated_module_attribute(
    "web_search", "aioptus.tool.web_search", _TOOL_MODULE_VERSION_3_19, _REMOVED_IN
)
relocated_module_attribute(
    "Transcript",
    "aioptus.log.Transcript",
    _SUBTASKS_MODULE_VERSION,
    _REMOVED_IN,
)
relocated_module_attribute(
    "transcript",
    "aioptus.log.transcript",
    _SUBTASKS_MODULE_VERSION,
    _REMOVED_IN,
)
relocated_module_attribute(
    "Store",
    "aioptus.util.Store",
    _SUBTASKS_MODULE_VERSION,
    _REMOVED_IN,
)
relocated_module_attribute(
    "store",
    "aioptus.util.store",
    _SUBTASKS_MODULE_VERSION,
    _REMOVED_IN,
)
relocated_module_attribute(
    "Subtask",
    "aioptus.util.Subtask",
    _SUBTASKS_MODULE_VERSION,
    _REMOVED_IN,
)
relocated_module_attribute(
    "subtask",
    "aioptus.util.subtask",
    _SUBTASKS_MODULE_VERSION,
    _REMOVED_IN,
)
