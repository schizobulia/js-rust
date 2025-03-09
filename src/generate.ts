import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import * as types from './types'
import * as codeGen from './codeGen'
import * as tool from './tool'

export function generate(rootDir: string, rootNames: string[]) : Map<string, string> {
    const program = createProgram(rootDir, rootNames)
    const typeCheck = program.getTypeChecker()
    const result = new Map<string, string>()
    program.getRootFileNames().forEach((ele: string) => {
        const node = getFileOutcome(program, ele, typeCheck)
        fs.writeFileSync(path.join(__dirname, 'visualization', 'html', 'data.js'), `const rootNode = ${JSON.stringify(node, null, 4)}`)
        result.set(ele, codeGen.generateCode(node));
    })
    return result
}

function getFileOutcome(program: ts.Program, filePath: string, typeCheck: ts.TypeChecker): types.Node {
    const nodes = program.getSourceFile(filePath)?.getChildren()
    const outcomeBody: types.Node = {
        child: [],
        kind: types.NodeKind.None
    }
    if (nodes) {
        outcomeBody.child = forEachNode(nodes, typeCheck)
    }
    return outcomeBody
}

function forEachNode(nodes: readonly ts.Node[], typeCheck: ts.TypeChecker): types.Node[] {
    let child: types.Node[] = []
    nodes.forEach((node: ts.Node) => {
        const kind = node.kind
        switch (kind) {
            case ts.SyntaxKind.SyntaxList:
                child = child.concat(forEachNode(node.getChildren(), typeCheck))
                break
            case ts.SyntaxKind.FirstStatement:
                child = child.concat(forEachNode(node.getChildren(), typeCheck))
                break
            case ts.SyntaxKind.VariableDeclarationList:
                child.push(genVariableDeclarationList(node, typeCheck))
                break
            case ts.SyntaxKind.FunctionDeclaration:
                child.push(genFunctionDeclaration(node as ts.FunctionDeclaration, typeCheck))
                break
            case ts.SyntaxKind.BinaryExpression:
                child.push(genBinaryExpression(node as ts.BinaryExpression, typeCheck))
                break;
            case ts.SyntaxKind.ExpressionStatement:
                const expressionStatement = node as ts.ExpressionStatement
                child = child.concat(forEachNode([expressionStatement.expression], typeCheck))
                break
            default:
                break
        }
    })
    return child
}

function genVariableDeclarationList(node: ts.Node, typeCheck: ts.TypeChecker): types.VariableDeclarationList {
    const token = node.getFirstToken()
    let statementKeyWord = undefined
    let variableDeclarationList: types.Node = {
        child: [],
        kind: types.NodeKind.VariableDeclarationList
    }
    if (token?.kind === ts.SyntaxKind.VarKeyword) {
        statementKeyWord = types.letKeyword([], 'let')
    }
    if (token?.kind === ts.SyntaxKind.ConstKeyword) {
        statementKeyWord = types.constKeyword([], 'const')
    }
    if (token?.kind === ts.SyntaxKind.LetKeyword) {
        statementKeyWord = types.letKeyword([], 'let')
    }
    const variable = node as ts.VariableDeclarationList
    const identifiers: types.Identifier[] = []
    const values: types.Node[] = []
    variable.declarations.forEach((ele: ts.VariableDeclaration) => {
        const initializer = ele.initializer
        identifiers.push(types.identifier([], ele.name.getText()))
        if (initializer) {
            const init = initializerValue(initializer)
            if (init) {
                values.push(init)
            }
        } else {
            // const t = typeCheck.getTypeAtLocation(ele)
            // variableDeclarationList.child.push()
        }
    })
    variableDeclarationList = types.variableDeclarationList(variableDeclarationList.child,
        statementKeyWord, identifiers, values)
    return variableDeclarationList as types.VariableDeclarationList
}

function genFunctionDeclaration(node: ts.FunctionDeclaration, typeCheck: ts.TypeChecker): types.FunctionDeclaration {
    const name = types.identifier([], node.name?.getText() || '')
    const parameters: types.Identifier[] = []
    const body: types.Node[] = []
    node.parameters.forEach((ele: ts.ParameterDeclaration) => {
        parameters.push(types.identifier([], ele.name.getText()))
    })
    node.body?.statements.forEach((ele: ts.Statement) => {
        forEachNode([ele], typeCheck).forEach((ele) => {
            body.push(ele)
        })
    })
    return types.functionDeclaration([], name, parameters, body)
}

function genBinaryExpression(node: ts.BinaryExpression, typeCheck: ts.TypeChecker) : types.BinaryExpression {
    const left = node.left;
    const right = node.right;
    const rightNode = initializerValue(right)
    const leftNode = types.identifier([], left.getText())
    return types.binaryExpression(leftNode, rightNode)
}

function initializerValue(node: ts.Node): types.Node | undefined {
    const kine = node.kind;
    switch (kine) {
        case ts.SyntaxKind.StringLiteral:
            return types.stringLiteral(node.getText())
        case ts.SyntaxKind.NumericLiteral:
            const number = Number(node.getText())
            return types.numericLiteral(number,  tool.getRustNumericType(number))
        case ts.SyntaxKind.TrueKeyword:
            return types.booleanLiteral(true)
        case ts.SyntaxKind.FalseKeyword:
            return types.booleanLiteral(false)
        default:
            break;
    }
    return undefined
}

function createProgram(projectPath: string, rootNames: string[]): ts.Program {
    const program = ts.createProgram({
        rootNames: rootNames.map((ele: string) => { return path.join(projectPath, ele) }),
        options: {
            allowJs: true,
            checkJs: true
        },
        host: {
            getSourceFile(fileName: string) {
                return ts.createSourceFile(fileName, fs.readFileSync(fileName).toString(), ts.ScriptTarget.Latest)
            },
            writeFile() { },
            getCanonicalFileName(fileName: string) {
                return path.resolve(fileName).replace(/\\/g, '/')
            },
            useCaseSensitiveFileNames() {
                return true
            },
            getNewLine() {
                return '\n'
            },
            fileExists(fileName: string) {
                return fs.existsSync(fileName)
            },
            getDefaultLibFileName(options: ts.CompilerOptions) {
                return ts.getDefaultLibFilePath(options)
            },
            readFile(fileName: string) {
                return fs.readFileSync(fileName).toString()
            },
            getCurrentDirectory() {
                return projectPath
            }
        }
    })
    return program
}