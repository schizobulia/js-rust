import { NodeKind, Node, VariableDeclarationList, Keyword, StringLiteral } from './types'

export function generateCode(node: Node): string {
    return generate(node)
}

function generate(node: Node): string {
    const kind = node.kind
    let nodeCode = ''
    switch (kind) {
        case NodeKind.VariableDeclarationList:
            nodeCode += generateVariableDeclaration(node as VariableDeclarationList)
            break
        case NodeKind.Identifier:
            break
        case NodeKind.None:
            forEachNode(node).forEach((ele) => {
                nodeCode += generate(ele)
            })
            break
        default:
            break
    }
    return nodeCode
}

function generateVariableDeclaration(variableDeclaration: VariableDeclarationList): string {
    let code = ''
    if (variableDeclaration.statementKeyWord) {
        code += keyWordGenerate(variableDeclaration.statementKeyWord)
    }
    variableDeclaration.identifiers.forEach((ele) => {
        code += ' ' + ele.name
    })
    code += ' = '
    variableDeclaration.values.forEach((ele) => {
        code += literalGenerate(ele)
    })
    return code += ';'
}

function literalGenerate(node: Node): string {
    const kind = node.kind;
    switch (kind) {
        case NodeKind.StringLiteral:
            const stringLiteral = node as StringLiteral;
            return stringLiteral.value;
    
        default:
            break;
    }
    return ''
}

function keyWordGenerate(params: Keyword): string {
    const name = params.name
    if (name === 'var') {
        return 'let'
    }
    if (name === 'const') {
        return 'let'
    }
    return params.name
}

function forEachNode(node: Node) {
    return node.child
}