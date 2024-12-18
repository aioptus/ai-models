from aioptus._util.registry import registry_log_name
from aioptus.solver._task_state import TaskState
from aioptus.tool._tool_call import ToolCall, ToolCallView

from ._approval import Approval
from ._approver import Approver


async def call_approver(
    approver: Approver,
    message: str,
    call: ToolCall,
    view: ToolCallView,
    state: TaskState | None = None,
) -> Approval:
    # run approver
    approval = await approver(message, call, view, state)

    # record
    record_approval(registry_log_name(approver), message, call, view, approval)

    # return approval
    return approval


def record_approval(
    approver_name: str,
    message: str,
    call: ToolCall,
    view: ToolCallView | None,
    approval: Approval,
) -> None:
    from aioptus.log._transcript import ApprovalEvent, transcript

    transcript()._event(
        ApprovalEvent(
            message=message,
            call=call,
            view=view,
            approver=approver_name,
            decision=approval.decision,
            modified=approval.modified,
            explanation=approval.explanation,
        )
    )
