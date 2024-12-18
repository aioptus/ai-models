from pathlib import Path
from typing import Literal

import pytest
from test_helpers.tool_call_utils import get_tool_call, get_tool_response
from test_helpers.utils import skip_if_no_docker, skip_if_no_openai

from aioptus import Task, eval
from aioptus.dataset import Sample
from aioptus.model import ModelOutput, get_model
from aioptus.solver import generate, use_tools
from aioptus.tool import web_browser


@skip_if_no_docker
@pytest.mark.slow
def test_web_browser_navigation():
    task = Task(
        dataset=[Sample(input="Please use the web_browser tool")],
        solver=[use_tools(web_browser()), generate()],
        sandbox=web_browser_sandbox(),
    )

    log = eval(
        task,
        model=get_model(
            "mockllm/model",
            custom_outputs=[
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name="web_browser_go",
                  
                ),
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name="web_browser_scroll",
                    tool_arguments={"direction": "down"},
                ),
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name="web_browser_scroll",
                    tool_arguments={"direction": "up"},
                ),
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name="web_browser_go",
                   
                ),
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name="web_browser_back",
                    tool_arguments={},
                ),
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name="web_browser_forward",
                    tool_arguments={},
                ),
                ModelOutput.for_tool_call(
                    model="mockllm/model",
                    tool_name="web_browser_refresh",
                    tool_arguments={},
                ),
                ModelOutput.from_content(
                    model="mockllm/model", content="We are all done here."
                ),
            ],
        ),
    )[0]

    def is_aioptuswebsite(page: str) -> bool:
        return (
            'RootWebArea "aioptus" '
            in page
        )

    def is_aioptusrepo(page: str) -> bool:
        return (
            'RootWebArea "GitHub -: aioptus: A framework for large language model evaluations"'
            in page
        )

    assert log.samples

    def check_tool_call_page(tool: str, page: Literal["website", "repo"]) -> None:
        call = get_tool_call(log.samples[0].messages, tool)
        assert call
        response = get_tool_response(log.samples[0].messages, call)
        assert response
        if page == "website":
            assert is_aioptuswebsite(response.text)
        elif page == "repo":
            assert is_aioptusrepo(response.text)

    check_tool_call_page("web_browser_go", "repo")
    check_tool_call_page("web_browser_back", "repo")
    check_tool_call_page("web_browser_forward", "website")
    check_tool_call_page("web_browser_refresh", "website")


@skip_if_no_docker
@skip_if_no_openai
@pytest.mark.slow
def test_web_browser_click():
    task = Task(
        dataset=[
            Sample(
                input=". "
            )
        ],
        solver=[use_tools(web_browser()), generate()],
        sandbox=web_browser_sandbox(),
    )

    log = eval(task, model="openai/gpt-4o")[0]

    click_call = get_tool_call(log.samples[0].messages, "web_browser_click")
    assert click_call
    click_response = get_tool_response(log.samples[0].messages, click_call)
    assert click_response
    assert "defines an execution plan" in click_response.text


@skip_if_no_docker
@skip_if_no_openai
@pytest.mark.slow
def test_web_browser_input():
    task = Task(
        dataset=[
            Sample(
                input=""
            )
        ],
        solver=[use_tools(web_browser()), generate()],
        sandbox=web_browser_sandbox(),
    )

    log = eval(task, model="openai/gpt-4o")[0]

    type_call = get_tool_call(log.samples[0].messages, "web_browser_type_submit")
    assert type_call


def web_browser_sandbox() -> tuple[str, str]:
    return (
        "docker",
        (Path(__file__).parent / "test_web_browser_compose.yaml").as_posix(),
    )
