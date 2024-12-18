from aioptus import Task, task
from aioptus.dataset import Sample
from aioptus.scorer import exact
from aioptus.solver import generate

# This is the simplest possible aioptus eval, useful for testing your configuration / network / platform etc.


@task
def hello_world():
    return Task(
        dataset=[
            Sample(
                input="Just reply with Hello World",
                target="Hello World",
            )
        ],
        solver=[
            generate(),
        ],
        scorer=exact(),
    )
