import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import type {GitHub} from '@actions/github/lib/utils'
export default class GithubApi {
  private client: InstanceType<typeof GitHub>
  constructor(private readonly token: string) {
    this.client = getOctokit(token)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async getModifiedFiles(base: string, head: string) {
    // Debug log the payload.
    core.debug(`Payload keys: ${Object.keys(context.payload)}`)

    // Log the base and head commits
    core.info(`Base commit: ${base}`)
    core.info(`Head commit: ${head}`)

    // Ensure that the base and head properties are set on the payload.
    if (!base || !head) {
      core.setFailed(
        `The base and head commits are missing from the payload for this ${context.eventName} event. ` +
          "Please submit an issue on this action's GitHub repo."
      )
      // To satisfy TypeScript, even though this is unreachable.
    }

    // https://developer.github.com/v3/repos/commits/#compare-two-commits
    return this.client.request(
      'GET /repos/{owner}/{repo}/compare/{base}...{head}',
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        base,
        head
      }
    )
    // .then(response => {
    //   core.debug(`Response: ${response}`)
    //   core.debug(`Response data: ${response.data}`)
    //   core.debug(`Response data files: ${response.data.files}`)
    //   core.debug(`Response status: ${response.status}`)
    //
    //   if (response.status !== 200) {
    //     core.setFailed(
    //       `The GitHub API for comparing the base and head commits for this ${context.eventName} event returned ${response.status}, expected 200. ` +
    //         "Please submit an issue on this action's GitHub repo."
    //     )
    //   }
    //
    //   // Ensure that the head commit is ahead of the base commit.
    //   if (response.data.status !== 'ahead') {
    //     core.setFailed(
    //       `The head commit for this ${context.eventName} event is not ahead of the base commit. ` +
    //         "Please submit an issue on this action's GitHub repo."
    //     )
    //   }
    //
    //   // Get the changed files from the response payload.
    //   return response.data.files
    // })
    // Use GitHub's compare two commits API.
    // https://developer.github.com/v3/repos/commits/#compare-two-commits
    // const response = await this.client.repos.compareCommits({
    //   base,
    //   head,
    //   owner: context.repo.owner,
    //   repo: context.repo.repo
    // })

    // Ensure that the request was successful.
  }
}
