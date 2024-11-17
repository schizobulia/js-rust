export enum NodeKind {
    KeyWord,
    VariableDeclarationList,
    Identifier,
    StringLiteral,
    None
}

export interface Node {
    child: Node[],
    kind: NodeKind
}

export interface Keyword extends Node {
    name: string,
}

export interface VariableDeclarationList extends Node {
    statementKeyWord: Keyword | undefined,
    identifiers: Identifier[],
    values: Node[]
}

export interface Identifier extends Node {
    name: string
}

export interface StringLiteral extends Node {
    value: string
}

export function identifier(child: Node[], name: string): Identifier {
    return { child, name, kind: NodeKind.Identifier }
}

export function stringLiteral(value: string): StringLiteral {
    return { value, child: [], kind: NodeKind.StringLiteral }
}

export function numericLiteral() {

}

export function variableDeclarationList(
    child: Node[],
    statementKeyWord: Keyword | undefined,
    identifiers: Identifier[],
    values: Node[]): VariableDeclarationList {
    return { child, statementKeyWord, identifiers, kind: NodeKind.VariableDeclarationList, values }
}

export function letKeyword(child: Node[], name: string): Keyword {
    return { child, name, kind: NodeKind.KeyWord }
}
