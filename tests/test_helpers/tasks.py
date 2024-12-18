from aioptus import Task, task
from aioptus.dataset import Sample
from aioptus.scorer import includes
from aioptus.solver import generate, use_tools
from aioptus.tool import Tool


@task
def empty_task() -> Task:
    return Task()


@task
def minimal_task() -> Task:
    return Task(
        dataset=[Sample(input="What is 1+1?", target="2")],
        solver=[generate()],
        scorer=includes(),
        metadata={"task_idx": 1},
    )


@task
def minimal_task_for_tool_use(tool: Tool) -> Task:
    return Task(
        dataset=[Sample(input="Please use the tool", target="n/a")],
        solver=[use_tools(tool), generate()],
        scorer=includes(),
        metadata={"task_idx": 1},
        message_limit=3,
        sandbox="docker",
    )
