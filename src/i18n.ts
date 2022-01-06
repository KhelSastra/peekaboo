import { MultilingualString } from "./types";

export function createI(lang: string) {
    return function i(node: MultilingualString) {
        return node[lang] || node.d;
    }
}