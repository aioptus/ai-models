from test_helpers.utils import file_check

from aioptus import Task, task
from aioptus.dataset import Sample
from aioptus.scorer import includes
from aioptus.solver import generate


@task
def task1():
    return Task(
        dataset=[Sample(input="What is 1+1?", target="2")],
        solver=[file_check("task1.py"), generate()],
        scorer=includes(),
        metadata={"task_idx": 1},
    )
