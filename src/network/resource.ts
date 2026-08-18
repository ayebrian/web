import {QueryState} from '@tanstack/react-query';
import {UseQueryResult} from '@tanstack/react-query';

export type ResourceCache = 'empty' | 'fail' | 'ok';
export type ResourceFetch = 'idle' | 'waiting' | 'loading';

export interface Resource<T> {
    cache: ResourceCache;
    fetch: ResourceFetch;
    data?: T;
    hasLoading: boolean;
}

export interface ResourceOfOptions<T> {
    cache: ResourceCache;
    fetch: ResourceFetch;
    data?: T;
}

function of<T>({cache, fetch, data}: ResourceOfOptions<T>): Resource<T> {
    return {
        cache,
        fetch,
        data,
        hasLoading: fetch !== 'idle',
    };
}

function ofQuery<T>(state?: QueryState): Resource<T> {
    if (state === undefined) {
        return of({cache: 'empty', fetch: 'idle'});
    }
    const {status, data, fetchStatus} = state;
    let cacheResult: ResourceCache;
    switch (status) {
        case 'pending':
            cacheResult = 'empty';
            break;
        case 'success':
            cacheResult = 'ok';
            break;
        case 'error':
            cacheResult = 'fail';
            break;
    }
    let fetchResult: ResourceFetch;
    switch (fetchStatus) {
        case 'idle':
            fetchResult = 'idle';
            break;
        case 'paused':
            fetchResult = 'waiting';
            break;
        case 'fetching':
            fetchResult = 'loading';
            break;
    }
    return of({cache: cacheResult, fetch: fetchResult, data: data as T});
}

function ofUseQuery<T>(result: UseQueryResult<T>): Resource<T> {
    if (result === undefined) {
        return of({cache: 'empty', fetch: 'idle'});
    }
    const {status, data, fetchStatus} = result;
    let cacheResult: ResourceCache;
    switch (status) {
        case 'pending':
            cacheResult = 'empty';
            break;
        case 'success':
            cacheResult = 'ok';
            break;
        case 'error':
            cacheResult = 'fail';
            break;
    }
    let fetchResult: ResourceFetch;
    switch (fetchStatus) {
        case 'idle':
            fetchResult = 'idle';
            break;
        case 'paused':
            fetchResult = 'waiting';
            break;
        case 'fetching':
            fetchResult = 'loading';
            break;
    }
    return of({cache: cacheResult, fetch: fetchResult, data: data});
}

export const Resource = {
    of,
    ofQuery,
    ofUseQuery,
};
