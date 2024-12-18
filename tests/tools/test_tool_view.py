import pytest
from test_helpers.tool_call_utils import get_tool_event
from test_helpers.utils import skip_if_no_docker

from aioptus import Task, eval
from aioptus.dataset import Sample
from aioptus.model import ModelOutput, get_model
from aioptus.solver import generate, use_tools
from aioptus.tool import bash


@skip_if_no_docker
@pytest.mark.slow
def test_tool_view():
    task = Task(
        dataset=[
            Sample(
                input="Please use the bash tool to list the files in the current directory?"
            )
        ],
        solver=[use_tools(bash()), generate()],
        sandbox="docker",
    )
    log = eval(
        task,
        model=get_model(
            "mockllm/model",
            custom_outputs=[
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name="bash",
                    tool_arguments={"code": "ls ."},
                ),
                ModelOutput.from_content(model="mockllm/model", content="All done!."),
            ],
        ),
    )[0]

    event = get_tool_event(log)
    assert event.view is not None
