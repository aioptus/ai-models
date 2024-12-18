from aioptus import Task, task
from aioptus.dataset import Sample
from aioptus.scorer import includes
from aioptus.solver import generate, use_tools
from aioptus.tool import web_browser


@task
def browser():
    return Task(
        dataset=[
            Sample(
                input=""
            )
        ],
        solver=[
            use_tools(web_browser()),
            generate(),
        ],
        scorer=includes(),
        sandbox="docker",
    )
