// The messages/*.json files nest to arbitrary depth with string leaves —
// this is the standard recursive shape for "arbitrary JSON object", sound
// without needing `any`.
export type MessagesTree = { [key: string]: string | MessagesTree };
