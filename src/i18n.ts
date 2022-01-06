import { MultilingualString } from "./types";

export function i(node: MultilingualString, lang: string) {
    return node[lang] || node.d;
}