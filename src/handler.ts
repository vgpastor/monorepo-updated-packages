import {GitClient} from './git-client'

export class Handler {
  constructor(private readonly git: GitClient) {}
}
