import pytest
from test_helpers.tasks import minimal_task_for_tool_use
from test_helpers.tool_call_utils import get_tool_call, get_tool_response
from test_helpers.utils import skip_if_no_docker

from aioptus import Task, eval
from aioptus.dataset import Sample
from aioptus.model import ModelOutput, get_model
from aioptus.scorer import includes
from aioptus.solver import generate, use_tools
from aioptus.tool import bash


@skip_if_no_docker
@pytest.mark.slow
def test_bash_simple_echo() -> None:
    task = minimal_task_for_tool_use(bash())
    result = eval(
        task,
        model=get_model(
            "mockllm/model",
            custom_outputs=[
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name=bash.__name__,
                    tool_arguments={"cmd": "echo 'testing bash tool'"},
                ),
            ],
        ),
    )[0]
    assert result.samples
    messages = result.samples[0].messages
    tool_call = get_tool_call(messages, bash.__name__)
    assert tool_call is not None
    tool_call_response = get_tool_response(messages, tool_call)
    assert tool_call_response is not None
    assert tool_call_response.content == "testing bash tool\n"


@skip_if_no_docker
@pytest.mark.slow
def test_bash_profile() -> None:
    tool_task = Task(
        dataset=[
            Sample(
                input="Please use the tool",
                target="n/a",
                files={
                    "/etc/profile.d/test_bash_profile.sh": "export ENV_VAR=custom_value\n"
                },
            )
        ],
        solver=[use_tools(bash()), generate()],
        scorer=includes(),
        metadata={"task_idx": 1},
        message_limit=3,
        sandbox="docker",
    )
    result = eval(
        tool_task,
        model=get_model(
            "mockllm/model",
            custom_outputs=[
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name=bash.__name__,
                    tool_arguments={"cmd": "echo $ENV_VAR"},
                ),
            ],
        ),
        sandbox_cleanup=False,
    )[0]
    assert result.samples
    messages = result.samples[0].messages
    tool_call = get_tool_call(messages, bash.__name__)
    assert tool_call is not None
    tool_call_response = get_tool_response(messages, tool_call)
    assert tool_call_response is not None
    assert tool_call_response.content == "custom_value\n"
