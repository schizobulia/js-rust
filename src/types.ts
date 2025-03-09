export enum NodeKind {
    KeyWord,
    VariableDeclarationList,
    Identifier,
    StringLiteral,
    FunctionDeclaration,
    BinaryExpression,
    u8Literal,
    u16Literal,
    u32Literal,
    u64Literal,
    u128Literal,
    i8Literal,
    i16Literal,
    i32Literal,
    i64Literal,
    i128Literal,
    f32Literal,
    f64Literal,
    boolLiteral,
    charLiteral,
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

export interface NumberLiteral extends Node {
    value: number
}

export interface BooleanLiteral extends Node {
    value: boolean
}

export interface FunctionDeclaration extends Node {
    name: Identifier,
    parameters: Identifier[],
    body: Node[]
}

export interface BinaryExpression extends Node {
    left: Identifier,
    right: Node | undefined
}

export function identifier(child: Node[], name: string): Identifier {
    return { child, name, kind: NodeKind.Identifier }
}

export function stringLiteral(value: string): StringLiteral {
    return { value, child: [], kind: NodeKind.StringLiteral }
}

export function numericLiteral(value: number, kind: NodeKind): NumberLiteral {
    return { value: Number(value), child: [], kind: kind }
}

export function booleanLiteral(value: boolean): BooleanLiteral {
    return { value: value, child: [], kind: NodeKind.boolLiteral }
}

export function functionDeclaration(
    child: Node[],
    name: Identifier,
    parameters: Identifier[],
    body: Node[]): FunctionDeclaration {
    return { child, name, parameters, body, kind: NodeKind.FunctionDeclaration }
}

export function binaryExpression(left: Identifier, right: Node | undefined): BinaryExpression {
    return { left: left, right: right, child: [], kind: NodeKind.BinaryExpression }
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

export function constKeyword(child: Node[], name: string): Keyword {
    return { child, name, kind: NodeKind.KeyWord }
}
