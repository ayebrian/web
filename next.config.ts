import type {NextConfig} from 'next';
import manifest from './package.json';
import {execSync} from 'child_process';

function run(cmd: string) {
    return execSync(cmd).toString().trim();
}

function getGitBranchFormatted(): string {
    const branch = run('git rev-parse --abbrev-ref HEAD');
    return branch.replace(/[^0-9A-Za-z-]/g, '-');
}

function getCommitHash(): string {
    return run('git rev-parse --short HEAD');
}

const longVersionName = `${manifest.version}-${getGitBranchFormatted()}+${getCommitHash()}`;

const nextConfig: NextConfig = {
    output: 'export',
    basePath: '',
    images: {
        unoptimized: true,
    },
    env: {
        NEXT_PUBLIC_APP_VERSION: longVersionName,
    },
};

export default nextConfig;
