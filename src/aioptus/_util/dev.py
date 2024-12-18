import os


def is_dev_mode() -> bool:
    return os.environ.get("aioptus_DEV_MODE", None) is not None
