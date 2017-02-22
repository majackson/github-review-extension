# GitHub Code Review Extension

![Github Code Review in action](http://i.imgur.com/5nwfkvkg.png)

Github Code Review tool working on [resin.io's etcher project](https://github.com/resin-io/etcher).

## What is it?

This is a small extension for Google Chrome which adds emoji summaries of GitHub code reviews to the pull requests view for any project on Github.com.

For it to work, you must be using Github for code review.

When a contributor has approved a review, this will appear as a thumbs up emoji in the pull request view, when changes have been requested, it will appear as a thumbs down. When it looks like a reviewer has asked a question, this will appear as a question mark. Note that only the most recent approval/change-request for each reviewer will be counted.

You can install the extension [from the Chrome Web Store](https://chrome.google.com/webstore/detail/github-code-review-assist/ahfdplhndnhikceojhjahaahnfcneahm), or you can just clone this extension's code from here and run it in developer mode.

## What isn't it?

* The tool as it stands does not work with GitHub Enterprise. If you want it to do that, I'd suggest you clone this repo, adjust the URLs in the manifest and either submit the extenstion to the web store, or just run it yourself in developer mode.

## Caveats

* Doesn't currently work when there are multiple pages of comments (only reads the first page) - I'll probably look at this in future.
