from aioptus import Task, task


@task
def first():
    return Task([])


@task(name="second_task")
def second():
    return Task([])
