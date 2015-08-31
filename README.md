# jenkins-job-branch-changer

Changes the git branch for a set of Jenkins jobs. This saves you from having to go to each job config page and change the branch manually.  



## TODO

- Working spinner
- Show current git branch assigned to jenkins job
- Trigger a build when branch name is changed
- Better error handling - what if the config has no git branch setting?
- Do jobs get updated if popup is closed before request returns? Should this use a background page?
- Use chrome notifications to show failure/success?


## Other Jenkins Chrome Extensions

- https://github.com/justlaputa/jenkins-monitor
- https://github.com/mallowlabs/jenkins-notifier-for-chrome