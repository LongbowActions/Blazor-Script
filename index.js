const core = require('@actions/core');
const github = require("@actions/github");
const wait = require('./wait');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const ms = core.getInput('milliseconds');
    core.info(`Waiting ${ms} milliseconds ...`);

    core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    await wait(parseInt(ms));
    core.info((new Date()).toTimeString());

    core.setOutput('time', new Date().toTimeString());
    
    const githubToken = process.env["GITHUB_TOKEN"];
    if (!githubToken) {
      core.setFailed("GITHUB_TOKEN does not exist.");
      return;
    }
    
    const context = github.context; 
    const octokit  = github.getOctokit(githubToken);
    const { owner, repo } = context.repo;
    const labels = ['bug', 'test']
    const issueNumber = context.issue.number;

    core.info(`Add labels: ${labels} to ${owner}/${repo}#${issueNumber}`);

    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', {
      owner: owner,
      repo: repo,
      issue_number: issueNumber,
      labels: [
        'bug',
        'enhancement'
      ]
    })
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
