// src/codemods.js

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');

// Codemod #1: Replaces `_.isNil(x)` with `x == null`.
function applyLodashIsNilOptimization(sourceCode) {
    // This function is correct and remains unchanged.
    let changes = 0;
    const ast = parser.parse(sourceCode, { sourceType: 'unambiguous', plugins: ['typescript'] });
    traverse(ast, {
        CallExpression(path) {
            const callee = path.get('callee');
            if (callee.isMemberExpression() && callee.get('object').isIdentifier({ name: '_' }) && callee.get('property').isIdentifier({ name: 'isNil' }) && path.get('arguments').length === 1) {
                const replacementNode = t.binaryExpression('==', path.get('arguments')[0].node, t.nullLiteral());
                path.replaceWith(replacementNode);
                changes++;
            }
        },
    });
    return { code: changes > 0 ? generator(ast, {}, sourceCode).code : sourceCode, changes };
}

// Codemod #2: Transforms `const _ = require('lodash')` into specific, tree-shakeable requires.
function applyLodashNamedImportsOptimization(sourceCode) {
    let changes = 0;
    const ast = parser.parse(sourceCode, { sourceType: 'unambiguous' });
    let lodashDefaultAlias = null;
    let requirePath = null;

    traverse(ast, {
        VariableDeclarator(path) {
            const init = path.get('init');
            if (init.isCallExpression() && init.get('callee').isIdentifier({ name: 'require' }) && init.get('arguments.0')?.isStringLiteral({ value: 'lodash' })) {
                if (path.get('id').isIdentifier()) {
                    lodashDefaultAlias = path.get('id').node.name;
                    requirePath = path.parentPath;
                    path.stop();
                }
            }
        }
    });

    if (!lodashDefaultAlias) {
        return { code: sourceCode, changes: 0 };
    }

    const usedMemberNames = new Set();
    traverse(ast, {
        MemberExpression(path) {
            if (path.get('object').isIdentifier({ name: lodashDefaultAlias })) {
                const property = path.get('property');
                if (property.isIdentifier()) {
                    const memberName = property.node.name;
                    usedMemberNames.add(memberName);
                    path.replaceWith(t.identifier(memberName));
                    changes++;
                }
            }
        }
    });

    if (usedMemberNames.size > 0) {
        // --- THIS IS THE NEW, CORRECT LOGIC ---
        // Create a list of new `const` declarations.
        const newDeclarations = Array.from(usedMemberNames).sort().map(name => {
            const requireCall = t.callExpression(t.identifier('require'), [t.stringLiteral(`lodash/${name}`)]);
            const declarator = t.variableDeclarator(t.identifier(name), requireCall);
            return t.variableDeclaration('const', [declarator]);
        });

        // Replace the single `const _ = require('lodash');` with multiple declarations.
        requirePath.replaceWithMultiple(newDeclarations);
        changes++;
    }

    return { code: changes > 0 ? generator(ast, {}, sourceCode).code : sourceCode, changes };
}

// Codemod #3: Replaces `moment().format('YYYY-MM-DD')` with a native helper function.
function applyMomentFormatOptimization(sourceCode) {
    // This function is correct and remains unchanged.
    let changes = 0;
    const ast = parser.parse(sourceCode, { sourceType: 'unambiguous' });
    let helperInjected = false;
    const HELPER_FUNCTION_NAME = '_nodeOpti_format_YYYY_MM_DD';
    traverse(ast, {
        CallExpression(path) {
            const callee = path.get('callee');
            if (callee.isMemberExpression() && callee.get('property').isIdentifier({ name: 'format' }) && callee.get('object').isCallExpression() && callee.get('object').get('callee').isIdentifier({ name: 'moment' })) {
                const formatArgs = path.get('arguments');
                if (formatArgs.length === 1 && formatArgs[0].isStringLiteral({ value: 'YYYY-MM-DD' })) {
                    if (!helperInjected) {
                        const helperAST = parser.parse(`function ${HELPER_FUNCTION_NAME}(){const d=new Date();const year=d.getFullYear();const month=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return \`\${year}-\${month}-\${day}\`;}`);
                        path.findParent((p) => p.isProgram()).get('body.0').insertBefore(helperAST);
                        helperInjected = true;
                        changes++;
                    }
                    path.replaceWith(t.callExpression(t.identifier(HELPER_FUNCTION_NAME), []));
                    changes++;
                }
            }
        }
    });
    return { code: changes > 0 ? generator(ast, {}, sourceCode).code : sourceCode, changes };
}

module.exports = {
    applyLodashIsNilOptimization,
    applyLodashNamedImportsOptimization,
    applyMomentFormatOptimization,
};