
export class SyncResult {
    models: [{
        instruction: SyncInstruction,
        data: any
    }]
    requests: [{
        instruction: SyncInstruction,
        data: any
    }]
}

enum SyncInstruction {
    Create,
    Delete,
    Update,
}
