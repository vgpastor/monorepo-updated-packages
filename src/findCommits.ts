import {context} from '@actions/github'
import * as core from '@actions/core'
import {UpdatedCommits} from './DTO/updated-commits'
import * as Context from '@actions/github/lib/context'
import {StatusResult} from 'simple-git'

export class FindCommits {
  find(ctx: Context.Context, status: StatusResult): UpdatedCommits | null {
    core.info(`Action runs ${ctx.eventName}`)
    switch (ctx.eventName) {
      case 'pull_request':
        return new UpdatedCommits(
          ctx.payload.pull_request?.base?.sha,
          ctx.payload.pull_request?.head?.sha
        )
      case 'push':
        return new UpdatedCommits(ctx.payload.before, ctx.payload.after)
      default:
        status.current
        core.setFailed(
          `This action only supports pull requests and pushes, ${ctx.eventName} events are not supported. ` +
            "Please submit an issue on this action's GitHub repo if you believe this in correct."
        )
        return null
    }
  }
}
