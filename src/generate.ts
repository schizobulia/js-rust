import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import * as types from './types'
import * as codeGen from './codeGen'


export function generate(rootDir: string, rootNames: string[]) : Map<string, string> {
    const program = createProgram(rootDir, rootNames)
    const typeCheck = program.getTypeChecker()
    const result = new Map<string, string>()
    program.getRootFileNames().forEach((ele: string) => {
        const node = getFileOutcome(program, ele, typeCheck)
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

function initializerValue(node: ts.Node): types.Node | undefined {
    const kine = node.kind;
    switch (kine) {
        case ts.SyntaxKind.StringLiteral:
            return types.stringLiteral(node.getText())

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