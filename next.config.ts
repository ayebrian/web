import type {NextConfig} from 'next';
import manifest from './package.json';
import {execSync} from 'child_process';
import createNextIntlPlugin from 'next-intl/plugin';

function run(cmd: string) {
    return execSync(cmd).toString().trim();
}

function getGitBranchFormatted(): string | null {
    try {
        const branch = run('git rev-parse --abbrev-ref HEAD');
        return branch.replace(/[^0-9A-Za-z-]/g, '-');
    } catch (error) {
        console.error('Error occurred while fetching git branch:', error);
        return null;
    }
}

function getCommitHash(): string | null {
    try {
        return run('git rev-parse --short HEAD');
    } catch (error) {
        console.error('Error occurred while fetching commit hash:', error);
        return null;
    }
}

const appVersion = manifest.version;
const gitBranchName = getGitBranchFormatted();
const gitCommitHash = getCommitHash();

const longVersionName = gitBranchName
    ? `${appVersion}-${gitBranchName}+${gitCommitHash}`
    : '${appVersion}-release';

const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = withNextIntl({
    output: 'standalone',
    basePath: '',
    images: {
        unoptimized: false,
    },
    env: {
        NEXT_PUBLIC_APP_VERSION: longVersionName,
    },
});

export default nextConfig;
