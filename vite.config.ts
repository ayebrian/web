import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import manifest from './package.json';
import {execFileSync} from 'child_process';

function run(cmd: string, args: string[]) {
    try {
        return execFileSync(cmd, args).toString().trim();
    } catch (error) {
        if (
            error &&
            typeof error === 'object' &&
            'stdout' in error &&
            Buffer.isBuffer(error.stdout)
        ) {
            const stdout = error.stdout.toString().trim();
            if (stdout) return stdout;
        }
        throw error;
    }
}

function getGitBranchFormatted(): string | null {
    try {
        const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
        return branch.replace(/[^0-9A-Za-z-]/g, '-');
    } catch (error) {
        console.error('Error occurred while fetching git branch:', error);
        return null;
    }
}

function getCommitHash(): string | null {
    try {
        return run('git', ['rev-parse', '--short', 'HEAD']);
    } catch (error) {
        console.error('Error occurred while fetching commit hash:', error);
        return null;
    }
}

function appVersionPlugin(): Plugin {
    const appVersion = manifest.version;
    const gitBranchName = getGitBranchFormatted();
    const gitCommitHash = getCommitHash();

    const longVersionName = gitBranchName
        ? `${appVersion}-${gitBranchName}+${gitCommitHash}`
        : `${appVersion}-release`;

    return {
        name: 'app-version',
        config: () => ({
            define: {
                'import.meta.env.VITE_APP_VERSION':
                    JSON.stringify(longVersionName),
            },
        }),
    };
}

export default defineConfig({
    plugins: [react(), appVersionPlugin()],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
