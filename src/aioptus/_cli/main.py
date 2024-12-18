import click

from aioptus._util.dotenv import init_dotenv
from aioptus._util.error import set_exception_hook

from .. import __version__
from .cache import cache_command
from .eval import eval_command, eval_retry_command, eval_set_command
from .info import info_command
from .list import list_command
from .log import log_command
from .sandbox import sandbox_command
from .score import score_command
from .view import view_command


@click.group(invoke_without_command=True)
@click.option(
    "--version",
    type=bool,
    is_flag=True,
    default=False,
    help="Print the aioptus version.",
)
@click.pass_context
def aioptus(ctx: click.Context, version: bool) -> None:
    # if this was a subcommand then allow it to execute
    if ctx.invoked_subcommand is not None:
        return

    if version:
        print(__version__)
        ctx.exit()
    else:
        click.echo(ctx.get_help())
        ctx.exit()


aioptus.add_command(cache_command)
aioptus.add_command(eval_command)
aioptus.add_command(eval_set_command)
aioptus.add_command(eval_retry_command)
aioptus.add_command(info_command)
aioptus.add_command(list_command)
aioptus.add_command(log_command)
aioptus.add_command(score_command)
aioptus.add_command(view_command)
aioptus.add_command(sandbox_command)


def main() -> None:
    set_exception_hook()
    init_dotenv()
    aioptus(auto_envvar_prefix="aioptus")


if __name__ == "__main__":
    main()
