declare interface AssetFetcher {
    fetch(input: Request | string, init?: RequestInit): Promise<Response>;
}

declare interface Ai {
    run(model: string, input: unknown): Promise<any>;
}

// Minimal Workers ambient types to satisfy local typechecking without external deps
declare interface DurableObject {
    fetch(request: Request): Promise<Response>;
}

declare interface DurableObjectStorage {
    get(key: string): Promise<unknown | undefined>;
    put(key: string, value: unknown): Promise<void>;
}

declare interface DurableObjectState {
    storage: DurableObjectStorage;
}

declare interface DurableObjectId {}

declare interface DurableObjectStub {
    fetch(input: Request | string, init?: RequestInit): Promise<Response>;
}

declare interface DurableObjectNamespace {
    idFromName(name: string): DurableObjectId;
    get(id: DurableObjectId): DurableObjectStub;
}

declare interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
}


