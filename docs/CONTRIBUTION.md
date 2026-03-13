# How To Contribute
All work on Friendly Web happens directly on GitHub. Both core team members and external contributors submit pull requests which go through the same review process.

# Semantic Versioning
This project follows <a href="https://semver.org/">semantic versioning</a>. We release patch versions for critical bug fixes, minor versions for new features or non-essential changes, and major versions for any breaking or major changes.

Full version format: `major.minor.patch-branch+commit`

# Branch Organisation
Submit all changes only to the <a href="https://github.com/friendly-social/web/tree/dev">dev branch</a>. Code that lands in the `dev` branch can contain any kind of changes related to project and its goals. Core team can create alternative branches based on the dev branch instead of working in forks.

# Bugs
For any Web client related bugs and problems we use <a href="https://github.com/friendly-social/web/issues">GitHub Issues</a>. We keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new commit, try to make sure your problem doesn’t already exist.

# Proposing A Change
If you intend to implement a new feature, enhance existing implementation, fix a bug or something else - we recomment filing an <a href="https://github.com/friendly-social/web/issues">issue</a> first. This lets us reach an agreement on your changes before you put significant effort into it.

# Your Pull Request
If you decide to fix an issue, please be sure to check the comment thread and existing pull requests in case if somebody is already working on it. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it. If somebody claims an issue but doesn't follow up for some time - it is fine to take it over.

# Development Workflow
After cloning repo, run `bun install` to fetch its dependencies. Then, you can run several commands:
* `bun lint` checks the code style.
* `bun format` will reformat code where it's possible.
* `bun build` to build production-ready app.
* `bun dev` to start dev server.

# Style Guide
We use an automatic code formatter called Prettier. However, there are still some style rules that the linter cannot pick up. Right now we don't have code style document, so feel free to ask us.

# How To Get In Touch
* <a href="https://github.com/friendly-social/knowledge/discussions">Discussions</a>
* <a href="https://github.com/friendly-social/web/issues">Issues</a> (as mentioned in previews paragraph)

# License
By contributing to this repo, you agree that your contributions will be licensed under its GPL-2.0 license.