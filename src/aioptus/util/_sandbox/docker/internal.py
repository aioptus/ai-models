from aioptus._util.constants import PKG_PATH
from aioptus._util.display import display_type
from aioptus._util.error import PrerequisiteError
from aioptus.util._subprocess import subprocess

aioptus_WEB_BROWSER_IMAGE_DOCKERHUB = "aioptus-web-browser-tool"

aioptus_WEB_BROWSER_IMAGE = "aioptusweb_browser"

INTERNAL_IMAGES = {
    aioptus_WEB_BROWSER_IMAGE: PKG_PATH
    / "tool"
    / "_tools"
    / "_web_browser"
    / "_resources"
}


async def is_internal_image_built(image: str) -> bool:
    result = await subprocess(
        ["docker", "images", "--filter", f"reference={image}", "--format", "json"]
    )
    return len(result.stdout.strip()) > 0


async def build_internal_image(image: str) -> None:
    args = [
        "docker",
        "build",
        "--tag",
        image,
        "--progress",
        "plain" if display_type() == "plain" else "auto",
    ]
    if display_type() == "none":
        args.append("--quiet")
    result = await subprocess(
        args + [INTERNAL_IMAGES[image].as_posix()],
        capture_output=False,
    )
    if not result.success:
        raise PrerequisiteError(f"Unexpected error building Docker image '{image}'")


def is_internal_image(image: str) -> bool:
    return any([image == internal for internal in INTERNAL_IMAGES.keys()])
