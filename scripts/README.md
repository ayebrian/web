# Scripts

This directory contains a set of scripts used to automate workflow that we have in this project. It depends on a very simple `minishell` library that allows you to mix shell instructions with Python control flow syntax like this:

```python3
HELP = """..."""

if shell.args.help:
    shell.exit(HELP)

shell("shell command")
```

It's extremely simple and readable. The whole library is a [single file](https://github.com/y9san9/minishell/blob/main/src/minishell/minishell.py).

## Install

People who are not familiar with Python Ecosystem might not understand how to install this package, because modern pip3 prevents global installs by default to protect system environments. This decision was made, because devs (ab)used pip3 and uploaded their apps with their own environment to pip3 and asked users to install this app globally. Which is obviously an incorrent thing to do with apps.

This solution is a drop-in bash replacement which have to be installed system-wide, so here is a command to do that:

```
pip3 install --break-system-packages --user minishell
```

**It will not break any system packages.** Because this library is only uploaded to pip3. After installation you can start scripts like any other shell scripts: `scripts/pr`, `scripts/amend`, etc.
