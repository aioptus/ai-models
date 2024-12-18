from aioptus import Task, task
from aioptus.dataset import Sample
from aioptus.scorer import match


@task
def example_task() -> Task:
    task = Task(
        dataset=[Sample(input="Say Hello", target="Hello")],
        scorer=match(),
        metadata={"meaning_of_life": 42},
    )
    return task
