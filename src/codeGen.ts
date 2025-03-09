import { NodeKind, Node, 
    VariableDeclarationList, Keyword,
    StringLiteral, FunctionDeclaration, 
    BinaryExpression} from './types'
import { SpaceCharacter } from './tool'

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
        case NodeKind.FunctionDeclaration:
            nodeCode += generateFunctionDeclaration(node as FunctionDeclaration)
            break
        case NodeKind.BinaryExpression:
            nodeCode += generateBinaryExpression(node as BinaryExpression)
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
    return code += ';\n'
}

function generateFunctionDeclaration(functionDeclaration: FunctionDeclaration): string {
    let code = `fn ${functionDeclaration.name.name}() {`
    if (functionDeclaration.body.length) {
        code += '\n'
        functionDeclaration.body.forEach((ele) => {
            code += `${SpaceCharacter}${generate(ele)}`
        })
    }
    return code + '\n}\n';
}

function generateBinaryExpression(binaryExpression: BinaryExpression): string {
    let code = `${binaryExpression.left.name}`
    if (binaryExpression.right) {
        code += ` = ${literalGenerate(binaryExpression.right)}`
    }
    return code
}

function literalGenerate(node: Node): string {
    const kind = node.kind;
    switch (kind) {
        case NodeKind.StringLiteral:
            const stringLiteral = node as StringLiteral;
            return stringLiteral.value;
        case NodeKind.u8Literal:
        case NodeKind.u16Literal:
        case NodeKind.u32Literal:
        case NodeKind.u64Literal:
        case NodeKind.u128Literal:
        case NodeKind.i8Literal:
        case NodeKind.i16Literal:
        case NodeKind.i32Literal:
        case NodeKind.i64Literal:
        case NodeKind.i128Literal:
        case NodeKind.f32Literal:
        case NodeKind.f64Literal:
            return (node as any).value;
        case NodeKind.boolLiteral:
            return (node as any).value;
        default:
            break;
    }
    return ''
}

function keyWordGenerate(params: Keyword): string {
    const name = params.name
    if (name === 'var') {
        return 'let mut'
    }
    if (name === 'const') {
        return 'let'
    }
    if (name === 'let') {
        return 'let mut'
    }
    return params.name
}

function forEachNode(node: Node) {
    return node.child
}