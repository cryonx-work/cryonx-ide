
import git from 'isomorphic-git';
import { fs } from '@zenfs/core';
import { GitChange, Commit } from '@/types';

export class GitService {

    async init(dir: string) {
        await git.init({ fs, dir });
    }

    async getStatus(dir: string): Promise<{ staged: GitChange[], unstaged: GitChange[] }> {
        const matrix = await git.statusMatrix({ fs, dir });
        const staged: GitChange[] = [];
        const unstaged: GitChange[] = [];

        for (const [filepath, head, workdir, stage] of matrix) {
            // Ignore system files and folders
            if (filepath.startsWith('.project') || filepath.startsWith('.git')) continue;

            // Unstaged Changes
            if (head === 0 && workdir === 2 && stage === 0) {
                unstaged.push({ fileId: filepath, path: filepath, status: 'new' });
            }
            else if (workdir === 2 && workdir !== stage) {
                unstaged.push({ fileId: filepath, path: filepath, status: 'modified' });
            }
            else if (workdir === 0 && stage !== 0) {
                unstaged.push({ fileId: filepath, path: filepath, status: 'deleted' });
            }

            // Staged Changes
            if (stage === 2 && head === 0) {
                staged.push({ fileId: filepath, path: filepath, status: 'new' });
            }
            else if (stage === 2 && head === 1) {
                staged.push({ fileId: filepath, path: filepath, status: 'modified' });
            }
            else if (stage === 0 && head === 1) {
                staged.push({ fileId: filepath, path: filepath, status: 'deleted' });
            }
        }

        return { staged, unstaged };
    }

    async add(dir: string, filepath: string) {
        await git.add({ fs, dir, filepath });
    }

    async reset(dir: string, filepath: string) {
        await git.resetIndex({ fs, dir, filepath });
    }

    async remove(dir: string, filepath: string) {
        await git.remove({ fs, dir, filepath });
    }

    async commit(dir: string, message: string, author: { name: string; email: string }) {
        return await git.commit({
            fs,
            dir,
            message,
            author
        });
    }

    async log(dir: string): Promise<Commit[]> {
        try {
            const commits = await git.log({ fs, dir, depth: 20 });
            return commits.map(c => ({
                hash: c.oid,
                message: c.commit.message,
                timestamp: c.commit.author.timestamp * 1000,
                author: c.commit.author.name,
                changesCount: 0 // TODO: Calculate changes count if needed
            }));
        } catch (e) {
            return [];
        }
    }

    async checkGitFolder(dir: string): Promise<boolean> {
        try {
            const stat = await fs.promises.stat(`${dir}/.git`);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    async deleteIndex(dir: string) {
        try {
            await fs.promises.unlink(`${dir}/.git/index`);
        } catch (e) {
            // Ignore if it doesn't exist
        }
    }
}

export const gitService = new GitService();