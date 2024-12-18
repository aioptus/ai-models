# ruff: noqa: F401 F403 F405

from importlib.metadata import version as importlib_version

from aioptus._eval.eval import eval, eval_async, eval_retry, eval_retry_async
from aioptus._eval.evalset import eval_set
from aioptus._eval.list import list_tasks
from aioptus._eval.registry import task
from aioptus._eval.score import score, score_async
from aioptus._eval.task import Epochs, Task, TaskInfo, Tasks
from aioptus._util.constants import PKG_NAME

__version__ = importlib_version(PKG_NAME)


__all__ = [
    "__version__",
    "eval",
    "eval_async",
    "eval_retry",
    "eval_retry_async",
    "eval_set",
    "list_tasks",
    "score",
    "score_async",
    "Epochs",
    "Task",
    "TaskInfo",
    "Tasks",
    "task",
]
